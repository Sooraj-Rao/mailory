import mongoose, { type Document, Schema, type Types } from "mongoose"

export interface IUser extends Document {
  _id: Types.ObjectId
  email: string
  name: string
  subscription: {
    plan: "free" | "starter" | "pro" | "premium"
    status: "active" | "inactive" | "cancelled"
    emailsUsed: number
    emailsLimit: number
    resetDate: Date
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "starter", "pro", "premium"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled"],
        default: "active",
      },
      emailsUsed: { type: Number, default: 0 },
      emailsLimit: { type: Number, default: 100 },
      resetDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IUser>("User", UserSchema)
