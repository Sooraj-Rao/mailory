import mongoose, { type Document, Schema } from "mongoose"

export interface IApiKey extends Document {
  userId: mongoose.Types.ObjectId
  keyName: string
  keyValue: string
  isActive: boolean
  lastUsed: Date
  createdAt: Date
  updatedAt: Date
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    keyName: {
      type: String,
      required: true,
    },
    keyValue: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema)
