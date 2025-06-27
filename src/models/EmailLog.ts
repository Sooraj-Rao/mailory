import mongoose, { type Document, Schema } from "mongoose"

export interface IEmailLog extends Document {
  userId: mongoose.Types.ObjectId
  apiKeyId: mongoose.Types.ObjectId
  to: string
  from: string
  subject: string
  status: "sent" | "failed" | "queued"
  messageId?: string
  error?: string
  sentAt: Date
}

const EmailLogSchema = new Schema<IEmailLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  apiKeyId: {
    type: Schema.Types.ObjectId,
    ref: "ApiKey",
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["sent", "failed", "queued"],
    default: "queued",
  },
  messageId: String,
  error: String,
  sentAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.EmailLog || mongoose.model<IEmailLog>("EmailLog", EmailLogSchema)
