"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Key,
  Trash2,
  RefreshCw,
  Pencil,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNowStrict } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface ApiKeyDetail {
  id: string;
  keyName: string;
  token: string;
  createdAt: string;
  lastUsed: string | null;
  stats: {
    total: number;
    sent: number;
    failed: number;
    today: {
      total: number;
      sent: number;
      failed: number;
    };
  };
}

export default function ApiKeyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<ApiKeyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  useEffect(() => {
    fetchApiKey();
  }, [params.id]);

  const fetchApiKey = async () => {
    try {
      const response = await fetch(`/api/keys?apiId=${params.id}`);
      const data = await response.json();

      if (response.ok && data.success && data.apiKeys.length > 0) {
        setApiKey(data.apiKeys[0]);
        setNewKeyName(data.apiKeys[0].keyName);
      } else {
        setApiKey(null);
      }
    } catch (error) {
      console.error("Failed to fetch API key:", error);
      setApiKey(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchApiKey();
    setRefreshing(false);
    toast("Data refreshed!");
  };

  const deleteApiKey = async () => {
    try {
      const response = await fetch(`/api/keys?id=${params.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast("API key deleted successfully!");
        router.push("/dashboard/api-keys");
      } else {
        toast(data.error || "Failed to delete API key");
      }
    } catch {
      toast("Failed to delete API key");
    }
  };

  const updateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast("Key name cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyName: newKeyName, apiId: params.id }),
      });

      const data = await response.json();
      if (data.success) {
        toast(data.message);
        await fetchApiKey();
      } else {
        toast(data.error || "Failed to update API key");
      }
    } catch {
      toast("Failed to update API key");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gap-x-2 app-gradient flex items-center justify-center p-4">
        <p>
          <Loader2 className=" animate-spin" />
        </p>
        <div className="text-foreground">Fetching API key info..</div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            API Key Not Found
          </h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">
            The API key you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/dashboard/api-keys">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to API Keys
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getSuccessRate = (sent: number, total: number) => {
    return total > 0 ? Math.round((sent / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/api-keys" className="sm:hidden">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 custom-gradient5 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  API Key
                </p>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground break-all">
                  {apiKey.keyName}
                </h1>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <Button
              onClick={refreshData}
              disabled={refreshing}
              variant="outline"
              className="custom-gradient bg-transparent"
              size="sm"
            >
              <RefreshCw
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="More options">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Key
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 max-w-md">
                    <form onSubmit={updateApiKey}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Edit API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          Update the name of your API key.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Input
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="Enter new key name"
                          aria-label="New API key name"
                        />
                      </div>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          type="submit"
                          disabled={!newKeyName.trim()}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                        >
                          Save
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </form>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Separator className="bg-accent/50 my-1" />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Key
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this API key? This
                        action cannot be undone and will immediately revoke
                        access for any applications using this key.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteApiKey}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                      >
                        Delete Key
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="bg-background/60 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              API Token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center w-fit  gap-3">
              <code className="text-xs sm:text-sm font-mono bg-muted px-3 py-2 rounded flex-1 break-all">
                {apiKey.token}
              </code>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-background/60 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Uses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{apiKey.stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {getSuccessRate(apiKey.stats.sent, apiKey.stats.total)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">
                {apiKey.lastUsed
                  ? formatDistanceToNowStrict(new Date(apiKey.lastUsed), {
                      addSuffix: true,
                    })
                  : "Never"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base">
                {formatDistanceToNowStrict(new Date(apiKey.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-background/60 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Requests
                </span>
                <Badge variant="outline" className="text-lg font-bold">
                  {apiKey.stats.today.total}
                </Badge>
              </div>
              {apiKey.stats.today.total > 0 && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {apiKey.stats.today.sent}
                      </p>
                      <p className="text-xs text-muted-foreground">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {apiKey.stats.today.failed}
                      </p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">All Time Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Requests
                </span>
                <Badge variant="outline" className="text-lg font-bold">
                  {apiKey.stats.total}
                </Badge>
              </div>
              {apiKey.stats.total > 0 && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {apiKey.stats.sent}
                      </p>
                      <p className="text-xs text-muted-foreground">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {apiKey.stats.failed}
                      </p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
