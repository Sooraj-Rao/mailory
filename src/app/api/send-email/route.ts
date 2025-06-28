/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EmailLog from "@/models/EmailLog";
import {
  validateApiKey,
  checkRateLimit,
  getApiKeyError,
  getRateLimitError,
} from "@/lib/api-auth";
import { sendEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { isValid, apiKey, userId } = await validateApiKey(request);
    if (!isValid || !apiKey || !userId) {
      return getApiKeyError();
    }

    const { allowed, count } = await checkRateLimit(userId);
    if (!allowed) {
      return getRateLimitError(count);
    }

    const { to, subject, text, html, from } = await request.json();

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["to", "subject", "text or html"],
        },
        { status: 400 }
      );
    }

    if (typeof to !== "string") {
      return NextResponse.json(
        {
          error: "Recipient email must be a string.",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(to) ? to : [to];

    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          {
            error: `Invalid email format: ${email}`,
          },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const emailLog = new EmailLog({
      userId,
      apiKeyId: apiKey._id,
      to: Array.isArray(to) ? to.join(", ") : to,
      from: from || "EmailService",
      subject,
      status: "queued",
    });

    try {
      const result = await sendEmail({ to, subject, text, html, from });

      emailLog.status = "sent";
      emailLog.messageId = result.MessageId;
      await emailLog.save();

      return NextResponse.json({
        success: true,
        messageId: result.MessageId,
        to: recipients,
        dailyUsage: {
          sent: count + 1,
          limit: 100,
          remaining: 99 - count,
        },
      });
    } catch (emailError: any) {
      emailLog.status = "failed";
      emailLog.error = emailError.message;
      await emailLog.save();

      console.error("Email sending error:", emailError);
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: emailError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send email API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
