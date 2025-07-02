import cron from "node-cron"
import BatchEmail, { type IBatchEmail } from "../models/batch-mail"
import User from "../models/user"
import { EmailService } from "./email-service"
import { logger } from "../utils/logger"
import type { Types } from "mongoose"

export class EmailWorker {
  private static instance: EmailWorker
  private emailService: EmailService
  private cronJob: cron.ScheduledTask | null = null
  private isProcessing = false

  private constructor() {
    this.emailService = EmailService.getInstance()
  }

  static getInstance(): EmailWorker {
    if (!EmailWorker.instance) {
      EmailWorker.instance = new EmailWorker()
    }
    return EmailWorker.instance
  }

  start(): void {
    if (this.cronJob) {
      logger.warn("Email worker is already running")
      return
    }

    logger.info("🚀 Starting email worker...")

    // Process emails every 30 seconds
    this.cronJob = cron.schedule(
      "*/30 * * * * *",
      () => {
        this.processEmails()
      },
      {
        scheduled: false,
      },
    )

    this.cronJob.start()

    // Process immediately on start
    setTimeout(() => this.processEmails(), 1000)

    logger.info("✅ Email worker started - processing every 30 seconds")
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
      logger.info("⏹️ Email worker stopped")
    }
  }

  isRunning(): boolean {
    return this.cronJob !== null
  }

  async processEmails(): Promise<void> {
    if (this.isProcessing) {
      logger.debug("⏭️ Already processing emails, skipping...")
      return
    }

    if (!this.emailService.isConfigured()) {
      logger.warn("AWS SES not configured, skipping email processing")
      return
    }

    this.isProcessing = true
    logger.info("🔄 Processing emails...")

    try {
      // Get pending emails that are ready to be sent
      const pendingEmails = await BatchEmail.find({
        $and: [
          {
            $or: [
              { status: "pending" },
              {
                status: "failed",
                attempts: { $lt: 3 },
                nextRetryAt: { $lte: new Date() },
              },
            ],
          },
          {
            $or: [{ scheduledFor: { $exists: false } }, { scheduledFor: { $lte: new Date() } }],
          },
        ],
      })
        .sort({ priority: -1, createdAt: 1 })
        .limit(10)

      if (pendingEmails.length === 0) {
        logger.debug("✅ No pending emails to process")
        return
      }

      logger.info(`📧 Processing ${pendingEmails.length} emails...`)

      // Process emails with staggered delays
      const promises = pendingEmails.map((email, index) => this.processEmail(email, index * 1000))

      await Promise.allSettled(promises)
      logger.info("✅ Batch processing completed")
    } catch (error: any) {
      logger.error("❌ Email worker error:", {
        service: "email-worker",
        error: error.message,
        stack: error.stack,
      })
    } finally {
      this.isProcessing = false
    }
  }

  private async processEmail(email: IBatchEmail, delay: number): Promise<void> {
    // Add staggered delay
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    try {
      // Mark as processing
      const updatedEmail = await BatchEmail.findOneAndUpdate(
        { _id: email._id, status: { $in: ["pending", "failed"] } },
        {
          status: "processing",
          processedAt: new Date(),
          $inc: { attempts: 1 },
        },
        { new: true },
      )

      if (!updatedEmail) {
        logger.debug(`⚠️ Email ${email.to} already being processed`)
        return
      }

      logger.info(`📤 Sending email to ${email.to} (Attempt ${updatedEmail.attempts})`)

      // Send email
      const result = await this.emailService.sendEmail({
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        from: email.from,
      })

      // Mark as sent
      await BatchEmail.findByIdAndUpdate(email._id, {
        status: "sent",
        messageId: result.MessageId,
        processedAt: new Date(),
        error: undefined,
        nextRetryAt: undefined,
      })

      // Update user's email count
      await this.updateUserEmailCount(email.userId)

      logger.info(`✅ Email sent to ${email.to} - MessageID: ${result.MessageId}`)
    } catch (error: any) {
      await this.handleEmailError(email, error)
    }
  }

  private async handleEmailError(email: IBatchEmail, error: any): Promise<void> {
    const errorMessage = error.message || "Unknown error"

    logger.error(`❌ Failed to send email to ${email.to}:`, {
      service: "email-worker",
      error: errorMessage,
      to: email.to,
      subject: email.subject,
    })

    const updateData: any = {
      processedAt: new Date(),
      error: errorMessage,
    }

    if (email.attempts >= email.maxAttempts) {
      updateData.status = "failed"
      updateData.nextRetryAt = undefined
      logger.warn(`💀 Email to ${email.to} marked as failed after ${email.maxAttempts} attempts`)
    } else {
      updateData.status = "pending"
      // Exponential backoff: 5min, 15min, 1hour
      const retryDelays = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000]
      const delay = retryDelays[Math.min(email.attempts - 1, retryDelays.length - 1)]
      updateData.nextRetryAt = new Date(Date.now() + delay)

      logger.warn(
        `🔄 Email to ${email.to} will be retried after ${updateData.nextRetryAt.toLocaleString()}: ${errorMessage}`,
        {
          service: "email-worker",
        },
      )
    }

    await BatchEmail.findByIdAndUpdate(email._id, updateData)
  }

  private async updateUserEmailCount(userId: Types.ObjectId): Promise<void> {
    try {
      const user = await User.findById(userId)
      if (!user) {
        logger.warn(`User ${userId} not found for email count update`)
        return
      }

      // Check if we need to reset the counter (monthly reset)
      const now = new Date()
      const resetDate = new Date(user.subscription.resetDate)

      if (now > resetDate) {
        // Reset counter and set next reset date
        const nextReset = new Date(now)
        nextReset.setMonth(nextReset.getMonth() + 1)

        await User.findByIdAndUpdate(userId, {
          "subscription.emailsSent": 1,
          "subscription.resetDate": nextReset,
        })
      } else {
        // Increment counter
        await User.findByIdAndUpdate(userId, {
          $inc: { "subscription.emailsSent": 1 },
        })
      }
    } catch (error: any) {
      logger.error("Failed to update user email count:", {
        service: "email-worker",
        userId: userId.toString(),
        error: error.message,
      })
    }
  }

  async getStats(): Promise<any> {
    try {
      const stats = await BatchEmail.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])

      const result = {
        pending: 0,
        processing: 0,
        sent: 0,
        failed: 0,
      }

      stats.forEach((stat) => {
        if (stat._id in result) {
          result[stat._id as keyof typeof result] = stat.count
        }
      })

      return result
    } catch (error: any) {
      logger.error("Failed to get email stats:", error)
      return { pending: 0, processing: 0, sent: 0, failed: 0 }
    }
  }
}
