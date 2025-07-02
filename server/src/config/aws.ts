import AWS from "aws-sdk"
import { logger } from "../utils/logger"

let sesClient: AWS.SES | null = null

export function getSESClient(): AWS.SES | null {
  if (sesClient) {
    return sesClient
  }

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.AWS_REGION

  if (!accessKeyId || !secretAccessKey || !region) {
    logger.warn("⚠️ AWS credentials not configured. Email sending will be disabled.")
    return null
  }

  if (
    accessKeyId === "your_aws_access_key" ||
    secretAccessKey === "your_aws_secret_key" ||
    accessKeyId.includes("placeholder")
  ) {
    logger.warn("⚠️ AWS credentials appear to be placeholder values. Email sending will be disabled.")
    return null
  }

  try {
    AWS.config.update({
      accessKeyId,
      secretAccessKey,
      region,
    })

    sesClient = new AWS.SES({ apiVersion: "2010-12-01" })
    logger.info("✅ AWS SES client initialized successfully")
    return sesClient
  } catch (error) {
    logger.error("❌ Failed to initialize AWS SES client:", error)
    return null
  }
}

export { sesClient }
