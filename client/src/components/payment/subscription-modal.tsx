export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  dailyLimit: number
  monthlyLimit: number
  features: string[]
  razorpayPlanId?: string
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    dailyLimit: 100,
    monthlyLimit: 3000,
    features: [
      "3,000 emails/month",
      "Basic email templates",
      "Email delivery tracking",
      "API access",
      "Community support",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 99,
    currency: "INR",
    dailyLimit: 167, // ~5000/30 days
    monthlyLimit: 5000,
    features: [
      "5,000 emails/month",
      "Advanced templates",
      "Email scheduling",
      "Analytics & reporting",
      "Priority support",
    ],
    razorpayPlanId: process.env.RAZORPAY_STARTER_PLAN_ID,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 299,
    currency: "INR",
    dailyLimit: 600, // ~18000/30 days
    monthlyLimit: 18000,
    features: [
      "18,000 emails/month",
      "Custom domains",
      "Webhook integration",
      "Advanced automation",
      "24/7 support",
    ],
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID,
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 599,
    currency: "INR",
    dailyLimit: 1334, // ~40000/30 days
    monthlyLimit: 40000,
    features: [
      "40,000 emails/month",
      "Dedicated IP addresses",
      "White-label options",
      "Custom integrations",
      "Phone support",
    ],
    razorpayPlanId: process.env.RAZORPAY_PREMIUM_PLAN_ID,
  },
}

export function getPlanLimits(planId: string) {
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan) {
    return SUBSCRIPTION_PLANS.free
  }
  return plan
}