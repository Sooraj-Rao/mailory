/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { handleCorsOptions, setCorsHeaders } from "@/lib/cors";
import {
  checkRateLimit,
  getApiKeyError,
  getRateLimitError,
  validateApiKey,
} from "@/lib/api-auth";
import EmailLog from "@/models/EmailLog";
import { validateAndExtractDomain } from "../helper/email-name-extract";
import { Domain } from "@/models/Domain";

export async function POST(request: NextRequest) {
  try {
    console.log("request.headers", request.headers.get('mailory-authorization'));
    console.log("request", request);
    const { isValid, apiKey, userId } = await validateApiKey(request);
    if (!isValid || !apiKey || !userId) {
      return setCorsHeaders(getApiKeyError());
    }

    const { allowed, dailyCount, monthlyCount, limits } = await checkRateLimit(
      userId
    );
    if (!allowed) {
      return setCorsHeaders(
        getRateLimitError(dailyCount, monthlyCount, limits)
      );
    }

    const { to, subject, text, html, from } = await request.json();

    if (!from || !to || !subject || (!text && !html)) {
      return setCorsHeaders(
        NextResponse.json(
          {
            error: "Missing required fields",
            required: ["to", "subject", "text or html", "from"],
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

    const emailLog = new EmailLog({
      userId,
      apiKeyId: apiKey._id,
      to: Array.isArray(to) ? to.join(", ") : to,
      from,
      subject,
      status: "queued",
    });

    try {
      const workerUrl = process.env.EMAIL_WORKER_URL || "http://localhost:4000";
      const response = await fetch(`${workerUrl}/api/v1/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          text,
          html,
          from,
          apiKeyId: apiKey._id,
          userId: userId._id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.details || result.error || "Failed to send email"
        );
      }

      emailLog.status = "sent";
      emailLog.messageId = result.messageId;

      await emailLog.save();

      return setCorsHeaders(
        NextResponse.json(
          { success: true, messageId: result.messageId },
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
