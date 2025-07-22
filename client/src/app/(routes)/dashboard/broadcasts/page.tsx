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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw,
  Search,
  MoreHorizontal,
  Mail,
  Code,
  CheckCircle,
  PauseCircle,
  AlertCircle,
  Clock,
  Copy,
  Plus,
  Eye,
  Users,
  ExternalLink,
} from "lucide-react";
import { SidebarTrigger } from "@/components/home/sidebar";
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

  useEffect(() => {
    fetchBroadcastStats();
  }, []);

  const fetchBroadcastStats = async () => {
    try {
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
          <div className="w-8 h-8 rounded-full bg-green-200 hover:bg-green-300 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-500 text-green-900 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
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
          <div className="w-8 h-8 rounded-full bg-red-200 hover:bg-red-300 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-500 text-red-900 flex items-center justify-center">
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

  const getStatusBadge = (broadcast: T_Broadcasts) => {
    const completed = broadcast.sent + broadcast.failed;
    const progress = Math.round((completed / broadcast.totalEmails) * 100);

    if (progress === 100) {
      return (
        <Badge className="bg-green-200 hover:bg-green-300 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-500 text-green-900">
          Completed
        </Badge>
      );
    } else if (broadcast.processing > 0) {
      return (
        <Badge className="bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60 dark:text-yellow-500 text-yellow-900">
          Processing
        </Badge>
      );
    } else if (broadcast.pending > 0) {
      return (
        <Badge className="bg-blue-200 hover:bg-blue-300 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-500 text-blue-900">
          Pending
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-900/40 dark:hover:bg-gray-900/60 dark:text-gray-500 text-gray-900">
          Draft
        </Badge>
      );
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

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center app-gradient">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }
  console.log(filteredBroadcasts);

  return (
    <div className="min-h-screen m-10 flex justify-center">
      <div className="w-[64rem]">
        <div>
          <div className="flex h-16 items-center px-6">
            <SidebarTrigger />
            <div className="flex items-center justify-between w-full">
              <div>
                <h1 className="text-2xl font-bold">Broadcasts</h1>
              </div>
              <div className="flex items-center gap-4">
                <Link href={"/dashboard/broadcasts/create"}>
                  <Button
                    variant="outline"
                    className="custom-gradient bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Broadcast
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="custom-gradient bg-transparent"
                >
                  <Code className="w-4 h-4 mr-2" />
                  API
                </Button>
                <Button
                  onClick={refreshData}
                  disabled={refreshing}
                  variant="outline"
                  className="custom-gradient bg-transparent"
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
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search campaigns..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Broadcasts Table */}
          <div className="rounded-lg border">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b text-muted-foreground text-sm font-bold custom-gradient1">
              <div className="col-span-4">Campaign</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Recipients</div>
              <div className="col-span-2">Progress</div>
              <div className="col-span-2">Created</div>
            </div>
            <div className="divide-y">
              {filteredBroadcasts.length > 0 ? (
                filteredBroadcasts.map((broadcast: T_Broadcasts) => (
                  <div
                    key={broadcast.batchId}
                    className="grid grid-cols-12 items-center gap-4 px-4 py-2 text-foreground/90 text-sm"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      {getStatusIcon(broadcast.status)}
                      <div className="flex flex-col group">
                        <Link
                          href={`/dashboard/broadcasts/${broadcast.batchId}`}
                          className=" hover:underline group flex items-center gap-x-2"
                        >
                          <p className="font-medium flex items-center gap-2 group truncate  text-left">
                            {broadcast?.subject || "No subject"}
                          </p>
                          <ExternalLink
                            className="group-hover:block hidden "
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
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Campaign ID
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
