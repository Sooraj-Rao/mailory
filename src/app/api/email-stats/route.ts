import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EmailLog from "@/models/EmailLog";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";
import mongoose from "mongoose";

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

    const userId = new mongoose.Types.ObjectId(decoded.userId);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [todayStats, totalStats, recentEmails] = await Promise.all([
      EmailLog.aggregate([
        { $match: { userId, sentAt: { $gte: today } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      EmailLog.aggregate([
        { $match: { userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      EmailLog.find({ userId })
        .sort({ sentAt: -1 })
        .limit(3)
        .select("to subject status sentAt messageId"),
    ]);

    const todayCount = todayStats.reduce((acc, stat) => acc + stat.count, 0);
    const sentToday = todayStats.find((s) => s._id === "sent")?.count || 0;
    const failedToday = todayStats.find((s) => s._id === "failed")?.count || 0;

    const totalSent = totalStats.find((s) => s._id === "sent")?.count || 0;
    const totalFailed = totalStats.find((s) => s._id === "failed")?.count || 0;

    return NextResponse.json({
      today: {
        sent: sentToday,
        failed: failedToday,
        total: todayCount,
        remaining: Math.max(0, 50 - todayCount),
      },
      total: {
        sent: totalSent,
        failed: totalFailed,
        total: totalSent + totalFailed,
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
