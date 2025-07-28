import mongoose, { type Document, Schema } from "mongoose"

export interface IBatchEmail extends Document {
  userId: mongoose.Types.ObjectId
  apiKeyId?: mongoose.Types.ObjectId
  to: string
  subject: string
  html?: string
  text?: string
  from: string
  status: "pending" | "processing" | "sent" | "failed"
  batchId: string
  error?: string
  messageId?: string
  createdAt: Date
  processedAt?: Date
  attempts: number
}

const BatchEmailSchema = new Schema<IBatchEmail>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    apiKeyId: {
      type: Schema.Types.ObjectId,
      ref: "ApiKey",
    },
    to: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    html: {
      type: String,
    },
    text: String,
    from: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "sent", "failed"],
      default: "pending",
    },
    batchId: {
      type: String,
      required: true,
    },
    error: String,
    messageId: String,
    processedAt: Date,
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

BatchEmailSchema.index({ status: 1, createdAt: 1 })
BatchEmailSchema.index({ userId: 1, createdAt: -1 })
BatchEmailSchema.index({ batchId: 1 })

BatchEmailSchema.index({ batchId: 1, to: 1 }, { unique: true })

export default mongoose.models.BatchEmail || mongoose.model<IBatchEmail>("BatchEmail", BatchEmailSchema)
