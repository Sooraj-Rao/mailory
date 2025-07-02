import AWS from "aws-sdk"
import { logger } from "../utils/logger"

let sesClient: AWS.SES | null = null

export function initializeAWS(): AWS.SES | null {
  try {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    const region = process.env.AWS_REGION || "us-east-1"

    // Check if credentials are provided and not placeholder values
    if (
      !accessKeyId ||
      !secretAccessKey ||
      accessKeyId === "your_aws_access_key" ||
      secretAccessKey === "your_aws_secret_key"
    ) {
      logger.warn("AWS credentials not configured properly")
      return null
    }

    // Configure AWS
    AWS.config.update({
      accessKeyId,
      secretAccessKey,
      region,
    })

    sesClient = new AWS.SES({ region })

    logger.info("AWS SES initialized successfully")
    return sesClient
  } catch (error) {
    logger.error("Failed to initialize AWS SES:", error)
    return null
  }
}

export function getSESClient(): AWS.SES | null {
  if (!sesClient) {
    sesClient = initializeAWS()
  }
  return sesClient
}

export async function testAWSConnection(): Promise<boolean> {
  try {
    const ses = getSESClient()
    if (!ses) return false

    await ses.getSendQuota().promise()
    return true
  } catch (error) {
    logger.error("AWS SES connection test failed:", error)
    return false
  }
}
