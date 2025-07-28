"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Search,
  Mail,
  Code,
  CheckCircle,
  PauseCircle,
  AlertCircle,
  Clock,
  Plus,
  Users,
  ExternalLink,
} from "lucide-react";
import { useZustandStore } from "@/zustand/store";
import { formatDistanceToNowStrict } from "date-fns";

type T_Broadcasts = {
  batchId: string;
  subject: string;
  totalEmails: number;
  sent: number;
  failed: number;
  pending: number;
  processing: number;
  status: string;
  createdAt: string;
};

export default function BroadcastsPage() {
  const { userData } = useZustandStore();
  const [broadcastStats, setBroadcastStats] = useState<T_Broadcasts[] | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("15");
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    fetchBroadcastStats();
  }, []);

  const fetchBroadcastStats = async () => {
    try {
      setisLoading(true);
      const response = await fetch("/api/broadcasts/status");
      const data = await response.json();
      if (response.ok) {
        setBroadcastStats(data.batches);
      } else {
        setError(data.error || "Failed to fetch broadcast stats");
      }
    } catch {
      setError("Failed to fetch broadcast stats");
      console.error("Failed to fetch broadcast stats");
    } finally {
      setisLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchBroadcastStats();
    setRefreshing(false);
    setSuccess("Data refreshed!");
    setTimeout(() => setSuccess(""), 2000);
  };

  useEffect(() => {
    if (success || error) toast(success || error);
  }, [success, error]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
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

  const getStatusBadge = (broadcast: T_Broadcasts) => {
    const completed = broadcast.sent + broadcast.failed;
    const progress = Math.round((completed / broadcast.totalEmails) * 100);

    if (progress === 100 && broadcast.failed == 0) {
      return <Badge variant="green">Completed</Badge>;
    } else if (broadcast.processing > 0) {
      return <Badge variant="yellow">Processing</Badge>;
    } else if (broadcast.pending > 0) {
      return <Badge variant="blue">Pending</Badge>;
    } else if (broadcast.failed > 0) {
      return <Badge variant="red">Failed</Badge>;
    } else {
      return <Badge variant="gray"> Draft</Badge>;
    }
  };

  const getProgressText = (broadcast: T_Broadcasts) => {
    const completed = broadcast.sent + broadcast.failed;
    const progress = Math.round((completed / broadcast.totalEmails) * 100);
    return `${completed}/${broadcast.totalEmails} (${progress}%)`;
  };

  const filteredBroadcasts =
    broadcastStats?.filter((broadcast: T_Broadcasts) => {
      const matchesSearch =
        broadcast?.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        broadcast?.batchId?.toLowerCase().includes(searchQuery.toLowerCase());

      const completed = broadcast.sent + broadcast.failed;
      const progress = Math.round((completed / broadcast?.totalEmails) * 100);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && progress === 100) ||
        (statusFilter === "processing" && broadcast?.processing > 0) ||
        (statusFilter === "pending" &&
          broadcast?.pending > 0 &&
          broadcast?.processing === 0) ||
        (statusFilter === "failed" && broadcast?.failed > 0);

      return matchesSearch && matchesStatus;
    }) || [];

  if (!userData && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center app-gradient">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 flex justify-center">
      <div className="w-full max-w-7xl">
        <div>
          <div className="flex h-12 sm:h-16 items-center px-2 sm:px-6">
            <div className="flex items-center justify-between w-full ml-2 sm:ml-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Broadcasts</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href={"/dashboard/broadcasts/create"}>
                  <Button variant="grad" size="sm">
                    <Plus className="w-4 h-4 sm:mr-1" />
                    <p className="">
                      Create
                      <span className="hidden ml-1 sm:inline">Broadcast</span>
                    </p>
                  </Button>
                </Link>
                <Link target="_blank" href={"/docs/?to=broadcasts"}>
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
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 custom-gradient2"
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="hidden lg:grid grid-cols-11 gap-4 px-4 py-2 border-b text-muted-foreground text-sm font-bold custom-gradient2 hover:bg-transparent">
              <div className="col-span-4">Campaign</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Recipients</div>
              <div className="col-span-2">Progress</div>
              <div className="col-span-1">Created</div>
            </div>

            <div className="lg:hidden divide-y">
              {filteredBroadcasts.length > 0 ? (
                filteredBroadcasts.map((broadcast: T_Broadcasts) => (
                  <div key={broadcast.batchId} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1s min-w-0">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/dashboard/broadcasts/${broadcast.batchId}`}
                            className="underline underline-offset-2 group flex items-center gap-x-2"
                          >
                            <p className="font-medium flex items-center gap-2 group truncate text-left text-sm">
                              {broadcast?.subject || "No subject"}
                            </p>
                            <ExternalLink
                              className="group-hover:block hidden"
                              size={12}
                            />
                          </Link>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNowStrict(
                              new Date(broadcast.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(broadcast)}
                      </div>
                    </div>
                    <div className=" space-y-2">
                      <div className="flex items-center text-muted-foreground/80 gap-2 text-sm">
                        <Users className="w-4 h-4 " />
                        <span>{broadcast.totalEmails} recipients</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Progress: {getProgressText(broadcast)}
                      </div>
                    </div>
                  </div>
                ))
              ) : isLoading ? (
                <div className=" space-y-3">
                  <div className=" h-24 bg-muted/40 animate-pulse"></div>
                  <div className=" h-24  bg-muted/20 animate-pulse"></div>
                  <div className=" h-24 bg-muted/40  animate-pulse"></div>
                  <div className=" h-24 bg-muted/20 animate-pulse"></div>
                  <div className=" h-24 bg-muted/40  animate-pulse"></div>
                  <div className=" h-24 bg-muted/20 animate-pulse"></div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-2">
                    {searchQuery || statusFilter !== "all"
                      ? "No campaigns match your filters"
                      : "No campaigns created yet"}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Create your first broadcast campaign to get started"}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Link href={"/dashboard/broadcasts/create"}>
                      <Button className="custom-gradient">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Campaign
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="hidden lg:block divide-y">
              {filteredBroadcasts.length > 0 ? (
                filteredBroadcasts.map((broadcast: T_Broadcasts) => (
                  <div
                    key={broadcast.batchId}
                    className="grid grid-cols-11 items-center gap-4 px-4 py-2 text-foreground/90 text-sm"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      {getStatusIcon(broadcast.status)}
                      <div className="flex flex-col group">
                        <Link
                          href={`/dashboard/broadcasts/${broadcast.batchId}`}
                          className="hover:underline group underline-offset-2 flex items-center gap-x-2"
                        >
                          <p className="font-medium flex items-center gap-2 group truncate text-left">
                            {broadcast?.subject || "No subject"}
                          </p>
                          <ExternalLink
                            className="group-hover:block hidden"
                            size={14}
                          />
                        </Link>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {getStatusBadge(broadcast)}
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{broadcast.totalEmails}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-muted-foreground">
                        {getProgressText(broadcast)}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center min-w-28">
                      <span className="text-muted-foreground">
                        {formatDistanceToNowStrict(
                          new Date(broadcast.createdAt),
                          {
                            addSuffix: true,
                          }
                        )}
                      </span>
                    </div>
                  </div>
                ))
              ) : isLoading ? (
                <div className=" space-y-1">
                  <div className=" h-12 bg-muted/40 animate-pulse"></div>
                  <div className=" h-12 bg-muted/20 animate-pulse"></div>
                  <div className=" h-12 bg-muted/40  animate-pulse"></div>
                  <div className=" h-12 bg-muted/20 animate-pulse"></div>
                  <div className=" h-12 bg-muted/40  animate-pulse"></div>
                  <div className=" h-12 bg-muted/20 animate-pulse"></div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-2">
                    {searchQuery || statusFilter !== "all"
                      ? "No campaigns match your filters"
                      : "No campaigns created yet"}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Create your first broadcast campaign to get started"}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Link href={"/dashboard/broadcasts/create"}>
                      <Button className="custom-gradient">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Campaign
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
