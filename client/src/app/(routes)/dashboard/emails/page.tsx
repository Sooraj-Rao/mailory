"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw,
  AlertTriangle,
  Search,
  MoreHorizontal,
  Mail,
  Code,
  CheckCircle,
  PauseCircle,
  AlertCircle,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { SidebarTrigger } from "@/components/home/sidebar";
import { useZustandStore } from "@/zustand/store";
import { formatDistanceToNowStrict } from "date-fns";
import { copyToClipboard } from "@/app/helper/copy";

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

export default function DashboardPage() {
  const { userData } = useZustandStore();
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("15");
  const [copyEmailId, setcopyEmailId] = useState("");

  useEffect(() => {
    fetchEmailStats();
  }, []);

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

  useEffect(() => {
    if (success || error) toast(success || error);
  }, [success, error]);

  // const getPlanColor = (plan: string) => {
  //   switch (plan) {
  //     case "free":
  //       return "bg-gray-500";
  //     case "starter":
  //       return "bg-blue-500";
  //     case "pro":
  //       return "bg-purple-500";
  //     case "premium":
  //       return "bg-gold-500";
  //     default:
  //       return "bg-gray-500";
  //   }
  // };

  // const getPlanName = (plan: string) => {
  //   return plan.charAt(0).toUpperCase() + plan.slice(1);
  // };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return (
          <div className="w-8 h-8 rounded-full bg-green-200 hover:bg-green-300 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-500 text-green-900 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />{" "}
          </div>
        );

      case "pending":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-200 hover:bg-blue-300 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-500 text-blue-900 flex items-center justify-center">
            <PauseCircle className="w-4 h-4" />
          </div>
        );

      case "failed":
        return (
          <div className="w-8 h-8 rounded-full bg-red-200 hover:bg-red-300 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-500 text-red-900  flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        );

      case "processing":
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60 dark:text-yellow-500 text-yellow-900 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        );

      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-900/40 dark:hover:bg-gray-900/60 dark:text-gray-500 text-gray-900 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
        );
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return (
          <Badge className="bg-green-200 hover:bg-green-300 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-500 text-green-900">
            Sent
          </Badge>
        );

      case "pending":
        return (
          <Badge className="bg-blue-200 hover:bg-blue-300 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-500 text-blue-900">
            Pending
          </Badge>
        );

      case "failed":
        return (
          <Badge className="bg-red-200 hover:bg-red-300 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-500 text-red-900">
            Failed
          </Badge>
        );

      case "processing":
        return (
          <Badge className="bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60 dark:text-yellow-500 text-yellow-900">
            Processing
          </Badge>
        );

      default:
        return (
          <Badge className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-900/40 dark:hover:bg-gray-900/60 dark:text-gray-500 text-gray-900">
            Unknown
          </Badge>
        );
    }
  };

  const filteredEmails =
    emailStats?.recentEmails.filter((email) => {
      const matchesSearch =
        email?.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email?.subject?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "delivered" &&
          (email.status === "sent" || email.status === "delivered")) ||
        (statusFilter === "failed" && email.status === "failed") ||
        (statusFilter === "queued" && email.status === "queued") ||
        (statusFilter === "processing" && email.status === "processing");

      return matchesSearch && matchesStatus;
    }) || [];

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center app-gradient">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen m-10   flex justify-center ">
      <div className=" w-[64rem]">
        <div>
          <div className="flex h-16 items-center px-6">
            <SidebarTrigger />
            <div className="flex items-center justify-between w-full ">
              <div>
                <h1 className="text-2xl font-bold ">Emails</h1>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="custom-gradient ">
                  <Code className="w-4 h-4 mr-2" />
                  API
                </Button>
                {/* {emailStats && (
                <Badge
                  className={`${getPlanColor(
                    emailStats.subscription.plan
                  )} hover:${getPlanColor(emailStats.subscription.plan)}`}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {getPlanName(emailStats.subscription.plan)} Plan
                </Badge>
              )} */}
                <Button
                  onClick={refreshData}
                  disabled={refreshing}
                  variant="outline"
                  className="custom-gradient  "
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {emailStats && emailStats.limits.dailyRemaining <= 10 && (
            <Alert className="mb-6 border-yellow-500/50  bg-yellow-500/10 text-yellow-400">
              <AlertDescription className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 " />
                Warning: You have only {emailStats.limits.dailyRemaining} emails
                remaining today out of your {emailStats.limits.dailyLimit} daily
                limit.
                {emailStats.subscription.plan === "free" && (
                  <Link href="/dashboard/billing" className="ml-2 underline">
                    Upgrade your plan for higher limits.
                  </Link>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 custom-gradient1"
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40 custom-gradient1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="custom-gradient1">
                <SelectItem value="15">Last 15 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 custom-gradient1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="custom-gradient1">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 custom-gradient1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="custom-gradient1">
                <SelectItem value="all">All API Keys</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email Table */}
          <div className="rounded-lg border ">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b  text-muted-foreground text-sm font-bold custom-gradient1">
              <div className="col-span-4">To</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-4">Subject</div>
              <div className="col-span-2">Sent</div>
            </div>

            <div className="divide-y ">
              {filteredEmails.length > 0 ? (
                filteredEmails.map((email, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-center  gap-4 px-4 py-2 text-foreground/90 text-sm "
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
                        className="font-medium flex items-center gap-2 group underline hover:decoration-primary decoration-dotted underline-offset-2 "
                      >
                        {email.to}
                        {copyEmailId === String(index) ? (
                          <Check size={12} className=" text-green-500" />
                        ) : (
                          <Copy
                            size={12}
                            className=" group-hover:visible invisible "
                          />
                        )}
                      </button>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {getStatusBadge(email.status)}
                    </div>
                    <div className="col-span-4 truncate ">
                      <span className="">{email.subject}</span>
                    </div>
                    <div className="col-span-1 flex items-center min-w-28 ">
                      <span className=" text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(email.sentAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-950"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-gray-950 border-gray-700"
                        >
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
