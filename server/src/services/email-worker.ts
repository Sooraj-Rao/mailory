import cron from "node-cron";
import BatchEmail from "../models/batch-mail";
import User from "../models/user";
import { EmailService } from "../services/email-service";
import { logger } from "../utils/logger";

export class EmailWorker {
  private static instance: EmailWorker;
  private cronJob: cron.ScheduledTask | null = null;
  private isProcessing = false;
  private emailService: EmailService;

  private constructor() {
    this.emailService = EmailService.getInstance();
  }

  static getInstance(): EmailWorker {
    if (!EmailWorker.instance) {
      EmailWorker.instance = new EmailWorker();
    }
    return EmailWorker.instance;
  }

  start(): void {
    if (this.cronJob) {
      logger.warn("⚠️ Email worker is already running");
      return;
    }

    // Process emails every 30 seconds
    this.cronJob = cron.schedule("*/30 * * * * *", async () => {
      if (!this.isProcessing) {
        await this.processEmails();
      }
    });

    logger.info("🚀 Email worker started - processing every 30 seconds");
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info("🛑 Email worker stopped");
    }
  }

  async processEmails(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Get pending emails with priority ordering
      const pendingEmails = await BatchEmail.find({
        status: "pending",
        $or: [
          { scheduledFor: { $exists: false } },
          { scheduledFor: { $lte: new Date() } },
        ],
      })
        .sort({ priority: -1, createdAt: 1 })
        .limit(10)
        .exec();

      if (pendingEmails.length === 0) {
        return;
      }

      logger.info(`📧 Processing ${pendingEmails.length} emails`);

      // Process emails in parallel with controlled concurrency
      const promises = pendingEmails.map((email) => this.processEmail(email));
      await Promise.allSettled(promises);

      // Process retry emails
      await this.processRetryEmails();
    } catch (error) {
      logger.error("❌ Error in email processing:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEmail(email: any): Promise<void> {
    try {
      // Mark as processing
      const updatedEmail = await BatchEmail.findOneAndUpdate(
        { _id: email._id, status: "pending" },
        { status: "processing", attempts: email.attempts + 1 },
        { new: true }
      ).exec();

      if (!updatedEmail) {
        return; // Email was already processed by another worker
      }

      // Check user rate limits
      const canSend = await this.checkUserRateLimit(email.userId);
      if (!canSend) {
        await BatchEmail.findByIdAndUpdate(email._id, {
          status: "failed",
          error: "User rate limit exceeded",
        }).exec();
        return;
      }

      // Send email
      const result = await this.emailService.sendEmail({
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        from: email.from,
      });

      // Mark as sent
      await BatchEmail.findByIdAndUpdate(email._id, {
        status: "sent",
        messageId: result.MessageId,
        processedAt: new Date(),
      }).exec();

      // Update user email count
      await this.updateUserEmailCount(email.userId);

      logger.info(`✅ Email sent to ${email.to}`);
    } catch (error: any) {
      await this.handleEmailError(email, error.message);
    }
  }

  private async handleEmailError(
    email: any,
    errorMessage: string
  ): Promise<void> {
    const maxAttempts = email.maxAttempts || 3;
    const attempts = email.attempts + 1;

    if (attempts >= maxAttempts) {
      // Mark as permanently failed
      await BatchEmail.findByIdAndUpdate(email._id, {
        status: "failed",
        error: errorMessage,
      }).exec();

      logger.error(
        `❌ Email to ${email.to} permanently failed after ${attempts} attempts: ${errorMessage}`
      );
    } else {
      // Schedule for retry with exponential backoff
      const retryDelay = Math.pow(2, attempts) * 5 * 60 * 1000; // 5min, 10min, 20min
      const nextRetryAt = new Date(Date.now() + retryDelay);

      await BatchEmail.findByIdAndUpdate(email._id, {
        status: "pending",
        error: errorMessage,
        nextRetryAt,
      }).exec();

      logger.warn(
        `🔄 Email to ${email.to} will be retried after ${new Date(
          nextRetryAt
        ).toLocaleString()}: ${errorMessage}`
      );
    }
  }

  private async processRetryEmails(): Promise<void> {
    const retryEmails = await BatchEmail.find({
      status: "pending",
      nextRetryAt: { $lte: new Date() },
    })
      .limit(5)
      .exec();

    for (const email of retryEmails) {
      await this.processEmail(email);
    }
  }

  private async checkUserRateLimit(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).exec();
      if (!user) {
        return false;
      }

      const now = new Date();
      if (now > user.subscription.resetDate) {
        // Reset monthly limit
        await User.findByIdAndUpdate(userId, {
          "subscription.emailsUsed": 0,
          "subscription.resetDate": new Date(
            now.getTime() + 30 * 24 * 60 * 60 * 1000
          ),
        }).exec();
        return true;
      }

      return user.subscription.emailsUsed < user.subscription.emailsLimit;
    } catch (error) {
      logger.error("Error checking user rate limit:", error);
      return false;
    }
  }

  private async updateUserEmailCount(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { "subscription.emailsUsed": 1 },
      }).exec();
    } catch (error) {
      logger.error("Error updating user email count:", error);
    }
  }

  getStatus(): { isRunning: boolean; isProcessing: boolean } {
    return {
      isRunning: this.cronJob !== null,
      isProcessing: this.isProcessing,
    };
  }
}
