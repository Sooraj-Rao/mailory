import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BatchEmail from "@/models/BatchEmail";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    await connectDB();

    if (batchId) {
      const batchEmails = await BatchEmail.find({
        batchId,
        userId: new mongoose.Types.ObjectId(decoded.userId),
      })
        .select("to status error messageId processedAt attempts")
        .sort({ createdAt: 1 });

      const stats = await BatchEmail.aggregate([
        {
          $match: {
            batchId,
            userId: new mongoose.Types.ObjectId(decoded.userId),
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const statusCounts = {
        pending: 0,
        processing: 0,
        sent: 0,
        failed: 0,
      };

      stats.forEach((stat) => {
        statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
      });

      return NextResponse.json({
        batchId,
        stats: statusCounts,
        emails: batchEmails,
      });
    } else {
      console.log("Fetching batches for user:", decoded.userId);

      const recentBatches = await BatchEmail.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(decoded.userId),
          },
        },
        {
          $group: {
            _id: "$batchId",
            subject: { $first: "$subject" },
            createdAt: { $first: "$createdAt" },
            totalEmails: { $sum: 1 },
            sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            processing: {
              $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 20 },
        {
          $project: {
            batchId: "$_id",
            subject: 1,
            createdAt: 1,
            totalEmails: 1,
            sent: 1,
            failed: 1,
            pending: 1,
            processing: 1,
            _id: 0,
          },
        },
      ]);

      console.log("Found batches:", recentBatches.length);

      return NextResponse.json({
        batches: recentBatches,
        total: recentBatches.length,
      });
    }
  } catch (error) {
    console.error("Batch status error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
