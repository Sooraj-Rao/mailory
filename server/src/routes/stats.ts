import { Router, type Request, type Response } from "express";
import BatchEmail from "../models/batch-mail";
import User from "../models/user";
import { EmailService } from "../services/email-service";
import { logger } from "../utils/logger";

const router = Router();

// Get overview statistics
router.get("/overview", async (req: Request, res: Response) => {
  try {
    // Get email statistics
    const emailStats = await BatchEmail.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const emails = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      total: 0,
    };

    emailStats.forEach((stat) => {
      if (stat._id in emails) {
        emails[stat._id as keyof typeof emails] = stat.count;
      }
      emails.total += stat.count;
    });

    // Get user count
    const userCount = await User.countDocuments();

    // Get SES quota
    const emailService = EmailService.getInstance();
    let sesQuota = {
      max24HourSend: 0,
      maxSendRate: 0,
      sentLast24Hours: 0,
      configured: false,
    };

    if (emailService.isConfigured()) {
      try {
        const quota = await emailService.getSendQuota();
        sesQuota = {
          max24HourSend: quota.Max24HourSend || 0,
          maxSendRate: quota.MaxSendRate || 0,
          sentLast24Hours: quota.SentLast24Hours || 0,
          configured: true,
        };
      } catch (error: any) {
        logger.error("Failed to get SES quota:", {
          service: "email-worker",
          name: error.name,
          ...error,
        });
      }
    }

    res.json({
      emails,
      users: userCount,
      sesQuota,
      sesConfigured: emailService.isConfigured(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Failed to get overview stats:", error);
    res.status(500).json({
      error: "Failed to get statistics",
      details: error.message,
    });
  }
});

// Get hourly statistics for the last 24 hours
router.get("/hourly", async (req: Request, res: Response) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const hourlyStats = await BatchEmail.aggregate([
      {
        $match: {
          createdAt: { $gte: last24Hours },
        },
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$createdAt" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.hour": 1 },
      },
    ]);

    // Format data for frontend
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sent: 0,
      failed: 0,
      pending: 0,
      processing: 0,
    }));

    hourlyStats.forEach((stat) => {
      const hourIndex = stat._id.hour;
      const status = stat._id.status;
      if (hours[hourIndex] && status in hours[hourIndex]) {
        hours[hourIndex][status as keyof (typeof hours)[0]] = stat.count;
      }
    });

    res.json({
      hourlyStats: hours,
      period: "24 hours",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Failed to get hourly stats:", error);
    res.status(500).json({
      error: "Failed to get hourly statistics",
      details: error.message,
    });
  }
});

// Get user-specific statistics
router.get("/users/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userStats = await BatchEmail.aggregate([
      {
        $match: { userId: userId },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      total: 0,
    };

    userStats.forEach((stat) => {
      if (stat._id in stats) {
        stats[stat._id as keyof typeof stats] = stat.count;
      }
      stats.total += stat.count;
    });

    // Get user info
    const user = await User.findById(userId).select("email subscription");

    res.json({
      user,
      emailStats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Failed to get user stats:", error);
    res.status(500).json({
      error: "Failed to get user statistics",
      details: error.message,
    });
  }
});

export default router;
