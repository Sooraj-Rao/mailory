import mongoose, { type Document, Schema, type Types } from "mongoose"

export interface IBatchEmail extends Document {
  _id: Types.ObjectId
  userId: string
  to: string
  subject: string
  html: string
  text?: string
  from: string
  batchId?: string
  status: "pending" | "processing" | "sent" | "failed"
  priority: "high" | "normal" | "low"
  attempts: number
  maxAttempts: number
  messageId?: string
  error?: string
  nextRetryAt?: Date
  scheduledFor?: Date
  processedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const BatchEmailSchema = new Schema<IBatchEmail>(
  {
    userId: { type: String, required: true, index: true },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    text: { type: String },
    from: { type: String, required: true },
    batchId: { type: String, index: true },
    status: {
      type: String,
      enum: ["pending", "processing", "sent", "failed"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["high", "normal", "low"],
      default: "normal",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    messageId: { type: String },
    error: { type: String },
    nextRetryAt: { type: Date, index: true },
    scheduledFor: { type: Date, index: true },
    processedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

BatchEmailSchema.index({ status: 1, priority: -1, createdAt: 1 })
BatchEmailSchema.index({ userId: 1, status: 1 })
BatchEmailSchema.index({ batchId: 1, status: 1 })
BatchEmailSchema.index({ nextRetryAt: 1, status: 1 })

export default mongoose.model<IBatchEmail>("BatchEmail", BatchEmailSchema)
