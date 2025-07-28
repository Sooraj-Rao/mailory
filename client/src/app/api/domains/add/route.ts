/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import {
  SESv2Client,
  CreateEmailIdentityCommand,
  PutEmailIdentityMailFromAttributesCommand,
} from "@aws-sdk/client-sesv2";
import { getAuthToken, verifyAuthToken } from "@/lib/auth-cookies";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
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

  const { domain, mailFromDomain } = await req.json();

  try {
    const createIdentityCommand = new CreateEmailIdentityCommand({
      EmailIdentity: domain,
      // DKIMSigningAttributes
      DkimSigningAttributes: {
        DomainSigningSelector: "mailory",
        NextSigningKeyLength: "RSA_2048_BIT",
      },
    });

    const createResponse = await sesClient.send(createIdentityCommand);

    const dkimRecords =
      createResponse.DkimAttributes?.Tokens?.map((token) => ({
        name: `${token}._domainkey.${domain}`,
        type: "CNAME",
        value: `${token}.dkim.amazonses.com`,
      })) ?? [];

    const region = process.env.AWS_REGION ?? "us-east-1";

    const baseRecords = [
      {
        name: domain,
        type: "TXT",
        value: "v=spf1 include:amazonses.com ~all",
      },
      {
        name: `_dmarc.${domain}`,
        type: "TXT",
        value: "v=DMARC1; p=none;",
      },
      {
        name: domain,
        type: "MX",
        value: `feedback-smtp.${region}.amazonses.com`,
        priority: 10,
      },
    ];

    const mailFromRecords = [];

    if (mailFromDomain) {
      const setMailFrom = new PutEmailIdentityMailFromAttributesCommand({
        EmailIdentity: domain,
        MailFromDomain: mailFromDomain,
        BehaviorOnMxFailure: "USE_DEFAULT_VALUE",
      });

      await sesClient.send(setMailFrom);

      mailFromRecords.push(
        {
          name: mailFromDomain,
          type: "MX",
          value: `feedback-smtp.${region}.amazonses.com`,
          priority: 10,
        },
        {
          name: mailFromDomain,
          type: "TXT",
          value: "v=spf1 include:amazonses.com ~all",
        }
      );
    }

    const allRecords = [...dkimRecords, ...baseRecords, ...mailFromRecords];

    await connectDB();
    const newDomain = new Domain({
      userId: new mongoose.Types.ObjectId(decoded.userId),
      domain,
      mailFromDomain: mailFromDomain || undefined,
      dnsRecords: allRecords,
      verified: false,
      dkimStatus: "pending",
    });

    await newDomain.save();

    return NextResponse.json({
      success: true,
      domain,
      mailFromDomain,
      dnsRecords: allRecords,
    });
  } catch (error: any) {
    console.error("SES Add Domain Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
