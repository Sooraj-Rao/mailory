"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Building } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started",
    icon: Zap,
    color: "from-gray-500 to-gray-600",
    features: [
      "3,000 emails/month",
      "100 emails/day",
      "Basic email templates",
      "Email delivery tracking",
      "API access",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
    planId: "free",
  },
  {
    name: "Pro",
    price: "₹299",
    period: "per month",
    description: "For scaling companies",
    icon: Building,
    color: "from-purple-500 to-pink-500",
    features: [
      "18,000 emails/month",
      "600 emails/day",
      "Custom domains",
      "Webhook integration",
      "Advanced automation",
      "24/7 support",
    ],
    cta: "Start Pro Plan",
    popular: true,
    badge: "Most Popular",
    planId: "pro",
  },
  {
    name: "Premium",
    price: "₹599",
    period: "per month",
    description: "For large organizations",
    icon: Building,
    color: "from-orange-500 to-red-500",
    features: [
      "40,000 emails/month",
      "1,334 emails/day",
      "Dedicated IP addresses",
      "White-label options",
      "Custom integrations",
      "Phone support",
    ],
    cta: "Start Premium Plan",
    popular: false,
    planId: "premium",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Simple, </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises.
            Cancel anytime with our flexible pricing plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 ${
                plan.popular ? "ring-2 ring-cyan-500/50 scale-105" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                >
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-8">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-gray-300"
                    >
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === "Enterprise" ? "#contact" : "/register"}
                >
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400">
            All plans include our core features and 99.9% uptime guarantee.
            <Link
              href="#contact"
              className="text-cyan-400 hover:text-cyan-300 ml-1"
            >
              Need a custom plan?
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
