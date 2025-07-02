import { getSESClient } from "../config/aws";
import { logger } from "../utils/logger";
import type AWS from "aws-sdk"; // Declare the AWS variable

export interface EmailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;
  private sesClient: AWS.SES | null;

  private constructor() {
    this.sesClient = getSESClient();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(params: EmailParams): Promise<{ MessageId: string }> {
    if (!this.sesClient) {
      throw new Error("AWS SES is not configured");
    }

    const { to, subject, text, html, from } = params;
    const recipients = Array.isArray(to) ? to : [to];

    const sesParams = {
      Source: `"${from || "Emailer"}" <${
        process.env.DEFAULT_FROM_EMAIL || "no-reply@email.soorajrao.in"
      }>`,
      Destination: { ToAddresses: recipients },
      Message: {
        Subject: { Data: subject },
        Body: {
          ...(html ? { Html: { Data: html } } : {}),
          ...(text ? { Text: { Data: text } } : {}),
        },
      },
    };

    try {
      const result = await this.sesClient.sendEmail(sesParams).promise();

      logger.info("Email sent successfully", {
        service: "email-service",
        messageId: result.MessageId,
        to: recipients,
        subject,
      });

      return { MessageId: result.MessageId || "unknown" };
    } catch (error: any) {
      logger.error("Failed to send email", {
        service: "email-service",
        error: error.message,
        to: recipients,
        subject,
      });
      throw new Error(error.message);
    }
  }

  async getSendQuota() {
    if (!this.sesClient) {
      return { Max24HourSend: 0, MaxSendRate: 0, SentLast24Hours: 0 };
    }

    try {
      const result = await this.sesClient.getSendQuota().promise();
      return result;
    } catch (error: any) {
      logger.error("Failed to get SES quota", {
        service: "email-service",
        error: error.message,
      });
      return { Max24HourSend: 0, MaxSendRate: 0, SentLast24Hours: 0 };
    }
  }

  isConfigured(): boolean {
    return this.sesClient !== null;
  }
}
