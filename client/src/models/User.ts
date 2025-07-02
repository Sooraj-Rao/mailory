import mongoose, { type Document, Schema } from "mongoose"

export interface IUser extends Document {
  email: string
  password: string
  name: string
  isVerified: boolean
  subscription: {
    plan: "free" | "starter" | "pro" | "premium"
    status: "active" | "inactive" | "cancelled" | "expired"
    startDate?: Date
    endDate?: Date
    razorpaySubscriptionId?: string
    razorpayCustomerId?: string
  }
  emailLimits: {
    dailyLimit: number
    monthlyLimit: number
    dailyUsed: number
    monthlyUsed: number
    lastResetDate: Date
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "starter", "pro", "premium"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled", "expired"],
        default: "active",
      },
      startDate: Date,
      endDate: Date,
      razorpaySubscriptionId: String,
      razorpayCustomerId: String,
    },
    emailLimits: {
      dailyLimit: {
        type: Number,
        default: 100, 
      },
      monthlyLimit: {
        type: Number,
        default: 3000, 
      },
      dailyUsed: {
        type: Number,
        default: 0,
      },
      monthlyUsed: {
        type: Number,
        default: 0,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
