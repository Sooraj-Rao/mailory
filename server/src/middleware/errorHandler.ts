import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error("Unhandled error:", {
    service: "email-worker",
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  })

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  })
}
