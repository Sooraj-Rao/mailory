import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BatchEmail from "@/models/BatchEmail";
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

    const { allowed, dailyCount, monthlyCount, limits } = await checkRateLimit(
      decoded.userId
    );
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
