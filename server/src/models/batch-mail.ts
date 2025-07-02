import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IBatchEmail extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  to: string;
  subject: string;
  html: string;
  text?: string;
  from: string;
  batchId: string;
  status: "pending" | "processing" | "sent" | "failed";
  priority: "high" | "normal" | "low";
  scheduledFor?: Date;
  attempts: number;
  maxAttempts: number;
  messageId?: string;
  error?: string;
  nextRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

const BatchEmailSchema = new Schema<IBatchEmail>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    text: { type: String },
    from: { type: String, required: true },
    batchId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "sent", "failed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["high", "normal", "low"],
      default: "normal",
    },
    scheduledFor: { type: Date },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    messageId: { type: String },
    error: { type: String },
    nextRetryAt: { type: Date },
    processedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
BatchEmailSchema.index({ status: 1, scheduledFor: 1, priority: -1 });
BatchEmailSchema.index({ userId: 1, createdAt: -1 });
BatchEmailSchema.index({ batchId: 1 });

export default mongoose.model<IBatchEmail>("BatchEmail", BatchEmailSchema);
