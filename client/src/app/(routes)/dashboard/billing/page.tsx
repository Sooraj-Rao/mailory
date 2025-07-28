/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, CheckCircle, Zap, Users, Star, Loader2 } from "lucide-react";
import { useZustandStore } from "@/zustand/store";
import { SUBSCRIPTION_PLANS } from "@/components/payment/subscription-modal";
import { formatDistanceToNowStrict } from "date-fns";

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

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Users className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "pro":
        return <Zap className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "premium":
        return <Star className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <Users className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "free":
        return "from-gray-500 to-gray-600";
      case "pro":
        return "from-purple-500 to-purple-600";
      case "premium":
        return "from-yellow-500 to-yellow-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  if (!subscription) {
    return (
      <div className="min-h-screen gap-x-2 app-gradient flex items-center justify-center p-4">
        <p>
          <Loader2 className=" animate-spin" />
        </p>
        <div className="text-foreground">Feteching Subscription info..</div>
      </div>
    );
  }

  const currentPlan = SUBSCRIPTION_PLANS[subscription.plan];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:pt-10 flex justify-center">
      <div className="w-full max-w-7xl">
        <div>
          <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
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
            {error && (
              <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
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
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${getPlanColor(
                          subscription.plan
                        )} flex items-center justify-center`}
                      >
                        {getPlanIcon(subscription.plan)}
                        <span className="text-white text-xs font-medium ml-1">
                          {subscription.plan.charAt(0).toUpperCase()}
                        </span>
                      </div>
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
                      className=" w-fit"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative p-4 sm:p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                        subscription.plan === plan.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border/40 bg-background/40 hover:bg-background/60"
                      }`}
                    >
                      {subscription.plan === plan.id && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            Current
                          </Badge>
                        </div>
                      )}

                      <div className="text-center space-y-4">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-gradient-to-br ${getPlanColor(
                            plan.id
                          )} flex items-center justify-center`}
                        >
                          {getPlanIcon(plan.id)}
                          <span className="text-white text-xs font-medium ml-1">
                            {plan.id.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">
                            {plan.name}
                          </h3>
                          <div className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                            ₹{plan.price}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {plan.price === 0 ? "forever" : "per month"}
                          </p>
                        </div>

                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Monthly
                            </span>
                            <span className="font-medium">
                              {plan.monthlyLimit.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Daily</span>
                            <span className="font-medium">
                              {plan.dailyLimit}
                            </span>
                          </div>
                        </div>

                        {subscription.plan === plan.id ? (
                          <Button
                            variant="grad"
                            disabled
                            className="w-full bg-transparent text-xs sm:text-sm"
                          >
                            Current Plan
                          </Button>
                        ) : plan.id === "free" ? (
                          <Button
                            variant="outline"
                            disabled
                            className="w-full bg-transparent text-xs sm:text-sm"
                          >
                            Not Available
                          </Button>
                        ) : (
                          <Button
                            variant="grad"
                            onClick={() => handleUpgrade(plan.id)}
                            disabled={loading !== ""}
                            className="w-full  text-xs sm:text-sm"
                          >
                            {loading === plan.id ? (
                              "Processing..."
                            ) : (
                              <>
                                <Crown className="w-4 h-4 mr-2" />
                                Upgrade
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
