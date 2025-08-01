"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  AlertTriangle,
  Search,
  Mail,
  Code,
  CheckCircle,
  PauseCircle,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { copyToClipboard } from "@/app/helper/copy";
import { useZustandStore } from "@/zustand/store";

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
    api: string;
    subject: string;
    status: string;
    sentAt: string;
  }>;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch email stats");
  }
  return data;
};

export default function EmailsPage() {
  const { userData } = useZustandStore();
  const {
    data: emailStats,
    error,
    mutate,
    isLoading,
  } = useSWR<EmailStats, Error>("/api/email-stats", fetcher);
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("15");
  const [apiNameFilter, setapiNameFilter] = useState("all");
  const [copyEmailId, setcopyEmailId] = useState("");

  const refreshData = async () => {
    setRefreshing(true);
    await mutate(); 
    setRefreshing(false);
    setSuccess("Data refreshed!");
    setTimeout(() => setSuccess(""), 2000);
  };

  useEffect(() => {
    if (success || error) toast(success || error?.message);
  }, [success, error]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-200 hover:bg-green-300 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-500 text-green-900 flex items-center justify-center">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        );

      case "pending":
        return (
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-200 hover:bg-blue-300 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-500 text-blue-900 flex items-center justify-center">
            <PauseCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        );

      case "failed":
        return (
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-200 hover:bg-red-300 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-500 text-red-900 flex items-center justify-center">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        );

      case "processing":
        return (
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60 dark:text-yellow-500 text-yellow-900 flex items-center justify-center">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        );

      default:
        return (
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-900/40 dark:hover:bg-gray-900/60 dark:text-gray-500 text-gray-900 flex items-center justify-center">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="green">Sent</Badge>;

      case "pending":
        return <Badge variant="blue">Pending</Badge>;

      case "failed":
        return <Badge variant="red">Failed</Badge>;

      case "processing":
        return <Badge variant="yellow">Processing</Badge>;

      default:
        return <Badge variant="gray">Unknown</Badge>;
    }
  };

  const filteredEmails =
    emailStats?.recentEmails.filter((email) => {
      const matchesSearch =
        email?.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email?.subject?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "sent" &&
          (email.status === "sent" || email.status === "delivered")) ||
        (statusFilter === "failed" && email.status === "failed") ||
        (statusFilter === "queued" && email.status === "queued") ||
        (statusFilter === "processing" && email.status === "processing");
      const matchApi = apiNameFilter === "all" || email.api == apiNameFilter;
      return matchesSearch && matchesStatus && matchApi;
    }) || [];

  if (!userData && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center app-gradient">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  const DropDownApi: string[] = [];
  emailStats?.recentEmails?.map((item) => {
    if (!DropDownApi.includes(item.api)) DropDownApi.push(item.api);
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 flex justify-center">
      <div className="w-full max-w-7xl">
        <div>
          <div className="flex h-12 sm:h-16 items-center px-2 sm:px-6">
            <div className="flex items-center justify-between w-full ml-2 sm:ml-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Emails</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Link target="_blank" href={"/docs/?to=send-email"}>
                  <Button
                    variant="outline"
                    className="custom-gradient hidden sm:flex bg-transparent"
                    size="sm"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    API
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
                    className={`w-4 h-4 ${
                      refreshing ? "animate-spin" : ""
                    } sm:mr-2`}
                  />
                  <span className="inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 sm:p-6">
          {emailStats && emailStats.limits.dailyRemaining <= 10 && (
            <Alert className="mb-4 sm:mb-6 border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
              <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Warning: You have only {emailStats.limits.dailyRemaining}{" "}
                  emails remaining today out of your{" "}
                  {emailStats.limits.dailyLimit} daily limit.
                </span>
                {emailStats.subscription.plan === "free" && (
                  <Link
                    href="/dashboard/billing"
                    className="underline whitespace-nowrap"
                  >
                    Upgrade your plan for higher limits.
                  </Link>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 custom-gradient2 placeholder:text-sm"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32 sm:w-40 custom-gradient2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="custom-gradient_dropdown">
                  <SelectItem value="15">Last 15 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 sm:w-40 custom-gradient2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="custom-gradient_dropdown">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={apiNameFilter}
                onValueChange={setapiNameFilter}
                defaultValue="all"
              >
                <SelectTrigger className="w-32 sm:w-40 custom-gradient2 hidden lg:flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="custom-gradient_dropdown">
                  <SelectItem value="all">All API Keys</SelectItem>
                  {DropDownApi?.map((item, i) => {
                    return (
                      <SelectItem key={i} value={item}>
                        {item}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 border-b text-muted-foreground text-sm font-bold custom-gradient2 hover:bg-transparent">
              <div className="col-span-4">To</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-4">Subject</div>
              <div className="col-span-2">Sent</div>
            </div>

            <div className="lg:hidden divide-y">
              {filteredEmails.length > 0 ? (
                filteredEmails.map((email, index) => (
                  <div key={index} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {email.subject}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNowStrict(new Date(email.sentAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(email.status)}
                      </div>
                    </div>
                    <div className="">
                      <button
                        disabled={copyEmailId !== ""}
                        onClick={() => {
                          copyToClipboard(email.to, "Email", false);
                          setcopyEmailId(String(index));
                          setTimeout(() => {
                            setcopyEmailId("");
                          }, 1000);
                        }}
                        className="font-medium flex items-center gap-2 group hover:decoration-primary decoration-dotted underline-offset-2 text-sm truncate"
                      >
                        <span className="truncate text-muted-foreground">
                          {email.to}
                        </span>
                        {copyEmailId === String(index) ? (
                          <Check
                            size={12}
                            className="text-green-500 flex-shrink-0"
                          />
                        ) : (
                          <Copy
                            size={12}
                            className="group-hover:visible invisible flex-shrink-0"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : isLoading ? (
                <div>
                  <div className="h-24 dark:bg-muted/40 bg-gray-300 animate-pulse"></div>
                  <div className="h-24 dark:bg-muted/20 bg-gray-200 animate-pulse"></div>
                  <div className="h-24 dark:bg-muted/40 bg-gray-300 animate-pulse"></div>
                  <div className="h-24 dark:bg-muted/20 bg-gray-200 animate-pulse"></div>
                  <div className="h-24 dark:bg-muted/40 bg-gray-300 animate-pulse"></div>
                  <div className="h-24 dark:bg-muted/20 bg-gray-200 animate-pulse"></div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-2">
                    {searchQuery || statusFilter !== "all"
                      ? "No emails match your filters"
                      : "No emails sent yet"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Start sending emails to see your activity here"}
                  </p>
                  <Link href={"/dashboard/api-keys"}>
                    <Button className="mt-3">
                      <Plus />
                      Create API key
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="hidden lg:block divide-y">
              {filteredEmails.length > 0 ? (
                filteredEmails.map((email, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-center gap-4 px-4 py-2 text-foreground/90 text-sm"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      {getStatusIcon(email.status)}
                      <button
                        disabled={copyEmailId !== ""}
                        onClick={() => {
                          copyToClipboard(email.to, "Email", false);
                          setcopyEmailId(String(index));
                          setTimeout(() => {
                            setcopyEmailId("");
                          }, 1000);
                        }}
                        className="font-medium flex items-center gap-2 group hover:decoration-primary decoration-dotted underline-offset-2 truncate"
                      >
                        <span className="truncate">{email.to}</span>
                        {copyEmailId === String(index) ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <Copy
                            size={12}
                            className="group-hover:visible invisible"
                          />
                        )}
                      </button>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {getStatusBadge(email.status)}
                    </div>
                    <div className="col-span-4 truncate">
                      <span>{email.subject}</span>
                    </div>
                    <div className="col-span-1 flex items-center min-w-28">
                      <span className="text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(email.sentAt), {
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
                  <div className="h-12 dark:bg-muted/20 bg-gray-200 animate-pulse"></div>
                  <div className="h-12 dark:bg-muted/40 bg-gray-300 animate-pulse"></div>
                  <div className="h-12 dark:bg-muted/20 bg-gray-200 animate-pulse"></div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-2">
                    {searchQuery || statusFilter !== "all"
                      ? "No emails match your filters"
                      : "No emails sent yet"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Start sending emails to see your activity here"}
                  </p>
                  <Link href={"/dashboard/api-keys"}>
                    <Button className="mt-3">
                      <Plus />
                      Create API key
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
