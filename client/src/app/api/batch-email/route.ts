import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BatchEmail from "@/models/BatchEmail";
import User from "@/models/User";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";
import { randomBytes } from "crypto";
import { checkRateLimit, getRateLimitError } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { recipients, subject, html, text, from } = await request.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "Recipients array is required" },
        { status: 400 }
      );
    }

    if (recipients.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 recipients allowed per batch" },
        { status: 400 }
      );
    }

    if (!subject || !html) {
      return NextResponse.json(
        { error: "Subject and HTML content are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: `Invalid email format: ${email}` },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // Check if user has enough emails remaining for this batch
    const { allowed, dailyCount, monthlyCount, limits } = await checkRateLimit(
      decoded.userId
    );

    // Check if the batch size exceeds remaining daily limit
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const lastReset = new Date(user.emailLimits.lastResetDate);
    const daysSinceReset = Math.floor(
      (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24)
    );

    let currentDailyUsed = user.emailLimits.dailyUsed;
    if (daysSinceReset >= 1) {
      currentDailyUsed = 0;
    }

    const remainingDaily = user.emailLimits.dailyLimit - currentDailyUsed;

    if (recipients.length > remainingDaily) {
      return NextResponse.json(
        {
          error: `Not enough daily emails remaining. You have ${remainingDaily} emails left`,
          limits: {
            dailyLimit: user.emailLimits.dailyLimit,
            dailyUsed: currentDailyUsed,
            dailyRemaining: remainingDaily,
          },
        },
        { status: 429 }
      );
    }

    if (!allowed) {
      return getRateLimitError(dailyCount, monthlyCount, limits);
    }

    const batchId = randomBytes(16).toString("hex");

    const batchEmails = recipients.map((email: string) => ({
      userId: decoded.userId,
      to: email,
      subject,
      html,
      text,
      from: from || "Emailer",
      batchId,
      status: "pending",
      priority: "normal",
      attempts: 0,
      maxAttempts: 3,
    }));

    await BatchEmail.insertMany(batchEmails);

    // Increment user's email count for the entire batch
    await User.findByIdAndUpdate(decoded.userId, {
      $inc: {
        "emailLimits.dailyUsed": recipients.length,
        "emailLimits.monthlyUsed": recipients.length,
      },
    });

    // Notify the Express worker server that new emails are available
    try {
      const workerUrl = process.env.EMAIL_WORKER_URL || "http://localhost:4000";
      await fetch(`${workerUrl}/api/v1/worker/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.warn("Failed to notify worker server:", error);
      // Don't fail the request if worker notification fails
    }

    return NextResponse.json({
      success: true,
      batchId,
      totalEmails: recipients.length,
      message: "Batch emails queued for processing",
    });
  } catch (error) {
    console.error("Batch email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
