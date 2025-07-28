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

    const isErrorValidation = validateRequest(
      recipients,
      subject,
      from,
      text,
      html
    );
    if (isErrorValidation) {
      return NextResponse.json({ error: isErrorValidation }, { status: 400 });
    }

    await connectDB();

    const { allowed, dailyCount, monthlyCount, limits } = await checkRateLimit(
      decoded.userId
    );

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

    try {
      const workerUrl = process.env.EMAIL_WORKER_URL || "http://localhost:4000";
      await fetch(`${workerUrl}/api/v1/worker/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.warn("Failed to notify worker server:", error);
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

const validateRequest = (
  recipients: string[],
  subject: string,
  from: string,
  text: string,
  html: string
) => {
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return "Recipients array is required";
  }

  if (recipients.length > 100) {
    return "Maximum 100 recipients allowed per batch";
  }

  const fields = [
    { name: "subject", value: subject, error: "Subject is required" },
    { name: "from", value: from, error: "From is required" },
    {
      name: "text or html",
      value: text || html,
      error: "Text content or HTML content are required",
    },
  ];

  for (const field of fields) {
    console.log(field);
    if (!field.value) {
      return field.error;
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const email of recipients) {
    if (!emailRegex.test(email)) {
      return `Invalid email format: ${email}`;
    }
  }

  return false;
};
