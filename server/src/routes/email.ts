import { Router, type Request, type Response } from "express"
import BatchEmail from "../models/batch-mail"
import { logger } from "../utils/logger"

const router = Router()

// Get email queue status
router.get("/queue", async (req: Request, res: Response) => {
  try {
    const { status, limit = 50, page = 1 } = req.query

    const filter: any = {}
    if (status && typeof status === "string") {
      filter.status = status
    }

    const emails = await BatchEmail.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select("to subject status attempts createdAt processedAt error messageId")

    const total = await BatchEmail.countDocuments(filter)

    res.json({
      emails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error: any) {
    logger.error("Failed to get email queue:", error)
    res.status(500).json({
      error: "Failed to get email queue",
      details: error.message,
    })
  }
})

// Retry failed email
router.post("/retry/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const email = await BatchEmail.findByIdAndUpdate(
      id,
      {
        status: "pending",
        attempts: 0,
        error: undefined,
        nextRetryAt: undefined,
      },
      { new: true },
    )

    if (!email) {
      return res.status(404).json({ error: "Email not found" })
    }

    res.json({
      success: true,
      message: "Email queued for retry",
      email: {
        id: email._id,
        to: email.to,
        status: email.status,
      },
    })
  } catch (error: any) {
    logger.error("Failed to retry email:", error)
    res.status(500).json({
      error: "Failed to retry email",
      details: error.message,
    })
  }
})

// Cancel pending email
router.delete("/cancel/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const email = await BatchEmail.findByIdAndUpdate(
      id,
      { status: "failed", error: "Cancelled by user" },
      { new: true },
    )

    if (!email) {
      return res.status(404).json({ error: "Email not found" })
    }

    res.json({
      success: true,
      message: "Email cancelled",
      email: {
        id: email._id,
        to: email.to,
        status: email.status,
      },
    })
  } catch (error: any) {
    logger.error("Failed to cancel email:", error)
    res.status(500).json({
      error: "Failed to cancel email",
      details: error.message,
    })
  }
})

export default router
