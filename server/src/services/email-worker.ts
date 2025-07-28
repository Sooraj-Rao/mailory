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
      const pendingEmails = await BatchEmail.find({
        status: "pending",
        $or: [
          { scheduledFor: { $exists: false } },
          { scheduledFor: { $lte: new Date() } },
        ],
      })
        .sort({ priority: -1, createdAt: 1 })
        .limit(100)
        .exec();

      if (pendingEmails.length === 0) {
        return;
      }

      const emailsByUser = new Map<string, any[]>();
      for (const email of pendingEmails) {
        if (!emailsByUser.has(email.userId)) {
          emailsByUser.set(email.userId, []);
        }
        emailsByUser.get(email.userId)!.push(email);
      }

      logger.info(`📧 Processing emails for ${emailsByUser.size} users`);

      const promises = Array.from(emailsByUser.entries()).map(
        ([userId, userEmails]) => this.processUserEmails(userId, userEmails)
      );
      await Promise.allSettled(promises);

      await this.processRetryEmails();
    } catch (error) {
      logger.error("❌ Error in email processing:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processUserEmails(
    userId: string,
    emails: any[]
  ): Promise<void> {
    try {
      const user = await User.findById(userId).exec();
      if (!user) {
        logger.error(`❌ User not found: ${userId}`);
        return;
      }

      const batchSize = this.getBatchSizeForPlan(user.subscription.plan);
      const emailsToProcess = emails.slice(0, batchSize);

      logger.info(
        `📧 Processing ${emailsToProcess.length} emails for user ${userId} (${user.subscription.plan} plan - batch size: ${batchSize})`
      );

      const promises = emailsToProcess.map((email) => this.processEmail(email));
      await Promise.allSettled(promises);
    } catch (error) {
      logger.error(`❌ Error processing emails for user ${userId}:`, error);
    }
  }

  private getBatchSizeForPlan(plan: string): number {
    switch (plan) {
      case "free":
        return 10;
      case "starter":
        return 15;
      case "pro":
        return 20;
      case "premium":
        return 25;
      default:
        return 10;
    }
  }

  private async processEmail(email: any): Promise<void> {
    try {
      const updatedEmail = await BatchEmail.findOneAndUpdate(
        { _id: email._id, status: "pending" },
        { status: "processing", attempts: email.attempts + 1 },
        { new: true }
      ).exec();

      if (!updatedEmail) {
        return;
      }

      await this.ensureUserLimits(email.userId);

      const canSend = await this.checkUserRateLimit(email.userId);
      if (!canSend) {
        await BatchEmail.findByIdAndUpdate(email._id, {
          status: "failed",
          error: "User rate limit exceeded",
        }).exec();
        logger.warn(
          `⚠️ Rate limit exceeded for user ${email.userId}, email to ${email.to} failed`
        );
        return;
      }

      const result = await this.emailService.sendEmail({
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
      }).exec();

      await this.updateUserEmailCount(email.userId);

      logger.info(`✅ Email sent to ${email.to} for user ${email.userId}`);
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
      await BatchEmail.findByIdAndUpdate(email._id, {
        status: "failed",
        error: errorMessage,
      }).exec();

      await this.updateUserEmailCount(email.userId);

      logger.error(
        `❌ Email to ${email.to} permanently failed after ${attempts} attempts: ${errorMessage}`
      );
    } else {
      const retryDelay = Math.pow(2, attempts) * 5 * 60 * 1000;
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
      .limit(50)
      .exec();

    const retryEmailsByUser = new Map<string, any[]>();
    for (const email of retryEmails) {
      if (!retryEmailsByUser.has(email.userId)) {
        retryEmailsByUser.set(email.userId, []);
      }
      retryEmailsByUser.get(email.userId)!.push(email);
    }

    const promises = Array.from(retryEmailsByUser.entries()).map(
      ([userId, userEmails]) => this.processUserEmails(userId, userEmails)
    );
    await Promise.allSettled(promises);
  }

  private async checkUserRateLimit(userId: string): Promise<boolean> {
    try {
      await this.resetUserCountersIfNeeded(userId);

      const user = await User.findById(userId).exec();
      if (!user) {
        logger.error(`❌ User not found: ${userId}`);
        return false;
      }

      logger.info(
        `🔍 Checking rate limit for user ${userId} - Current: Daily ${user.emailLimits.dailyUsed}/${user.emailLimits.dailyLimit}, Monthly ${user.emailLimits.monthlyUsed}/${user.emailLimits.monthlyLimit}`
      );

      const dailyAllowed =
        user.emailLimits.dailyUsed < user.emailLimits.dailyLimit;
      const monthlyAllowed =
        user.emailLimits.monthlyUsed < user.emailLimits.monthlyLimit;

      if (!dailyAllowed) {
        logger.warn(
          `⚠️ Daily limit exceeded for user ${userId}: ${user.emailLimits.dailyUsed}/${user.emailLimits.dailyLimit}`
        );
      }
      if (!monthlyAllowed) {
        logger.warn(
          `⚠️ Monthly limit exceeded for user ${userId}: ${user.emailLimits.monthlyUsed}/${user.emailLimits.monthlyLimit}`
        );
      }

      return dailyAllowed && monthlyAllowed;
    } catch (error) {
      logger.error("Error checking user rate limit:", error);
      return false;
    }
  }

  private async resetUserCountersIfNeeded(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId).exec();
      if (!user) {
        return;
      }

      const now = new Date();
      const lastReset = new Date(user.emailLimits.lastResetDate);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const startOfLastResetDay = new Date(lastReset);
      startOfLastResetDay.setHours(0, 0, 0, 0);

      const needsDailyReset =
        startOfToday.getTime() > startOfLastResetDay.getTime();

      const daysSinceReset = Math.floor(
        (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24)
      );
      const needsMonthlyReset = daysSinceReset >= 30;

      if (needsMonthlyReset) {
        await User.findByIdAndUpdate(userId, {
          "emailLimits.dailyUsed": 0,
          "emailLimits.monthlyUsed": 0,
          "emailLimits.lastResetDate": now,
        }).exec();
        logger.info(
          `🔄 Reset monthly and daily counters for user ${userId} (${daysSinceReset} days since last reset)`
        );
      } else if (needsDailyReset) {
        await User.findByIdAndUpdate(userId, {
          "emailLimits.dailyUsed": 0,
          "emailLimits.lastResetDate": now,
        }).exec();
        logger.info(`🔄 Reset daily counter for user ${userId} (new day)`);
      }
    } catch (error) {
      logger.error(`Error resetting counters for user ${userId}:`, error);
    }
  }

  private async updateUserEmailCount(userId: string): Promise<void> {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            "emailLimits.dailyUsed": 1,
            "emailLimits.monthlyUsed": 1,
          },
        },
        { new: true }
      ).exec();

      if (updatedUser) {
        logger.info(
          `📈 Updated email count for user ${userId} - Daily: ${updatedUser.emailLimits.dailyUsed}/${updatedUser.emailLimits.dailyLimit}, Monthly: ${updatedUser.emailLimits.monthlyUsed}/${updatedUser.emailLimits.monthlyLimit}`
        );
      }
    } catch (error) {
      logger.error("Error updating user email count:", error);
    }
  }

  private async ensureUserLimits(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId).exec();
      if (!user) {
        return;
      }

      let dailyLimit = 100;
      let monthlyLimit = 3000;

      switch (user.subscription.plan) {
        case "starter":
          dailyLimit = 167;
          monthlyLimit = 5000;
          break;
        case "pro":
          dailyLimit = 600;
          monthlyLimit = 18000;
          break;
        case "premium":
          dailyLimit = 1334;
          monthlyLimit = 40000;
          break;
        default:
          dailyLimit = 100;
          monthlyLimit = 3000;
          break;
      }

      if (
        user.emailLimits.dailyLimit !== dailyLimit ||
        user.emailLimits.monthlyLimit !== monthlyLimit
      ) {
        await User.findByIdAndUpdate(userId, {
          "emailLimits.dailyLimit": dailyLimit,
          "emailLimits.monthlyLimit": monthlyLimit,
        }).exec();
        logger.info(
          `🔧 Updated limits for user ${userId} (${user.subscription.plan}): Daily ${dailyLimit}, Monthly ${monthlyLimit}`
        );
      }
    } catch (error) {
      logger.error("Error ensuring user limits:", error);
    }
  }

  getStatus(): { isRunning: boolean; isProcessing: boolean } {
    return {
      isRunning: this.cronJob !== null,
      isProcessing: this.isProcessing,
    };
  }
}
