/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BatchEmail from "@/models/BatchEmail";
import { sendEmail } from "@/lib/email-service";

export async function POST() {
  try {
    await connectDB();
    const pendingEmail = await BatchEmail.findOneAndUpdate(
      { status: "pending" },
      {
        status: "processing",
        processedAt: new Date(),
        $inc: { attempts: 1 },
      },
      { new: true, sort: { createdAt: 1 } }
    );

    if (!pendingEmail) {
      return NextResponse.json({ message: "No pending emails", status: 200 });
    }

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

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        to: pendingEmail.to,
        messageId: result.MessageId,
      });
    } catch (emailError: any) {
      await BatchEmail.findByIdAndUpdate(pendingEmail._id, {
        status: "failed",
        error: emailError.message,
        processedAt: new Date(),
      });

      return NextResponse.json({
        success: false,
        message: "Email failed to send",
        to: pendingEmail.to,
        error: emailError.message,
      });
    }
  } catch (error) {
    console.error("Worker error:", error);
    return NextResponse.json({ error: "Worker error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();

    const stats = await BatchEmail.aggregate([
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Worker stats error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
