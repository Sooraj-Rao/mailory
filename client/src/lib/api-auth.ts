/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "./mongodb";
import ApiKey from "@/models/ApiKey";
import User from "@/models/User";

export async function validateApiKey(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    console.log("authHeader", authHeader);
    console.log(request.headers);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("1", authHeader);
      return { isValid: false, apiKey: null, userId: null };
    }

    const keyValue = authHeader.substring(7);
    await connectDB();

    const apiKey = await ApiKey.findOne({ keyValue }).populate("userId");
    if (!apiKey) {
      console.log("2", apiKey);
      return { isValid: false, apiKey: null, userId: null };
    }

    await ApiKey.findByIdAndUpdate(apiKey._id, { lastUsed: new Date() });

    return {
      isValid: true,
      apiKey,
      userId: apiKey.userId,
    };
  } catch (error) {
    console.log("3", error);
    console.error("API key validation error:", error);
    return { isValid: false, apiKey: null, userId: null };
  }
}

export async function checkRateLimit(userId: string) {
  try {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return {
        allowed: false,
        dailyCount: 0,
        monthlyCount: 0,
        limits: { dailyLimit: 0, monthlyLimit: 0 },
      };
    }

    const now = new Date();
    const lastReset = new Date(user.emailLimits.lastResetDate);
    const daysSinceReset = Math.floor(
      (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24)
    );

    let dailyUsed = user.emailLimits.dailyUsed;
    let monthlyUsed = user.emailLimits.monthlyUsed;

    if (daysSinceReset >= 1) {
      dailyUsed = 0;
    }

    if (daysSinceReset >= 30) {
      monthlyUsed = 0;
      await User.findByIdAndUpdate(userId, {
        "emailLimits.dailyUsed": 0,
        "emailLimits.monthlyUsed": 0,
        "emailLimits.lastResetDate": now,
      });
    } else if (daysSinceReset >= 1) {
      await User.findByIdAndUpdate(userId, {
        "emailLimits.dailyUsed": 0,
      });
    }

    const dailyAllowed = dailyUsed < user.emailLimits.dailyLimit;
    const monthlyAllowed = monthlyUsed < user.emailLimits.monthlyLimit;

    return {
      allowed: dailyAllowed && monthlyAllowed,
      dailyCount: dailyUsed,
      monthlyCount: monthlyUsed,
      limits: {
        dailyLimit: user.emailLimits.dailyLimit,
        monthlyLimit: user.emailLimits.monthlyLimit,
      },
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return {
      allowed: false,
      dailyCount: 0,
      monthlyCount: 0,
      limits: { dailyLimit: 0, monthlyLimit: 0 },
    };
  }
}

export function getApiKeyError() {
  return NextResponse.json(
    {
      error: "Invalid or missing API key",
      message: "Please provide a valid API key in the Authorization header",
    },
    { status: 401 }
  );
}

export function getRateLimitError(
  dailyCount: number,
  monthlyCount: number,
  limits: any
) {
  const isDaily = dailyCount >= limits.dailyLimit;
  const isMonthly = monthlyCount >= limits.monthlyLimit;

  let message = "Rate limit exceeded. ";
  if (isDaily) {
    message += `Daily limit of ${limits.dailyLimit} emails reached. `;
  }
  if (isMonthly) {
    message += `Monthly limit of ${limits.monthlyLimit} emails reached. `;
  }
  message += "Upgrade your plan for higher limits.";

  return NextResponse.json(
    {
      error: "Rate limit exceeded",
      message,
      limits: {
        daily: {
          limit: limits.dailyLimit,
          used: dailyCount,
          remaining: Math.max(0, limits.dailyLimit - dailyCount),
        },
        monthly: {
          limit: limits.monthlyLimit,
          used: monthlyCount,
          remaining: Math.max(0, limits.monthlyLimit - monthlyCount),
        },
      },
    },
    { status: 429 }
  );
}
