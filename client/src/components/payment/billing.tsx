/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Crown,
  CheckCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { SidebarTrigger } from "@/components/home/sidebar";
import { useZustandStore } from "@/zustand/store";
import { SUBSCRIPTION_PLANS } from "./subscription-modal";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UserSubscription {
  plan: string;
  status: string;
  startDate?: string;
  endDate?: string;
  emailLimits: {
    dailyLimit: number;
    monthlyLimit: number;
    dailyUsed: number;
    monthlyUsed: number;
  };
}

export default function BillingPage() {
  const { userData } = useZustandStore();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSubscription();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/payments");
      const data = await response.json();
      if (response.ok) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!userData || planId === "free") return;

    setLoading(planId);
    setError("");

    try {
      const response = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "SendMailr",
        description: `${SUBSCRIPTION_PLANS[planId].name} Plan Subscription`,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              setSuccess("Subscription activated successfully!");
              fetchSubscription();
            } else {
              setError(verifyData.error);
            }
          } catch {
            setError("Payment verification failed");
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
        },
        theme: {
          color: "#0891b2",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading("");
    }
  };

  if (!subscription) {
    return (
      <div className="min-h-screen app-gradient flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  const currentPlan = SUBSCRIPTION_PLANS[subscription.plan];

  return (
    <div className="min-h-screen app-gradient overflow-y-auto">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <SidebarTrigger />
          <div className="flex items-center justify-between w-full ml-4">
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Subscription
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage your subscription and billing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <Alert className="mb-6 border-destructive/50 text-destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-500/50 text-green-600">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Current Plan */}
        <Card className="card-gradient mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Plan</span>
              <Badge
                variant={
                  subscription.status === "active" ? "default" : "secondary"
                }
                className={
                  subscription.status === "active"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }
              >
                {subscription.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {currentPlan.name}
                </h3>
                <p className="text-muted-foreground">
                  ₹{currentPlan.price}/
                  {currentPlan.price === 0 ? "forever" : "month"}
                </p>
              </div>
              <div className="text-right">
                {subscription.endDate && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Renews on{" "}
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Daily Usage
                  </span>
                  <TrendingUp className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {subscription.emailLimits.dailyUsed}
                </div>
                <div className="text-sm text-muted-foreground">
                  of {subscription.emailLimits.dailyLimit} emails
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Monthly Usage
                  </span>
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {subscription.emailLimits.monthlyUsed}
                </div>
                <div className="text-sm text-muted-foreground">
                  of {subscription.emailLimits.monthlyLimit} emails
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Upgrade your plan to get higher email limits and more features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-lg border transition-all ${
                    subscription.plan === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <div className="text-2xl font-bold text-foreground mt-2">
                      ₹{plan.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plan.price === 0 ? "forever" : "per month"}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="text-sm">
                      <span className="font-medium">
                        {plan.monthlyLimit.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        emails/month
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{plan.dailyLimit}</span>
                      <span className="text-muted-foreground"> emails/day</span>
                    </div>
                  </div>

                  {subscription.plan === plan.id ? (
                    <Button variant="outline" disabled className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button variant="outline" disabled className="w-full">
                      Downgrade Not Available
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading !== ""}
                      className="w-full"
                      variant={loading === plan.id ? "grad2" : "grad1"}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {loading === plan.id ? "Processing..." : "Upgrade"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
