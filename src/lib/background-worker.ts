/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from "./mongodb";
import BatchEmail from "@/models/BatchEmail";
import { sendEmail } from "./email-service";

class BackgroundWorker {
  private static instance: BackgroundWorker;
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;

  private constructor() {}

  static getInstance(): BackgroundWorker {
    if (!BackgroundWorker.instance) {
      BackgroundWorker.instance = new BackgroundWorker();
    }
    return BackgroundWorker.instance;
  }

  async processEmails() {
    if (this.isProcessing) {
      console.log("⏭️ Already processing emails, skipping...");
      return;
    }

    this.isProcessing = true;
    console.log("🔄 Background worker processing emails...");

    try {
      await connectDB();
      // 3 emails at once
      const pendingEmails = await BatchEmail.find({
        status: "pending",
        attempts: { $lt: 3 },
      })
        .sort({ createdAt: 1 })
        .limit(3);
      if (pendingEmails.length === 0) {
        console.log("✅ No pending emails to process");
        this.isProcessing = false;
        return;
      }

      console.log(`📧 Processing ${pendingEmails.length} emails...`);

      const promises = pendingEmails.map(async (email, index) => {
        await new Promise((resolve) => setTimeout(resolve, index * 1000));

        try {
          const updatedEmail = await BatchEmail.findOneAndUpdate(
            { _id: email._id, status: "pending" },
            {
              status: "processing",
              processedAt: new Date(),
              $inc: { attempts: 1 },
            },
            { new: true }
          );

          if (!updatedEmail) {
            console.log(`⚠️ Email ${email.to} already being processed`);
            return;
          }

          console.log(
            `📤 Sending email to ${email.to} (Attempt ${updatedEmail.attempts})`
          );

          const result = await sendEmail({
            to: email.to,
            subject: email.subject,
            html: email.html,
            text: email.text,
            from: email.from,
          });

          await BatchEmail.findByIdAndUpdate(email._id, {
            status: "sent",
            messageId: result.MessageId,
            processedAt: new Date(),
          });

          console.log(
            `✅ Email sent to ${email.to} - MessageID: ${result.MessageId}`
          );
        } catch (emailError: any) {
          console.error(
            `❌ Failed to send email to ${email.to}:`,
            emailError.message
          );

          const updateData: any = {
            processedAt: new Date(),
            error: emailError.message,
          };

          if (email.attempts >= 2) {
            updateData.status = "failed";
            console.log(
              `💀 Email to ${email.to} marked as failed after 3 attempts`
            );
          } else {
            updateData.status = "pending";
            console.log(`🔄 Email to ${email.to} will be retried`);
          }

          await BatchEmail.findByIdAndUpdate(email._id, updateData);
        }
      });

      await Promise.all(promises);
      console.log("✅ Batch processing completed");
    } catch (error) {
      console.error("❌ Background worker error:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  start() {
    if (this.intervalId) {
      console.log("⚠️ Background worker already running");
      return;
    }

    console.log("🚀 Starting background email worker...");

    this.processEmails();

    this.intervalId = setInterval(() => {
      this.processEmails();
    }, 10000);

    console.log("✅ Background worker started - processing every 10 seconds");
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("⏹️ Background worker stopped");
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

export default BackgroundWorker;
