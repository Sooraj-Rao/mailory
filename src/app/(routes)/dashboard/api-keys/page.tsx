"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
  Plus,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { SidebarTrigger } from "@/components/home/sidebar";

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
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchApiKeys(), fetchEmailStats()]);
  };

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/keys");
      const data = await response.json();
      if (response.ok) {
        setApiKeys(data.apiKeys);
      }
    } catch {
      console.error("Failed to fetch API keys");
    }
  };

  const fetchEmailStats = async () => {
    try {
      const response = await fetch("/api/email-stats");
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
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    } catch {
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
      const response = await fetch(`/api/keys?id=${keyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("API key deleted successfully!");
        fetchApiKeys();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete API key");
      }
    } catch {
      setError("Failed to delete API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <div className="min-h-screen app-gradient">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <SidebarTrigger />
          <div className="flex items-center justify-between w-full ml-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
                <Key className="w-6 h-6 text-cyan-400" />
                API Keys
              </h1>
              <p className="text-muted-foreground">
                Manage your API keys and view usage statistics
              </p>
            </div>
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
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
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
                      Remaining Today
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {emailStats.today.remaining}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      out of 100 daily limit
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total API Calls
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {emailStats.total.total}
                    </p>
                    <p className="text-xs text-muted-foreground">all time</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
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
                      API success rate
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="card-gradient mb-6">
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key to access the email service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createApiKey} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="mt-6">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Creating..." : "Create Key"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>Manage your existing API keys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      {key.keyName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last used:{" "}
                      {key.lastUsed
                        ? new Date(key.lastUsed).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 hover:bg-green-700">
                      Active
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteApiKey(key.id, key.keyName)}
                      className="text-destructive border-destructive/50 hover:bg-destructive/10 dark:text-destructive dark:border-destructive/80 dark:hover:bg-destructive/95"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && (
                <div className="text-center py-12">
                  <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">
                    No API keys created yet
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Create your first API key above to get started
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              API Key Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Please copy your API key now. You won&apos;t be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm break-all text-foreground">
                {newlyCreatedKey}
              </code>
            </div>
            <Button
              onClick={() => copyToClipboard(newlyCreatedKey)}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
