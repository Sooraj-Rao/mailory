"use client";

import Link from "next/link";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Copy,
  Key,
  Mail,
  BarChart3,
  LogOut,
  Plus,
  Trash2,
  RefreshCw,
  Users,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface ApiKey {
  id: string;
  keyName: string;
  keyValue?: string;
  createdAt: string;
  lastUsed: string;
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
  recentEmails: Array<{
    to: string;
    subject: string;
    status: string;
    sentAt: string;
  }>;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    await Promise.all([fetchApiKeys(), fetchEmailStats()]);
  };

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/keys", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setApiKeys(data.apiKeys);
      }
    } catch  {
      console.error("Failed to fetch API keys");
    }
  };

  const fetchEmailStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/email-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setEmailStats(data);
      }
    } catch {
      console.error("Failed to fetch email stats");
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    setSuccess("Data refreshed!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ keyName: newKeyName }),
      });

      const data = await response.json();

      if (data.success) {
        setNewlyCreatedKey(data.apiKey.keyValue);
        setShowNewKeyDialog(true);
        setNewKeyName("");
        fetchApiKeys();
      } else {
        setError(data.error);
      }
    } catch  {
      setError("Failed to create API key");
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (keyId: string, keyName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the API key "${keyName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/keys?id=${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess("API key deleted successfully!");
        fetchApiKeys();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete API key");
      }
    } catch  {
      setError("Failed to delete API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Email Service Dashboard
            </h1>
            <p className="text-slate-300">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/batch-email">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <Users className="w-4 h-4 mr-2" />
                Batch Email
              </Button>
            </Link>
            <Button
              onClick={refreshData}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-4 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-500/10">
            <AlertDescription className="text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-purple-600"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="api-keys"
              className="data-[state=active]:bg-purple-600"
            >
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger
              value="documentation"
              className="data-[state=active]:bg-purple-600"
            >
              <Mail className="w-4 h-4 mr-2" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {emailStats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-slate-700 bg-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-300">
                        Today&apos;s Emails
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {emailStats.today.total}
                      </div>
                      <p className="text-xs text-slate-400">
                        {emailStats.today.sent} sent, {emailStats.today.failed}{" "}
                        failed
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700 bg-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-300">
                        Remaining Today
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {emailStats.today.remaining}
                      </div>
                      <p className="text-xs text-slate-400">
                        out of 50 daily limit
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700 bg-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-300">
                        Total Sent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {emailStats.total.sent}
                      </div>
                      <p className="text-xs text-slate-400">all time</p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700 bg-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-300">
                        Success Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {emailStats.total.total > 0
                          ? Math.round(
                              (emailStats.total.sent / emailStats.total.total) *
                                100
                            )
                          : 0}
                        %
                      </div>
                      <p className="text-xs text-slate-400">delivery success</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-slate-700 bg-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Emails</CardTitle>
                    <CardDescription className="text-slate-300">
                      Your latest email activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {emailStats.recentEmails.length > 0 ? (
                        emailStats.recentEmails.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                {email.subject}
                              </p>
                              <p className="text-sm text-slate-400">
                                To: {email.to}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  email.status === "sent"
                                    ? "default"
                                    : "destructive"
                                }
                                className={
                                  email.status === "sent"
                                    ? "bg-green-600"
                                    : "bg-red-600"
                                }
                              >
                                {email.status}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                {new Date(email.sentAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 text-center py-8">
                          No emails sent yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Create New API Key</CardTitle>
                <CardDescription className="text-slate-300">
                  Generate a new API key to access the email service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createApiKey} className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="keyName" className="text-slate-200">
                      Key Name
                    </Label>
                    <Input
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production API Key"
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 mt-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? "Creating..." : "Create Key"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Your API Keys</CardTitle>
                <CardDescription className="text-slate-300">
                  Manage your existing API keys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-medium">
                          {key.keyName}
                        </h3>
                        <p className="text-sm text-slate-400">
                          Created:{" "}
                          {new Date(key.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Last used:{" "}
                          {key.lastUsed
                            ? new Date(key.lastUsed).toLocaleDateString()
                            : "Never"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600">Active</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteApiKey(key.id, key.keyName)}
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {apiKeys.length === 0 && (
                    <p className="text-slate-400 text-center py-8">
                      No API keys created yet. Create your first API key above.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">API Documentation</CardTitle>
                <CardDescription className="text-slate-300">
                  Learn how to integrate with our email service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Endpoint
                  </h3>
                  <code className="block bg-slate-900 p-3 rounded text-green-400">
                    POST{" "}
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : ""}
                    /api/send-email
                  </code>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Headers
                  </h3>
                  <code className="block bg-slate-900 p-3 rounded text-green-400">
                    {`Content-Type: application/json
x-api-key: YOUR_API_KEY`}
                  </code>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Request Body
                  </h3>
                  <code className="block bg-slate-900 p-3 rounded text-green-400 whitespace-pre">
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
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Example with cURL
                  </h3>
                  <code className="block bg-slate-900 p-3 rounded text-green-400 whitespace-pre text-sm">
                    {`curl -X POST ${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }/api/send-email \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello!</h1><p>This is a test email.</p>",
    "from": "Your App"
  }'`}
                  </code>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Response
                  </h3>
                  <code className="block bg-slate-900 p-3 rounded text-green-400 whitespace-pre">
                    {`{
  "success": true,
  "messageId": "0000014a-f4d4-4f45-99c6-example",
  "to": ["recipient@example.com"],
  "dailyUsage": {
    "sent": 1,
    "limit": 50,
    "remaining": 49
  }
}`}
                  </code>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">
                    Rate Limits
                  </h4>
                  <ul className="text-slate-300 space-y-1">
                    <li>• 50 emails per day per user</li>
                    <li>• Rate limit resets at midnight UTC</li>
                    <li>• API returns 429 status when limit exceeded</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                API Key Created Successfully!
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Please copy your API key now. You won&apos;t be able to see it again
                for security reasons.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-lg">
                <Label className="text-slate-300 text-sm">Your API Key:</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 p-2 bg-slate-700 rounded text-green-400 font-mono text-sm break-all">
                    {newlyCreatedKey}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-400 text-sm">
                  ⚠️ <strong>Important:</strong> This is the only time you&apos;ll
                  see this API key. Make sure to copy and store it securely.
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowNewKeyDialog(false);
                  setNewlyCreatedKey("");
                }}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                I&apos;ve Copied the Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
