import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BatchEmail from "@/models/BatchEmail";
import {
  validateApiKey,
  checkRateLimit,
  getRateLimitError,
} from "@/lib/api-auth";
import { randomBytes } from "crypto";
import { setCorsHeaders, handleCorsOptions } from "@/lib/cors";

export async function POST(request: NextRequest) {
  try {
    const { isValid, apiKey, userId } = await validateApiKey(request);
    if (!isValid || !apiKey || !userId) {
      return setCorsHeaders(
        NextResponse.json(
          { error: "Invalid or missing API key" },
          { status: 401 }
        )
      );
    }

    const { recipients, subject, html, text, from } = await request.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return setCorsHeaders(
        NextResponse.json(
          { error: "Recipients array is required" },
          { status: 400 }
        )
      );
    }

    if (recipients.length > 100) {
      return setCorsHeaders(
        NextResponse.json(
          { error: "Maximum 100 recipients allowed per batch" },
          { status: 400 }
        )
      );
    }

    if (!subject || !html) {
      return setCorsHeaders(
        NextResponse.json(
          { error: "Subject and HTML content are required" },
          { status: 400 }
        )
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    const { allowed, limits, dailyCount, monthlyCount } = await checkRateLimit(
      userId
    );
    if (!allowed) {
      return setCorsHeaders(
        getRateLimitError(dailyCount, monthlyCount, limits)
      );
    }

    const batchId = randomBytes(16).toString("hex");

    const batchEmails = recipients.map((email: string) => ({
      userId,
      apiKeyId: apiKey._id,
      to: email,
      subject,
      html,
      text,
      from: from || "SendMailr",
      batchId,
      status: "pending",
    }));

    await BatchEmail.insertMany(batchEmails);

    console.log(
      `📧 API Batch created: ${recipients.length} emails queued for ${userId}`
    );

    return setCorsHeaders(
      NextResponse.json({
        success: true,
        batchId,
        totalEmails: recipients.length,
        message: "Batch emails queued for processing",
        processingStarted: true,
      })
    );
  } catch (error) {
    console.error("API batch email error:", error);
    return setCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}

export function OPTIONS() {
  return handleCorsOptions();
}
