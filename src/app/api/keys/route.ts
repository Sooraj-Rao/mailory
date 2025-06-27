import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ApiKey from "@/models/ApiKey";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { randomBytes } from "crypto";

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

    await connectDB();
    const apiKeys = await ApiKey.find({ userId: decoded.userId }).select(
      "-keyValue"
    );

    return NextResponse.json({ apiKeys });
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
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { keyName } = await request.json();
    if (!keyName) {
      return NextResponse.json(
        { error: "Key name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const keyValue = `es_${randomBytes(32).toString("hex")}`;

    const apiKey = new ApiKey({
      userId: decoded.userId,
      keyName,
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
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
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

    const result = await ApiKey.findOneAndDelete({
      _id: keyId,
      userId: decoded.userId,
    });

    if (!result) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete API key error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
