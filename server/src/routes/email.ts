import { Router, type Request, type Response } from "express";
import BatchEmail from "../models/batch-mail";
import User from "../models/user";
import { EmailService } from "../services/email-service";
import { logger } from "../utils/logger";

const router = Router();

router.post("/send", async (req: Request, res: Response) => {
  try {
    const { to, subject, html, text, from, userId, apiKeyId } = req.body;
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["to", "subject", "html or text"],
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: "User ID is required for quota tracking",
      });
    }

    const emailService = EmailService.getInstance();

    if (!emailService.isConfigured()) {
      return res.status(503).json({
        error: "Email service not configured",
        details: "AWS SES credentials are missing or invalid",
      });
    }

    const rateLimitCheck = await checkUserRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        details: rateLimitCheck.reason,
        limits: {
          daily: rateLimitCheck.dailyLimit,
          monthly: rateLimitCheck.monthlyLimit,
          dailyUsed: rateLimitCheck.dailyUsed,
          monthlyUsed: rateLimitCheck.monthlyUsed,
        },
      });
    }

    const result = await emailService.sendEmail({
      to,
      subject,
      html,
      text,
      from,
      userId,
      apiKeyId,
    });

    res.json({
      success: true,
      messageId: result.MessageId,
      message: "Email sent successfully",
      quotaUsed: {
        daily: rateLimitCheck.dailyUsed + 1,
        monthly: rateLimitCheck.monthlyUsed + 1,
        dailyLimit: rateLimitCheck.dailyLimit,
        monthlyLimit: rateLimitCheck.monthlyLimit,
      },
    });
  } catch (error: any) {
    logger.error("Failed to send email:", error);

    if (error.message.includes("Rate limit exceeded")) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
});

async function checkUserRateLimit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsed: number;
  monthlyUsed: number;
}> {
  try {
    await resetUserCountersIfNeeded(userId);

    const user = await User.findById(userId).exec();
    if (!user) {
      return {
        allowed: false,
        reason: "User not found",
        dailyLimit: 0,
        monthlyLimit: 0,
        dailyUsed: 0,
        monthlyUsed: 0,
      };
    }

    await ensureUserLimits(user);

    const dailyAllowed =
      user.emailLimits.dailyUsed < user.emailLimits.dailyLimit;
    const monthlyAllowed =
      user.emailLimits.monthlyUsed < user.emailLimits.monthlyLimit;

    let reason = "";
    if (!dailyAllowed) {
      reason = `Daily limit exceeded (${user.emailLimits.dailyUsed}/${user.emailLimits.dailyLimit})`;
    } else if (!monthlyAllowed) {
      reason = `Monthly limit exceeded (${user.emailLimits.monthlyUsed}/${user.emailLimits.monthlyLimit})`;
    }

    return {
      allowed: dailyAllowed && monthlyAllowed,
      reason,
      dailyLimit: user.emailLimits.dailyLimit,
      monthlyLimit: user.emailLimits.monthlyLimit,
      dailyUsed: user.emailLimits.dailyUsed,
      monthlyUsed: user.emailLimits.monthlyUsed,
    };
  } catch (error) {
    logger.error("Error checking user rate limit:", error);
    return {
      allowed: false,
      reason: "Rate limit check failed",
      dailyLimit: 0,
      monthlyLimit: 0,
      dailyUsed: 0,
      monthlyUsed: 0,
    };
  }
}

async function resetUserCountersIfNeeded(userId: string): Promise<void> {
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

async function ensureUserLimits(user: any): Promise<void> {
  try {
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
      await User.findByIdAndUpdate(user._id, {
        "emailLimits.dailyLimit": dailyLimit,
        "emailLimits.monthlyLimit": monthlyLimit,
      }).exec();
      logger.info(
        `🔧 Updated limits for user ${user._id} (${user.subscription.plan}): Daily ${dailyLimit}, Monthly ${monthlyLimit}`
      );
    }
  } catch (error) {
    logger.error("Error ensuring user limits:", error);
  }
}

router.get("/queue", async (req: Request, res: Response) => {
  try {
    const { status, userId, limit = 50, page = 1 } = req.query;

    const filter: any = {};
    if (status && typeof status === "string") {
      filter.status = status;
    }
    if (userId && typeof userId === "string") {
      filter.userId = userId;
    }

    const emails = await BatchEmail.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select(
        "to subject status attempts createdAt processedAt error messageId priority"
      )
      .exec();

    const total = await BatchEmail.countDocuments(filter);

    res.json({
      emails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    logger.error("Failed to get email queue:", error);
    res.status(500).json({
      error: "Failed to get email queue",
      details: error.message,
    });
  }
});

router.post("/retry/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const email = await BatchEmail.findByIdAndUpdate(
      id,
      {
        status: "pending",
        attempts: 0,
        error: undefined,
        nextRetryAt: undefined,
      },
      { new: true }
    ).exec();

    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    res.json({
      success: true,
      message: "Email queued for retry",
      email: {
        id: email._id,
        to: email.to,
        status: email.status,
      },
    });
  } catch (error: any) {
    logger.error("Failed to retry email:", error);
    res.status(500).json({
      error: "Failed to retry email",
      details: error.message,
    });
  }
});

router.delete("/cancel/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const email = await BatchEmail.findByIdAndUpdate(
      id,
      { status: "failed", error: "Cancelled by user" },
      { new: true }
    ).exec();

    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    res.json({
      success: true,
      message: "Email cancelled",
      email: {
        id: email._id,
        to: email.to,
        status: email.status,
      },
    });
  } catch (error: any) {
    logger.error("Failed to cancel email:", error);
    res.status(500).json({
      error: "Failed to cancel email",
      details: error.message,
    });
  }
});

export default router;
