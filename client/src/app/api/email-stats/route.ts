/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EmailLog from "@/models/EmailLog";
import ApiKey from "@/models/ApiKey";
import User from "@/models/User";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";

export async function GET() {
  try {
    // ApiKey.countDocuments();
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      await User.findByIdAndUpdate(decoded.userId, {
        "emailLimits.dailyUsed": 0,
        "emailLimits.monthlyUsed": 0,
        "emailLimits.lastResetDate": now,
      });
    } else if (daysSinceReset >= 1) {
      await User.findByIdAndUpdate(decoded.userId, {
        "emailLimits.dailyUsed": 0,
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayApiEmails = await EmailLog.find({
      userId: decoded.userId,
      createdAt: { $gte: startOfDay },
    });

    // const todayBatchEmails = await BatchEmail.find({
    //   userId: decoded.userId,
    //   createdAt: { $gte: startOfDay },
    // });

    const todaySent = todayApiEmails.filter((e) => e.status === "sent").length;
    //+ todayBatchEmails.filter((e) => e.status === "sent").length;
    const todayFailed = todayApiEmails.filter(
      (e) => e.status === "failed"
    ).length;
    //  +todayBatchEmails.filter((e) => e.status === "failed").length;
    const todayTotal = todaySent + todayFailed;

    const allApiEmails = await EmailLog.find({ userId: decoded.userId });
    // const allBatchEmails = await BatchEmail.find({ userId: decoded.userId });

    const totalSent = allApiEmails.filter((e) => e.status === "sent").length;
    // +allBatchEmails.filter((e) => e.status === "sent").length;
    const totalFailed = allApiEmails.filter(
      (e) => e.status === "failed"
    ).length;
    // +allBatchEmails.filter((e) => e.status === "failed").length;
    const totalAll = totalSent + totalFailed;

    const recentApiEmails = await EmailLog.find({ userId: decoded.userId })
      .populate("apiKeyId")
      .sort({ sentAt: -1 })
      .limit(10);

    // const recentBatchEmails = await BatchEmail.find({ userId: decoded.userId })
    //   .sort({ createdAt: -1 })
    //   .limit(5);

    // const allRecentEmails = [...recentApiEmails, ...recentBatchEmails];
    const allRecentEmails = [...recentApiEmails];

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
      error: email.error && email.error,
      api: email?.apiKeyId?.keyName,
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
