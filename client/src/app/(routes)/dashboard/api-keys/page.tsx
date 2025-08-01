/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RefreshCw,
  Search,
  Key,
  Copy,
  Plus,
  ExternalLink,
  AlertTriangle,
  ShieldQuestionIcon,
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { copyToClipboard } from "@/app/helper/copy";

interface ApiKey {
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

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch API keys");
  }
  return data.apiKeys.reverse();
};

export default function ApiKeysPage() {
  const {
    data: apiKeys = [],
    error,
    mutate,
    isLoading,
  } = useSWR<ApiKey[], Error>("/api/keys", fetcher);
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isLoadingAction, setIsLoadingAction] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState<{
    keyName: string;
    keyValue: string;
  } | null>(null);

  const refreshData = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
    setSuccess("Data refreshed!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setIsLoadingAction("create");
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
      if (data?.success && data?.apiKey) {
        setApiKeyValue(data?.apiKey);
        setNewKeyName("");
        setSuccess("API key created successfully!");
        if (data?.apiKey?.keyValue) {
          copyToClipboard(data?.apiKey?.keyValue, "", false);
        }
        await mutate();
      } else {
        throw new Error(data.error || "Failed to create API key");
      }
    } catch (err: any) {
      toast(err.message || "Failed to create API key");
    } finally {
      setIsLoadingAction("");
    }
  };

  useEffect(() => {
    if (success || error) toast(success || error?.message);
  }, [success, error]);

  const getStatusIcon = () => {
    return (
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-200 hover:bg-green-300 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-500 text-green-900 flex items-center justify-center">
        <Key className="w-3 h-3 sm:w-4 sm:h-4" />
      </div>
    );
  };

  const getStatusBadge = () => {
    return (
      <Badge className="bg-green-200 hover:bg-green-300 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-500 text-green-900 text-xs">
        Active
      </Badge>
    );
  };

  const getUsageText = (apiKey: ApiKey) => `${apiKey.stats.total} times`;

  const filteredApiKeys = apiKeys.filter((apiKey) => {
    const matchesSearch =
      apiKey.keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apiKey.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 flex justify-center">
      <div className="w-full max-w-7xl">
        <div>
          <div className="flex h-14 sm:h-16 items-center px-4 sm:px-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
                  API Keys
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Dialog
                  open={showCreateDialog}
                  onOpenChange={() => {
                    setShowCreateDialog(!showCreateDialog);
                    setApiKeyValue(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button disabled={apiKeys.length >= 5} size="sm">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Create API Key</span>
                      <span className="sm:hidden">Create</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    className="bg-background border-border w-[95vw] max-w-md mx-auto"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">
                        {apiKeyValue?.keyName && apiKeyValue?.keyValue
                          ? apiKeyValue?.keyName
                          : "Add API Key"}
                      </DialogTitle>
                      {!apiKeyValue?.keyName && !apiKeyValue?.keyValue && (
                        <DialogDescription className="text-sm">
                          Create a new API key for your application
                        </DialogDescription>
                      )}
                    </DialogHeader>
                    {apiKeyValue?.keyName && apiKeyValue.keyValue ? (
                      <>
                        <div className="my-4 flex items-start gap-3 rounded-lg border text-sm border-yellow-400/40 bg-yellow-400/5 p-4 text-yellow-500">
                          <AlertTriangle
                            size={18}
                            className="mt-0.5 flex-shrink-0"
                          />
                          <span className="text-xs sm:text-sm">
                            Make sure to copy your API key now. You won&apos;t
                            see it again.
                          </span>
                        </div>
                        <div className="mb-4 rounded-md px-4 py-2 text-xs sm:text-sm font-mono text-muted-foreground truncate border break-all">
                          {apiKeyValue?.keyValue}
                        </div>
                        <Button
                          onClick={() =>
                            copyToClipboard(apiKeyValue.keyValue, "API key")
                          }
                          className="flex items-center gap-2 text-sm w-full"
                        >
                          Copy
                          <Copy size={14} />
                        </Button>
                      </>
                    ) : (
                      <form onSubmit={createApiKey} className="space-y-4">
                        <div>
                          <Label htmlFor="keyName" className="text-sm">
                            Name
                          </Label>
                          <Input
                            id="keyName"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="Your API Key name"
                            required
                            className="text-sm"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            type="submit"
                            disabled={isLoadingAction === "create"}
                            className="flex-1 text-sm"
                          >
                            {isLoadingAction === "create"
                              ? "Creating..."
                              : "Add"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                            className="text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
                <Link target="_blank" href={"/docs/?to=send-email"}>
                  <Button
                    variant="outline"
                    className="custom-gradient bg-transparent"
                  >
                    <ShieldQuestionIcon />
                    How to Use
                  </Button>
                </Link>
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
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search API keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 custom-gradient2 text-sm"
              />
            </div>
          </div>

          <div className="hidden lg:block rounded-lg border overflow-hidden">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 border-b text-muted-foreground text-sm font-bold custom-gradient2 hover:bg-transparent">
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Usage</div>
              <div className="col-span-2">Last Used</div>
              <div className="col-span-2">Created</div>
            </div>
            <div className="divide-y">
              {filteredApiKeys.length > 0 ? (
                filteredApiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="grid grid-cols-12 items-center gap-4 px-4 py-3 text-foreground/90 text-sm transition-colors"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      {getStatusIcon()}
                      <div className="flex flex-col group min-w-0">
                        <Link
                          href={`/dashboard/api-keys/${apiKey.id}`}
                          className="hover:underline underline-offset-2 group flex items-center gap-x-2"
                        >
                          <p className="font-medium flex items-center gap-2 group truncate text-left">
                            {apiKey.keyName}
                          </p>
                          <ExternalLink
                            className="group-hover:block hidden flex-shrink-0"
                            size={14}
                          />
                        </Link>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {getStatusBadge()}
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span>{getUsageText(apiKey)}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-muted-foreground">
                        {apiKey.lastUsed
                          ? formatDistanceToNowStrict(
                              new Date(apiKey.lastUsed),
                              {
                                addSuffix: true,
                              }
                            )
                          : "Never"}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(apiKey.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : isLoading ? (
                <div>
                  <div className="h-12 dark:bg-muted/40 bg-gray-300 animate-pulse"></div>
                  <div className="h-12 dark:bg-muted/20 bg-gray-200 animate-pulse"></div>
                  <div className="h-12 dark:bg-muted/40 bg-gray-300 animate-pulse"></div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg mb-2">
                    {searchQuery
                      ? "No API keys match your search"
                      : "No API keys created yet"}
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchQuery
                      ? "Try adjusting your search criteria"
                      : "Create your first API key to get started"}
                  </p>
                  {!searchQuery && (
                    <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First API Key
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:hidden space-y-4">
            {filteredApiKeys.length > 0 ? (
              filteredApiKeys.map((apiKey) => (
                <Card
                  key={apiKey.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {getStatusIcon()}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/dashboard/api-keys/${apiKey.id}`}
                            className="block group"
                          >
                            <CardTitle className="text-base sm:text-lg font-medium group-hover:underline truncate flex items-center gap-2">
                              {apiKey.keyName}
                              <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardTitle>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>Usage</span>
                        </div>
                        <p className="font-medium">{getUsageText(apiKey)}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>Last Used</span>
                        </div>
                        <p className="font-medium">
                          {apiKey.lastUsed
                            ? formatDistanceToNowStrict(
                                new Date(apiKey.lastUsed),
                                {
                                  addSuffix: true,
                                }
                              )
                            : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Created{" "}
                          {formatDistanceToNowStrict(
                            new Date(apiKey.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : isLoading ? (
              <div>
                <div className="h-24 dark:bg-muted/40 bg-gray-300 animate-pulse"></div>
                <div className="h-24 dark:bg-muted/20 bg-gray-200 animate-pulse"></div>
                <div className="h-24 dark:bg-muted/20 bg-gray-200 animate-pulse"></div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-2">
                  {searchQuery
                    ? "No API keys match your search"
                    : "No API keys created yet"}
                </p>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Create your first API key to get started"}
                </p>
                {!searchQuery && (
                  <Button
                    className="custom-gradient"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First API Key
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
