import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyPaymentSignature } from "@/components/payment/razorpay";
import { getPlanLimits } from "@/components/payment/subscription-modal";

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      planId,
    } = await request.json();

    const isValid = verifyPaymentSignature(
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = getPlanLimits(planId);
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Update user subscription
    user.subscription = {
      plan: planId,
      status: "active",
      startDate: now,
      endDate: endDate,
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayCustomerId: user.subscription.razorpayCustomerId,
    };

    // Update email limits based on plan
    user.emailLimits = {
      dailyLimit: plan.dailyLimit,
      monthlyLimit: plan.monthlyLimit,
      dailyUsed: user.emailLimits.dailyUsed,
      monthlyUsed: user.emailLimits.monthlyUsed,
      lastResetDate: user.emailLimits.lastResetDate,
    };

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully",
      plan: planId,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
