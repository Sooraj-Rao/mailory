import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ApiKey from "@/models/ApiKey";
import EmailLog from "@/models/EmailLog";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";
import { randomBytes } from "crypto";
import BatchEmail from "@/models/BatchEmail";

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const apiId = searchParams.get("apiId");

    const query: { userId: string; _id?: string } = { userId: decoded.userId };

    if (apiId) {
      query._id = apiId;
    }

    const apiKeys = await ApiKey.find(query);

    const apiKeysWithStats = await Promise.all(
      apiKeys.map(async (key) => {
        const emailLogs = await EmailLog.find({ apiKeyId: key._id });
        const batchEmails = await BatchEmail.find({ apiKeyId: key._id });

        const allEmails = [...emailLogs, ...batchEmails];

        const totalEmails = allEmails.length;
        const sentEmails = allEmails.filter(
          (log) => log.status === "sent"
        ).length;
        const failedEmails = allEmails.filter(
          (log) => log.status === "failed"
        ).length;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayEmails = allEmails.filter(
          (log) =>
            new Date(log.createdAt || log.processedAt || log.sentAt) >=
            startOfDay
        );
        const todaySent = todayEmails.filter(
          (log) => log.status === "sent"
        ).length;
        const todayFailed = todayEmails.filter(
          (log) => log.status === "failed"
        ).length;

        const lastUsedLog = allEmails.sort(
          (a, b) =>
            new Date(b.createdAt || b.sentAt).getTime() -
            new Date(a.createdAt || a.sentAt).getTime()
        )[0];
        const emailLogStats = {
          total: emailLogs.length,
          sent: emailLogs.filter((log) => log.status === "sent").length,
          failed: emailLogs.filter((log) => log.status === "failed").length,
        };

        const batchEmailStats = {
          total: batchEmails.length,
          sent: batchEmails.filter((log) => log.status === "sent").length,
          failed: batchEmails.filter((log) => log.status === "failed").length,
        };

        return {
          id: key._id,
          token: key.keyValue.slice(0, 10) + "...",
          keyName: key.keyName,
          createdAt: key.createdAt,
          lastUsed: lastUsedLog
            ? lastUsedLog.sentAt || lastUsedLog.createdAt
            : null,
          stats: {
            total: totalEmails,
            sent: sentEmails,
            failed: failedEmails,
            today: {
              total: todayEmails.length,
              sent: todaySent,
              failed: todayFailed,
            },
            breakdown: {
              emailService: emailLogStats,
              broadcastService: batchEmailStats,
            },
          },
        };
      })
    );

    return NextResponse.json({ success: true, apiKeys: apiKeysWithStats });
  } catch (error) {
    console.error("Get API keys error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const { keyName, apiId } = await request.json();

    if (!keyName || keyName.trim().length === 0) {
      return NextResponse.json(
        { error: "Key name is required" },
        { status: 400 }
      );
    }
    await connectDB();

    if (apiId) {
      const updateApi = await ApiKey.findByIdAndUpdate(apiId, {
        keyName,
      });
      if (updateApi) {
        return NextResponse.json(
          { success: true, message: "Sucessfully updated API key" },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: "Failed to update API key" },
          { status: 500 }
        );
      }
    }

    const existingKeys = await ApiKey.countDocuments({
      userId: decoded.userId,
    });
    if (existingKeys >= 5) {
      return NextResponse.json(
        { error: "Maximum 5 API keys allowed per user" },
        { status: 400 }
      );
    }

    const keyValue = `mlry_${randomBytes(32).toString("hex")}`;

    const apiKey = new ApiKey({
      userId: decoded.userId,
      keyName: keyName.trim(),
      keyValue,
    });

    await apiKey.save();

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey._id,
        keyName: apiKey.keyName,
        keyValue: apiKey.keyValue,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    console.error("Create API key error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json(
        { error: "API key ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const apiKey = await ApiKey.findOne({
      _id: keyId,
      userId: decoded.userId,
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await ApiKey.findByIdAndDelete(keyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete API key error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
