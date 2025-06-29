/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { handleCorsOptions, setCorsHeaders } from "@/lib/cors";
import {
  checkRateLimit,
  getApiKeyError,
  getRateLimitError,
  validateApiKey,
} from "@/lib/api-auth";
import connectDB from "@/lib/mongodb";
import EmailLog from "@/models/EmailLog";
import { sendEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { isValid, apiKey, userId } = await validateApiKey(request);
    if (!isValid || !apiKey || !userId) {
      return setCorsHeaders(getApiKeyError());
    }

    const { allowed, count } = await checkRateLimit(userId);
    if (!allowed) {
      return setCorsHeaders(getRateLimitError(count));
    }

    const { to, subject, text, html, from } = await request.json();

    if (!to || !subject || (!text && !html)) {
      return setCorsHeaders(
        NextResponse.json(
          {
            error: "Missing required fields",
            required: ["to", "subject", "text or html"],
          },
          { status: 400 }
        )
      );
    }

    if (typeof to !== "string") {
      return setCorsHeaders(
        NextResponse.json(
          { error: "Recipient email must be a string." },
          { status: 400 }
        )
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(to) ? to : [to];

    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        return setCorsHeaders(
          NextResponse.json(
            { error: `Invalid email format: ${email}` },
            { status: 400 }
          )
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

      return setCorsHeaders(
        NextResponse.json(
          { success: true, messageId: result.MessageId },
          { status: 200 }
        )
      );
    } catch (emailError: any) {
      emailLog.status = "failed";
      emailLog.error = emailError.message;
      await emailLog.save();

      console.error("Email sending error:", emailError);
      return setCorsHeaders(
        NextResponse.json(
          { error: "Failed to send email", details: emailError.message },
          { status: 500 }
        )
      );
    }
  } catch (error) {
    console.error("Send email API error:", error);
    return setCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}

export function OPTIONS() {
  return handleCorsOptions();
}
