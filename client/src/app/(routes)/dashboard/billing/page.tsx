/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Crown, Loader2 } from "lucide-react";
import { useZustandStore } from "@/zustand/store";
import { SUBSCRIPTION_PLANS } from "@/components/payment/subscription-modal";
import { formatDistanceToNowStrict } from "date-fns";
import { toast } from "sonner";

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

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch subscription");
  }
  return data.subscription;
};

export default function BillingPage() {
  const { userData } = useZustandStore();
  const {
    data: subscription,
    error,
    mutate,
    isLoading,
  } = useSWR<UserSubscription | null, Error>("/api/payments", fetcher);
  const [loading, setLoading] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (success) {
      toast(success);
    } else if (error) {
      toast("Error occured");
    }
  }, [success, error]);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  const handleUpgrade = async (planId: string) => {
    if (!userData || planId === "free") return;

    setLoading(planId);

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
        name: "Mailory",
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
              await mutate()
            } else {
              toast(verifyData.error);
            }
          } catch {
            toast("Payment verification failed");
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
      toast(err.message);
    } finally {
      setLoading("");
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  if (!subscription && isLoading) {
    return (
      <div className="min-h-screen gap-x-2 app-gradient flex items-center justify-center p-4">
        <p>
          <Loader2 className="animate-spin" />
        </p>
        <div className="text-foreground">Fetching Subscription info...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen gap-x-2 app-gradient flex items-center justify-center p-4">
        <div className="text-foreground">No subscription data available</div>
      </div>
    );
  }

  const currentPlan = SUBSCRIPTION_PLANS[subscription.plan];

  return (
    <div className="min-h-screen py-4 sm:p-6 lg:pt-10 flex justify-center">
      <div className="w-full max-w-7xl">
        <div>
          <div className="bg-background/80 backdrop-blur-sm">
            <div className="flex h-14 sm:h-16 items-center px-4 sm:px-6">
              <div className="flex items-center gap-3 ml-4">
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
                    Billing & Subscription
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <AlertDescription className="text-sm">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="lg:col-span-2 border-border/40 bg-background/60 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                          {currentPlan.name} Plan
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          ₹{currentPlan.price}
                          {currentPlan.price === 0 ? " forever" : "/month"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className="w-fit"
                      variant={
                        subscription.status === "active" ? "green" : "gray"
                      }
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Daily Usage
                        </span>
                        <span className="font-medium">
                          {subscription.emailLimits.dailyUsed} /{" "}
                          {subscription.emailLimits.dailyLimit}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getUsagePercentage(
                              subscription.emailLimits.dailyUsed,
                              subscription.emailLimits.dailyLimit
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Monthly Usage
                        </span>
                        <span className="font-medium">
                          {subscription.emailLimits.monthlyUsed} /{" "}
                          {subscription.emailLimits.monthlyLimit}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getUsagePercentage(
                              subscription.emailLimits.monthlyUsed,
                              subscription.emailLimits.monthlyLimit
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {subscription.startDate && subscription.endDate && (
                <Card className="border-border/40 bg-background/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pl-6 border-l-2 border-primary space-y-6">
                      {subscription.startDate && (
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="absolute -left-8 w-4 h-4 bg-primary rounded-full shadow"></div>
                            <span className="font-semibold text-sm sm:text-base">
                              Upgraded on
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            <span className="mr-2">
                              {new Date(
                                subscription.startDate
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-xs">
                              (
                              {formatDistanceToNowStrict(
                                new Date(subscription.startDate),
                                {
                                  addSuffix: true,
                                }
                              )}
                              )
                            </span>
                          </p>
                        </div>
                      )}
                      {subscription.endDate && (
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="absolute -left-8 w-4 h-4 bg-green-500 rounded-full shadow"></div>
                            <span className="font-semibold text-sm sm:text-base">
                              Renews on
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            <span className="mr-2">
                              {new Date(
                                subscription.endDate
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-xs">
                              (
                              {formatDistanceToNowStrict(
                                new Date(subscription.endDate),
                                {
                                  addSuffix: true,
                                }
                              )}
                              )
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="border-border/40 bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Choose Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
                    const isCurrent = subscription.plan === plan.id;
                    const isFree = plan.id === "free";
                    const isLoading = loading === plan.id;

                    return (
                      <div
                        key={plan.id}
                        className={`relative p-6 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                          isCurrent
                            ? "border-primary bg-primary/5 shadow-lg"
                            : "border-border/30 bg-background hover:bg-muted/40"
                        }`}
                      >
                        {isCurrent && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-full shadow">
                              Current
                            </Badge>
                          </div>
                        )}

                        <div className="text-center space-y-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {plan.name}
                          </h3>
                          <div className="text-2xl font-bold text-foreground">
                            ₹{plan.price ?? "Custom"}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {plan.price === 0
                              ? "forever"
                              : plan.price
                              ? "per month"
                              : "based on usage"}
                          </p>
                        </div>

                        {(plan.monthlyLimit || plan.dailyLimit) && (
                          <div className="space-y-2 text-sm mt-4">
                            {plan.monthlyLimit && (
                              <div className="flex items-center justify-between text-muted-foreground">
                                <span>Monthly</span>
                                <span className="font-medium text-foreground">
                                  {plan.monthlyLimit.toLocaleString()} emails
                                </span>
                              </div>
                            )}
                            {plan.dailyLimit && (
                              <div className="flex items-center justify-between text-muted-foreground">
                                <span>Daily</span>
                                <span className="font-medium text-foreground">
                                  {plan.dailyLimit} emails
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {Array.isArray(plan.features) && (
                          <ul className="mt-4 space-y-2 hidden text-sm">
                            {plan.features.map((feature, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-foreground"
                              >
                                <Check className="w-4 h-4 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-6">
                          {isCurrent ? (
                            <Button
                              disabled
                              className="w-full bg-muted/30 text-muted-foreground text-sm"
                            >
                              Current Plan
                            </Button>
                          ) : isFree ? (
                            <Button
                              variant="outline"
                              disabled
                              className="w-full text-muted-foreground text-sm"
                            >
                              Not Available
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleUpgrade(plan.id)}
                              disabled={loading !== ""}
                              className="w-full text-sm flex items-center justify-center gap-2"
                            >
                              {isLoading ? (
                                "Processing..."
                              ) : (
                                <>
                                  <Crown className="w-4 h-4" />
                                  Upgrade
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
