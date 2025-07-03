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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  Key,
  ArrowRight,
  BarChart3,
  Zap,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { SidebarTrigger } from "@/components/home/sidebar";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string;
}

interface EmailStats {
  today: {
    sent: number;
    failed: number;
    total: number;
    remaining: number;
  };
  total: {
    sent: number;
    failed: number;
    total: number;
  };
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    dailyUsed: number;
    monthlyUsed: number;
    dailyRemaining: number;
    monthlyRemaining: number;
  };
  subscription: {
    plan: string;
    status: string;
  };
  recentEmails: Array<{
    to: string;
    subject: string;
    status: string;
    sentAt: string;
  }>;
}

export default function SendEmailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchEmailStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      } else {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  };

  const fetchEmailStats = async () => {
    try {
      const response = await fetch("/api/email-stats");
      const data = await response.json();
      if (response.ok) {
        setEmailStats(data);
      } else {
        setError(data.error || "Failed to fetch email stats");
      }
    } catch {
      setError("Failed to fetch email stats");
      console.error("Failed to fetch email stats");
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchEmailStats();
    setRefreshing(false);
    setSuccess("Data refreshed!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-500";
      case "starter":
        return "bg-blue-500";
      case "pro":
        return "bg-purple-500";
      case "premium":
        return "bg-gold-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center app-gradient">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-gradient overflow-y-auto">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <SidebarTrigger />
          <div className="flex items-center justify-between w-full ml-4">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                Send Email API
              </h1>
              <p className="text-muted-foreground text-sm">
                Transactional email service
              </p>
            </div>
            <div className="flex items-center gap-4">
              {emailStats && (
                <Badge
                  className={`${getPlanColor(
                    emailStats.subscription.plan
                  )} hover:${getPlanColor(emailStats.subscription.plan)}`}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {getPlanName(emailStats.subscription.plan)} Plan
                </Badge>
              )}
              <Button
                onClick={refreshData}
                variant="outline"
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <Alert className="mb-6 border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Limit Warning */}
        {emailStats && emailStats.limits.dailyRemaining <= 10 && (
          <Alert className="mb-6 border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: You have only {emailStats.limits.dailyRemaining} emails
              remaining today.
              {emailStats.subscription.plan === "free" && (
                <Link href="/dashboard/billing" className="ml-2 underline">
                  Upgrade your plan for higher limits.
                </Link>
              )}
            </AlertDescription>
          </Alert>
        )}

        {emailStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Today&apos;s API Calls
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {emailStats.today.total}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {emailStats.today.sent} sent, {emailStats.today.failed}{" "}
                      failed
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Daily Remaining
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {emailStats.limits.dailyRemaining}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      out of {emailStats.limits.dailyLimit} daily limit
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Monthly Remaining
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {emailStats.limits.monthlyRemaining}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      out of {emailStats.limits.monthlyLimit} monthly
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Success Rate
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {emailStats.total.total > 0
                        ? Math.round(
                            (emailStats.total.sent / emailStats.total.total) *
                              100
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground">
                      delivery success
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Key Management Card */}
        <Card className="card-gradient mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              API Key Required
            </CardTitle>
            <CardDescription>
              You need an API key to send emails via our API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div>
                <p className="font-medium mb-1">Manage your API keys</p>
                <p className="text-sm text-muted-foreground">
                  Create, view, and manage your API keys for email sending
                </p>
              </div>
              <Link href="/dashboard/api-keys">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                  Manage API Keys
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Learn how to integrate with our email service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Endpoint</h3>
              <code className="block bg-muted p-3 rounded text-sm">
                POST{" "}
                {typeof window !== "undefined" ? window.location.origin : ""}
                /api/send-email
              </code>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Headers</h3>
              <code className="block bg-muted p-3 rounded text-sm whitespace-pre">
                {`Content-Type: application/json
Authorization: Bearer YOUR_API_KEY`}
              </code>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Request Body</h3>
              <code className="block bg-muted p-3 rounded text-sm whitespace-pre">
                {`{
  "to": "recipient@example.com",
  "subject": "Your email subject",
  "html": "<h1>Hello World!</h1><p>This is an HTML email.</p>",
  "text": "Hello World! This is a plain text email.",
  "from": "Your Name"
}`}
              </code>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Example with cURL</h3>
              <code className="block bg-muted p-3 rounded text-sm whitespace-pre">
                {`curl -X POST ${
                  typeof window !== "undefined" ? window.location.origin : ""
                }/api/send-email \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello!</h1>",
    "text": "Hello!",
    "from": "Your App"
  }'`}
              </code>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Rate Limits</h3>
              {emailStats && (
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    {emailStats.limits.dailyLimit} emails per day on{" "}
                    {emailStats.subscription.plan} plan
                  </li>
                  <li>{emailStats.limits.monthlyLimit} emails per month</li>
                  <li>Rate limit resets daily at midnight UTC</li>
                  <li>HTTP 429 status code when limit exceeded</li>
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Emails */}
        {emailStats && (
          <Card className="card-gradient mt-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Recent API Activity
              </CardTitle>
              <CardDescription>
                Your latest transactional email activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailStats.recentEmails.length > 0 ? (
                  emailStats.recentEmails.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                    >
                      <div className="flex-1">
                        <p className="text-foreground font-medium mb-1">
                          {email.subject}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          To: {email.to}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            email.status === "sent" ? "default" : "destructive"
                          }
                          className={
                            email.status === "sent"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }
                        >
                          {email.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(email.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-2">
                      No emails sent yet
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Start sending emails to see your activity here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
