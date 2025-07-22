/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EmailLog from "@/models/EmailLog";
import BatchEmail from "@/models/BatchEmail";
import User from "@/models/User";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";

export async function GET() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // Get user data with current limits
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reset daily/monthly counters if needed
    const now = new Date();
    const lastReset = new Date(user.emailLimits.lastResetDate);
    const daysSinceReset = Math.floor(
      (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24)
    );

    let dailyUsed = user.emailLimits.dailyUsed;
    let monthlyUsed = user.emailLimits.monthlyUsed;

    // Reset daily counter if it's a new day
    if (daysSinceReset >= 1) {
      dailyUsed = 0;
    }

    // Reset monthly counter if it's been 30+ days
    if (daysSinceReset >= 30) {
      monthlyUsed = 0;
      // Update the reset date
      await User.findByIdAndUpdate(decoded.userId, {
        "emailLimits.dailyUsed": 0,
        "emailLimits.monthlyUsed": 0,
        "emailLimits.lastResetDate": now,
      });
    } else if (daysSinceReset >= 1) {
      // Just reset daily
      await User.findByIdAndUpdate(decoded.userId, {
        "emailLimits.dailyUsed": 0,
      });
    }

    // Get today's email stats from EmailLog (API emails)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayApiEmails = await EmailLog.find({
      userId: decoded.userId,
      createdAt: { $gte: startOfDay },
    });

    // Get today's batch emails
    const todayBatchEmails = await BatchEmail.find({
      userId: decoded.userId,
      createdAt: { $gte: startOfDay },
    });

    // Calculate today's totals
    const todaySent =
      todayApiEmails.filter((e) => e.status === "sent").length +
      todayBatchEmails.filter((e) => e.status === "sent").length;
    const todayFailed =
      todayApiEmails.filter((e) => e.status === "failed").length +
      todayBatchEmails.filter((e) => e.status === "failed").length;
    const todayTotal = todaySent + todayFailed;

    // Get all-time stats
    const allApiEmails = await EmailLog.find({ userId: decoded.userId });
    const allBatchEmails = await BatchEmail.find({ userId: decoded.userId });

    const totalSent =
      allApiEmails.filter((e) => e.status === "sent").length +
      allBatchEmails.filter((e) => e.status === "sent").length;
    const totalFailed =
      allApiEmails.filter((e) => e.status === "failed").length +
      allBatchEmails.filter((e) => e.status === "failed").length;
    const totalAll = totalSent + totalFailed;

    const recentApiEmails = await EmailLog.find({ userId: decoded.userId })
      .sort({ sentAt: -1 })
      .limit(5);

    const recentBatchEmails = await BatchEmail.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(5);


    const allRecentEmails = [...recentApiEmails, ...recentBatchEmails];

    const allRecentEmailsSorted = allRecentEmails.sort((a, b) => {
      const dateA = a.sentAt
        ? new Date(a.sentAt).getTime()
        : new Date(a.createdAt).getTime();
      const dateB = b.sentAt
        ? new Date(b.sentAt).getTime()
        : new Date(b.createdAt).getTime();
      return dateB - dateA; 
    });

    const topRecentEmails = allRecentEmailsSorted.slice(0, 10);

    const recentEmails = topRecentEmails.map((email) => ({
      to: email.to,
      subject: email.subject,
      status: email.status,
      sentAt: email?.sentAt || email?.createdAt, 
    }));


    return NextResponse.json({
      today: {
        sent: todaySent,
        failed: todayFailed,
        total: todayTotal,
        remaining: Math.max(0, user.emailLimits.dailyLimit - todayTotal),
      },
      total: {
        sent: totalSent,
        failed: totalFailed,
        total: totalAll,
      },
      limits: {
        dailyLimit: user.emailLimits.dailyLimit,
        monthlyLimit: user.emailLimits.monthlyLimit,
        dailyUsed: todayTotal,
        monthlyUsed: monthlyUsed,
        dailyRemaining: Math.max(0, user.emailLimits.dailyLimit - todayTotal),
        monthlyRemaining: Math.max(
          0,
          user.emailLimits.monthlyLimit - monthlyUsed
        ),
      },
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
      },
      recentEmails, 
    });
  } catch (error) {
    console.error("Email stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
