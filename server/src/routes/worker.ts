import { Router, type Request, type Response } from "express";
import { EmailWorker } from "../services/email-worker";
import { logger } from "../utils/logger";

const router = Router();

// Get worker status
router.get("/status", (req: Request, res: Response) => {
  try {
    const worker = EmailWorker.getInstance();
    const isRunning = worker.isRunning();

    res.json({
      status: isRunning ? "running" : "stopped",
      message: isRunning
        ? "Email worker is running"
        : "Email worker is stopped",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Failed to get worker status:", error);
    res.status(500).json({
      error: "Failed to get worker status",
      details: error.message,
    });
  }
});

// Start worker
router.post("/start", (req: Request, res: Response) => {
  try {
    const worker = EmailWorker.getInstance();

    if (worker.isRunning()) {
      return res.json({
        success: true,
        message: "Email worker is already running",
        status: "running",
      });
    }

    worker.start();

    res.json({
      success: true,
      message: "Email worker started successfully",
      status: "running",
    });
  } catch (error: any) {
    logger.error("Failed to start worker:", error);
    res.status(500).json({
      error: "Failed to start worker",
      details: error.message,
    });
  }
});

// Stop worker
router.post("/stop", (req: Request, res: Response) => {
  try {
    const worker = EmailWorker.getInstance();
    worker.stop();

    res.json({
      success: true,
      message: "Email worker stopped successfully",
      status: "stopped",
    });
  } catch (error: any) {
    logger.error("Failed to stop worker:", error);
    res.status(500).json({
      error: "Failed to stop worker",
      details: error.message,
    });
  }
});

// Process emails manually
router.post("/process", async (req: Request, res: Response) => {
  try {
    const worker = EmailWorker.getInstance();
    await worker.processEmails();

    res.json({
      success: true,
      message: "Email processing completed",
    });
  } catch (error: any) {
    logger.error("Failed to process emails:", error);
    res.status(500).json({
      error: "Failed to process emails",
      details: error.message,
    });
  }
});

export default router;
