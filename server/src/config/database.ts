import mongoose from "mongoose"
import { logger } from "../utils/logger"

export async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not defined")
    }

    await mongoose.connect(mongoUri)
    logger.info("MongoDB connected successfully")
  } catch (error) {
    logger.error("MongoDB connection error:", error)
    throw error
  }
}

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected")
})

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB error:", error)
})
