import { Router, type Request, type Response } from "express"
import { EmailWorker } from "../services/email-worker"
import { logger } from "../utils/logger"

const router = Router()

// Get worker status
router.get("/status", (req: Request, res: Response) => {
  const worker = EmailWorker.getInstance()
  const status = worker.getStatus()

  res.json({
    ...status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Start worker
router.post("/start", (req: Request, res: Response) => {
  try {
    const worker = EmailWorker.getInstance()
    worker.start()

    logger.info("🚀 Worker started via API")
    res.json({
      success: true,
      message: "Email worker started",
      status: worker.getStatus(),
    })
  } catch (error: any) {
    logger.error("Failed to start worker:", error)
    res.status(500).json({
      error: "Failed to start worker",
      details: error.message,
    })
  }
})

// Stop worker
router.post("/stop", (req: Request, res: Response) => {
  try {
    const worker = EmailWorker.getInstance()
    worker.stop()

    logger.info("🛑 Worker stopped via API")
    res.json({
      success: true,
      message: "Email worker stopped",
      status: worker.getStatus(),
    })
  } catch (error: any) {
    logger.error("Failed to stop worker:", error)
    res.status(500).json({
      error: "Failed to stop worker",
      details: error.message,
    })
  }
})

// Trigger immediate processing
router.post("/process", async (req: Request, res: Response) => {
  try {
    const worker = EmailWorker.getInstance()

    // Process emails immediately (don't wait for cron)
    worker.processEmails().catch((error) => {
      logger.error("Error in immediate processing:", error)
    })

    res.json({
      success: true,
      message: "Email processing triggered",
    })
  } catch (error: any) {
    logger.error("Failed to trigger processing:", error)
    res.status(500).json({
      error: "Failed to trigger processing",
      details: error.message,
    })
  }
})

export default router
