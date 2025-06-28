/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BatchEmail from "@/models/BatchEmail";
import { sendEmail } from "@/lib/email-service";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";
import mongoose from "mongoose";

export async function POST() {
  try {
    await connectDB();

    const pendingEmail = await BatchEmail.findOneAndUpdate(
      {
        status: "pending",
        attempts: { $lt: 3 },
      },
      {
        status: "processing",
        processedAt: new Date(),
        $inc: { attempts: 1 },
      },
      {
        new: true,
        sort: { createdAt: 1 },
      }
    );

    if (!pendingEmail) {
      return NextResponse.json({
        message: "No pending emails",
        processed: 0,
        hasMore: false,
      });
    }

    console.log(
      `🔄 Processing email to ${pendingEmail.to} (Attempt ${pendingEmail.attempts})`
    );

    try {
      const result = await sendEmail({
        to: pendingEmail.to,
        subject: pendingEmail.subject,
        html: pendingEmail.html,
        text: pendingEmail.text,
        from: pendingEmail.from,
      });

      await BatchEmail.findByIdAndUpdate(pendingEmail._id, {
        status: "sent",
        messageId: result.MessageId,
        processedAt: new Date(),
      });

      console.log(
        `✅ Email sent to ${pendingEmail.to} - MessageID: ${result.MessageId}`
      );

      const remainingCount = await BatchEmail.countDocuments({
        status: "pending",
      });

      return NextResponse.json({
        success: true,
        processed: 1,
        email: {
          to: pendingEmail.to,
          status: "sent",
          messageId: result.MessageId,
          batchId: pendingEmail.batchId,
        },
        hasMore: remainingCount > 0,
        remaining: remainingCount,
        message: `Email sent to ${pendingEmail.to}`,
      });
    } catch (emailError: any) {
      console.error(
        `❌ Failed to send email to ${pendingEmail.to}:`,
        emailError.message
      );

      const updateData: any = {
        processedAt: new Date(),
        error: emailError.message,
      };

      if (pendingEmail.attempts >= 3) {
        updateData.status = "failed";
        console.log(
          `💀 Email to ${pendingEmail.to} marked as failed after 3 attempts`
        );
      } else {
        updateData.status = "pending";
        console.log(
          `🔄 Email to ${pendingEmail.to} will be retried (attempt ${pendingEmail.attempts}/3)`
        );
      }

      await BatchEmail.findByIdAndUpdate(pendingEmail._id, updateData);

      const remainingCount = await BatchEmail.countDocuments({
        status: "pending",
      });

      return NextResponse.json({
        success: false,
        processed: 1,
        email: {
          to: pendingEmail.to,
          status: pendingEmail.attempts >= 3 ? "failed" : "retry",
          error: emailError.message,
          batchId: pendingEmail.batchId,
        },
        hasMore: remainingCount > 0,
        remaining: remainingCount,
        message: `Failed to send email to ${pendingEmail.to}`,
      });
    }
  } catch (error) {
    console.error("Auto-process worker error:", error);
    return NextResponse.json(
      {
        error: "Worker error",
        details: "Internal server error",
        processed: 0,
        hasMore: false,
      },
      { status: 500 }
    );
  }
}

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

    const stats = await BatchEmail.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
    };

    stats.forEach((stat) => {
      result[stat._id as keyof typeof result] = stat.count;
    });

    return NextResponse.json({
      stats: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Worker stats error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
