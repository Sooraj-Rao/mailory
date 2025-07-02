/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "./mongodb";
import ApiKey from "@/models/ApiKey";
import User from "@/models/User";

const DAILY_EMAIL_LIMIT = 100; //  daily limit

export async function validateApiKey(
  request: NextRequest
): Promise<{ isValid: boolean; apiKey?: any; userId?: string }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { isValid: false };
  }

  const apiKey = authHeader.substring(7);

  try {
    await connectDB();
    console.log(User);
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
  } catch (error) {
    console.log(error);
    return { isValid: false };
  }
}

export async function checkRateLimit(
  userId: string
): Promise<{
  allowed: boolean;
  dailyCount: number;
  monthlyCount: number;
  limits: { daily: number; monthly: number };
}> {
  try {
    await connectDB();

    // Get user with subscription info
    const user = await User.findById(userId);
    if (!user) {
      return {
        allowed: false,
        dailyCount: 0,
        monthlyCount: 0,
        limits: { daily: 0, monthly: 0 },
      };
    }

    // Reset counters if needed
    const now = new Date();
    const lastReset = new Date(user.emailLimits.lastResetDate);

    // Reset daily counter if it's a new day
    if (
      now.getDate() !== lastReset.getDate() ||
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      user.emailLimits.dailyUsed = 0;
    }

    // Reset monthly counter if it's a new month
    if (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      user.emailLimits.monthlyUsed = 0;
    }

    user.emailLimits.lastResetDate = now;
    await user.save();

    const dailyAllowed =
      user.emailLimits.dailyUsed < user.emailLimits.dailyLimit;
    const monthlyAllowed =
      user.emailLimits.monthlyUsed < user.emailLimits.monthlyLimit;

    return {
      allowed: dailyAllowed && monthlyAllowed,
      dailyCount: user.emailLimits.dailyUsed,
      monthlyCount: user.emailLimits.monthlyUsed,
      limits: {
        daily: user.emailLimits.dailyLimit,
        monthly: user.emailLimits.monthlyLimit,
      },
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return {
      allowed: false,
      dailyCount: 0,
      monthlyCount: 0,
      limits: { daily: 0, monthly: 0 },
    };
  }
}

export function getApiKeyError(): NextResponse {
  return NextResponse.json(
    {
      error: "Invalid or missing Authorization header. Use 'Bearer {api_key}'",
    },
    { status: 401 }
  );
}

export function getRateLimitError(
  dailyCount: number,
  monthlyCount: number,
  limits: { daily: number; monthly: number }
): NextResponse {
  return NextResponse.json(
    {
      error: "Rate limit exceeded",
      message: `Daily: ${dailyCount}/${limits.daily}, Monthly: ${monthlyCount}/${limits.monthly}. Upgrade your plan for higher limits.`,
      limits,
      usage: {
        daily: dailyCount,
        monthly: monthlyCount,
      },
    },
    { status: 429 }
  );
}
