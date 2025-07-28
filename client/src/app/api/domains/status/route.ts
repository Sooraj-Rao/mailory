/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { SESv2Client, GetEmailIdentityCommand } from "@aws-sdk/client-sesv2";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";
import { Domain } from "@/models/Domain";

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyAuthToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const { domain } = await req.json();

  try {
    const command = new GetEmailIdentityCommand({
      EmailIdentity: domain,
    });

    const response = await sesClient.send(command);
    let domainStatus;
    if (response.DkimAttributes?.Status == "SUCCESS") {
      domainStatus = await Domain.findOneAndUpdate(
        { domain, userId: decoded.userId },
        { verified: true, dkimStatus: "verified" },
        { new: true }
      );
    } else {
      domainStatus = await Domain.findOneAndUpdate(
        { domain, userId: decoded.userId },
        { verified: false, dkimStatus: "pending" },
        { new: true }
      );
    }
    return NextResponse.json({
      // verified: response.VerifiedForSending,
      verified: response.VerifiedForSendingStatus,
      dkimStatus: domainStatus.dkimStatus,
    });
  } catch (error: any) {
    console.error("SES Status Check Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
