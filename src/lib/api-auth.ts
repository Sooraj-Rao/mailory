/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "./mongodb";
import ApiKey from "@/models/ApiKey";
import EmailLog from "@/models/EmailLog";

export async function validateApiKey(
  request: NextRequest
): Promise<{ isValid: boolean; apiKey?: any; userId?: string }> {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return { isValid: false };
  }

  try {
    await connectDB();
    const keyDoc = await ApiKey.findOne({
      keyValue: apiKey,
      isActive: true,
    }).populate("userId");

    if (!keyDoc) {
      return { isValid: false };
    }

    keyDoc.lastUsed = new Date();
    await keyDoc.save();

    return {
      isValid: true,
      apiKey: keyDoc,
      userId: keyDoc.userId._id.toString(),
    };
  } catch {
    return { isValid: false };
  }
}

export async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; count: number }> {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await EmailLog.countDocuments({
      userId,
      sentAt: {
        $gte: today,
        $lt: tomorrow,
      },
      status: { $in: ["sent", "queued"] },
    });

    return { allowed: count < 50, count };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return { allowed: false, count: 0 };
  }
}

export function getApiKeyError(): NextResponse {
  return NextResponse.json(
    { error: "Invalid or missing API key" },
    { status: 401 }
  );
}

export function getRateLimitError(count: number): NextResponse {
  return NextResponse.json(
    {
      error: "Rate limit exceeded",
      message: `You have sent ${count}/50 emails today. Limit resets at midnight.`,
    },
    { status: 429 }
  );
}
