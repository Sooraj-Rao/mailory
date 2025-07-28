import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";
import { EmailWorker } from "./services/email-worker";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

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

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/v1", routes);

app.use(errorHandler);

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

async function startServer() {
  try {
    await connectDB();
    logger.info("✅ Connected to MongoDB");

    const emailWorker = EmailWorker.getInstance();
    emailWorker.start();
    logger.info("🚀 Email worker started");

    app.listen(PORT, () => {
      logger.info(`🌟 Email Worker Server running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", () => {
  logger.info("🛑 SIGTERM received, shutting down gracefully");
  const emailWorker = EmailWorker.getInstance();
  emailWorker.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("🛑 SIGINT received, shutting down gracefully");
  const emailWorker = EmailWorker.getInstance();
  emailWorker.stop();
  process.exit(0);
});

startServer();
