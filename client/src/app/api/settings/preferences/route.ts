import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies"

export async function PUT(request: NextRequest) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { emailNotifications, marketingEmails, securityAlerts } = await request.json()

    await connectDB()

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.preferences = {
      emailNotifications: Boolean(emailNotifications),
      marketingEmails: Boolean(marketingEmails),
      securityAlerts: Boolean(securityAlerts),
    }

    await user.save()

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences,
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
