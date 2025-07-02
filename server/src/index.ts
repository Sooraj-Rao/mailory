import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";
import { EmailWorker } from "./services/email-worker";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "email-worker",
    version: "1.0.0",
  });
});

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info("Connected to MongoDB");

    // Start the server
    app.listen(PORT, () => {
      logger.info(`🚀 Email Worker Server running on port ${PORT}`);
    });

    // Start email worker
    const emailWorker = EmailWorker.getInstance();
    emailWorker.start();
    logger.info("📧 Email Worker started");
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  const emailWorker = EmailWorker.getInstance();
  emailWorker.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  const emailWorker = EmailWorker.getInstance();
  emailWorker.stop();
  process.exit(0);
});

startServer();
