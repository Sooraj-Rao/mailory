import { Router, type Request, type Response } from "express";
import BatchEmail from "../models/batch-mail";
import User from "../models/user";
import { EmailService } from "../services/email-service";
import { logger } from "../utils/logger";

const router = Router();

router.get("/overview", async (req: Request, res: Response) => {
  try {
    const [emailStats, userCount, sesQuota] = await Promise.all([
      BatchEmail.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      User.countDocuments(),
      EmailService.getInstance().getSendQuota(),
    ]);

    const stats = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      total: 0,
    };

    emailStats.forEach((stat) => {
      stats[stat._id as keyof typeof stats] = stat.count;
      stats.total += stat.count;
    });

    res.json({
      emails: stats,
      users: userCount,
      sesQuota: {
        max24HourSend: sesQuota.Max24HourSend,
        maxSendRate: sesQuota.MaxSendRate,
        sentLast24Hours: sesQuota.SentLast24Hours,
        configured: EmailService.getInstance().isConfigured(),
      },
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

    const formattedStats = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
    }));

    hourlyStats.forEach((stat) => {
      const hourIndex = stat._id.hour;
      formattedStats[hourIndex][
        stat._id.status as keyof (typeof formattedStats)[0]
      ] = stat.count;
    });

    res.json({
      hourlyStats: formattedStats,
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

router.get("/users/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const [emailStats, user] = await Promise.all([
      BatchEmail.aggregate([
        {
          $match: { userId },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      User.findById(userId).exec(),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const stats = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      total: 0,
    };

    emailStats.forEach((stat) => {
      stats[stat._id as keyof typeof stats] = stat.count;
      stats.total += stat.count;
    });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
      },
      emails: stats,
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
