import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ApiKey from "@/models/ApiKey"
import EmailLog from "@/models/EmailLog"
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies"
import { randomBytes } from "crypto"

export async function GET() {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const apiKeys = await ApiKey.find({ userId: decoded.userId }).select("-keyValue")

    // Get statistics for each API key
    const apiKeysWithStats = await Promise.all(
      apiKeys.map(async (key) => {
        const emailLogs = await EmailLog.find({ apiKeyId: key._id })
        const totalEmails = emailLogs.length
        const sentEmails = emailLogs.filter((log) => log.status === "sent").length
        const failedEmails = emailLogs.filter((log) => log.status === "failed").length

        // Get today's stats
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const todayEmails = emailLogs.filter((log) => new Date(log.createdAt) >= startOfDay)
        const todaySent = todayEmails.filter((log) => log.status === "sent").length
        const todayFailed = todayEmails.filter((log) => log.status === "failed").length

        // Get last used date
        const lastUsedLog = emailLogs.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]

        return {
          id: key._id,
          keyName: key.keyName,
          createdAt: key.createdAt,
          lastUsed: lastUsedLog ? lastUsedLog.createdAt : null,
          stats: {
            total: totalEmails,
            sent: sentEmails,
            failed: failedEmails,
            today: {
              total: todayEmails.length,
              sent: todaySent,
              failed: todayFailed,
            },
          },
        }
      }),
    )

    return NextResponse.json({ success: true, apiKeys: apiKeysWithStats })
  } catch (error) {
    console.error("Get API keys error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { keyName } = await request.json()

    if (!keyName || keyName.trim().length === 0) {
      return NextResponse.json({ error: "Key name is required" }, { status: 400 })
    }

    await connectDB()

    // Check if user already has 5 API keys (limit)
    const existingKeys = await ApiKey.countDocuments({ userId: decoded.userId })
    if (existingKeys >= 5) {
      return NextResponse.json({ error: "Maximum 5 API keys allowed per user" }, { status: 400 })
    }

    const keyValue = `sk_${randomBytes(32).toString("hex")}`

    const apiKey = new ApiKey({
      userId: decoded.userId,
      keyName: keyName.trim(),
      keyValue,
    })

    await apiKey.save()

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey._id,
        keyName: apiKey.keyName,
        keyValue: apiKey.keyValue,
        createdAt: apiKey.createdAt,
      },
    })
  } catch (error) {
    console.error("Create API key error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get("id")

    if (!keyId) {
      return NextResponse.json({ error: "API key ID is required" }, { status: 400 })
    }

    await connectDB()

    const apiKey = await ApiKey.findOne({
      _id: keyId,
      userId: decoded.userId,
    })

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    await ApiKey.findByIdAndDelete(keyId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete API key error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
