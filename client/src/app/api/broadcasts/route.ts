import { type NextRequest, NextResponse } from "next/server";
import BatchEmail from "@/models/BatchEmail";
import {
  validateApiKey,
  checkRateLimit,
  getRateLimitError,
} from "@/lib/api-auth";
import { randomBytes } from "crypto";
import { setCorsHeaders, handleCorsOptions } from "@/lib/cors";
import { Domain } from "@/models/Domain";
import { validateAndExtractDomain } from "../helper/email-name-extract";

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
    const isErrorValidation = validateRequest(
      recipients,
      subject,
      from,
      text,
      html
    );
    if (isErrorValidation) {
      return setCorsHeaders(
        NextResponse.json({ error: isErrorValidation }, { status: 400 })
      );
    }

    const { valid, domain, formatError } = validateAndExtractDomain(from);

    if (!valid) {
      return NextResponse.json({ error: formatError }, { status: 400 });
    }

    if (domain) {
      const isValid = await Domain.findOne({
        $or: [{ domain }, { mailFromDomain: domain }],
        dkimStatus: "verified",
        userId,
      });
      if (!isValid) {
        const isMisTypes = "mailory.site".includes(domain);
        return NextResponse.json(
          {
            error: `Invalid 'from' Domain: ${domain}${
              isMisTypes ? ", You have mistyped 'mailory.site'" : ""
            }`,
          },
          { status: 400 }
        );
      }
    }

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
      from: from || "Mailory",
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
