import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { SUBSCRIPTION_PLANS } from "@/components/payment/subscription-modal";
import { createSubscription } from "@/components/payment/razorpay";

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

    const { planId } = await request.json();

    if (!planId || !SUBSCRIPTION_PLANS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = SUBSCRIPTION_PLANS[planId];

    if (planId === "free") {
      return NextResponse.json(
        { error: "Cannot create subscription for free plan" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { subscription, customerId } = await createSubscription({
      planId: plan.razorpayPlanId!,
      customerId: user.subscription.razorpayCustomerId,
      customerEmail: user.email,
      customerName: user.name,
    });

    if (!user.subscription.razorpayCustomerId) {
      user.subscription.razorpayCustomerId = customerId;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      planId,
      amount: plan.price * 100, 
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
