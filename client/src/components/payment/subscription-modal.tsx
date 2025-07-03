export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  dailyLimit: number;
  monthlyLimit: number;
  features: string[];
  razorpayPlanId?: string;
  batchEmailLimit?: number;
  apiKeysLimit?: number;
  prioritySupport?: boolean;
  analytics?: boolean;
  scheduling?: boolean;
  templates?: boolean;
  whiteLabel?: boolean;
  customDomain?: boolean;
  phoneSupport?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    dailyLimit: 100,
    monthlyLimit: 3000,
    batchEmailLimit: 50,
    apiKeysLimit: 2,
    prioritySupport: false,
    analytics: false,
    scheduling: false,
    templates: false,
    whiteLabel: false,
    customDomain: false,
    phoneSupport: false,
    features: [
      "✅ 3,000 emails/month",
      "🔹 Send transactional emails",
      "🔹 Send batch emails (max 50/day)",
      "🔹 Limited API access (2 keys)",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 199,
    currency: "INR",
    dailyLimit: 167, // ~5000/30
    monthlyLimit: 5000,
    batchEmailLimit: 100,
    apiKeysLimit: 3,
    prioritySupport: true,
    analytics: true,
    scheduling: true,
    templates: true,
    whiteLabel: false,
    customDomain: false,
    phoneSupport: false,
    features: [
      "✅ 5,000 emails/month",
      "🔹 All Free features with higher limits",
      "🔹 Email templates",
      "🔹 Email scheduling",
      "🔹 Basic analytics & reporting",
      "🔹 Priority support",
    ],
    razorpayPlanId: process.env.RAZORPAY_STARTER_PLAN_ID,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 499,
    currency: "INR",
    dailyLimit: 600,
    monthlyLimit: 18000,
    batchEmailLimit: 500,
    apiKeysLimit: 5,
    prioritySupport: true,
    analytics: true,
    scheduling: true,
    templates: true,
    whiteLabel: false,
    customDomain: false,
    phoneSupport: false,
    features: [
      "✅ 18,000 emails/month",
      "🔹 All Starter features",
      "🔹 Advanced automation",
      "🔹 Enhanced analytics",
      "🔹 24/7 support",
    ],
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID,
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 999,
    currency: "INR",
    dailyLimit: 1334,
    monthlyLimit: 40000,
    batchEmailLimit: 1000,
    apiKeysLimit: 10,
    prioritySupport: true,
    analytics: true,
    scheduling: true,
    templates: true,
    whiteLabel: true,
    customDomain: true,
    phoneSupport: true,
    features: [
      "✅ 40,000 emails/month",
      "🔹 All Pro features",
      "🔹 White-labeling options",
      "🔹 Custom integrations",
      "🔹 Higher Email API Limits + Priority Queuing",
      "🔹 Custom Domain",
      "🔹 Phone support",
    ],
    razorpayPlanId: process.env.RAZORPAY_PREMIUM_PLAN_ID,
  },
};

export function getPlanLimits(planId: string) {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    return SUBSCRIPTION_PLANS.free;
  }
  return plan;
}

export function getPlanFeatures(planId: string) {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    return SUBSCRIPTION_PLANS.free;
  }
  return {
    batchEmailLimit: plan.batchEmailLimit || 50,
    apiKeysLimit: plan.apiKeysLimit || 2,
    prioritySupport: plan.prioritySupport || false,
    analytics: plan.analytics || false,
    scheduling: plan.scheduling || false,
    templates: plan.templates || false,
    whiteLabel: plan.whiteLabel || false,
    customDomain: plan.customDomain || false,
    phoneSupport: plan.phoneSupport || false,
  };
}
