import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
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

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.preferences) {
      user.preferences = {
        emailNotifications: true,
        marketingEmails: false,
        securityAlerts: true,
      };
      await user.save();
    }

    const settings = {
      profile: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
      },
      emailLimits: user.emailLimits,
      preferences: user.preferences || {
        emailNotifications: true,
        marketingEmails: false,
        securityAlerts: true,
      },
    };

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
