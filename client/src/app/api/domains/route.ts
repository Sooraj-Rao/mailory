/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";
import connectDB from "@/lib/mongodb";
import { Domain } from "@/models/Domain";

export async function GET(req: NextRequest) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyAuthToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "Invalid domain ID" },
          { status: 400 }
        );
      }

      const domain = await Domain.findOne({
        _id: id,
        userId: new mongoose.Types.ObjectId(decoded.userId),
      });

      if (!domain) {
        return NextResponse.json(
          { error: "Domain not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        domain: {
          id: domain._id,
          userId: domain.userId,
          domain: domain.domain,
          mailFromDomain: domain.mailFromDomain,
          dnsRecords: domain.dnsRecords,
          verified: domain.verified,
          dkimStatus: domain.dkimStatus,
          createdAt: domain.createdAt,
          updatedAt: domain.updatedAt,
        },
      });
    } else {
      const domains = await Domain.find({
        userId: new mongoose.Types.ObjectId(decoded.userId),
      });

      return NextResponse.json({
        success: true,
        domains: domains.map((domain) => ({
          id: domain._id,
          userId: domain.userId,
          domain: domain.domain,
          mailFromDomain: domain.mailFromDomain,
          dnsRecords: domain.dnsRecords,
          verified: domain.verified,
          dkimStatus: domain.dkimStatus,
          createdAt: domain.createdAt,
          updatedAt: domain.updatedAt,
        })),
      });
    }
  } catch (error: any) {
    console.error("Get Domains Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyAuthToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "Invalid domain ID" },
          { status: 400 }
        );
      }
    }

    const domain = await Domain.findOneAndDelete({
      _id: id,
      userId: new mongoose.Types.ObjectId(decoded.userId),
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Successfully deleted the domain" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
