import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ApiKey from "@/models/ApiKey";
import EmailLog from "@/models/EmailLog";
import BatchEmail from "@/models/BatchEmail";
import {
  getAuthToken,
  verifyAuthToken,
  clearAuthCookie,
} from "@/lib/auth-cookies";

export async function DELETE() {
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

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Promise.all([
      ApiKey.deleteMany({ userId: decoded.userId }),
      EmailLog.deleteMany({ userId: decoded.userId }),
      BatchEmail.deleteMany({ userId: decoded.userId }),
      User.findByIdAndDelete(decoded.userId),
    ]);

    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });

    await clearAuthCookie(response);

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
