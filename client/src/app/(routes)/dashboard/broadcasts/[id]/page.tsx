"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailDetail {
  _id: string;
  to: string;
  status: "sent" | "failed" | "pending" | "processing";
  attempts: number;
  messageId?: string;
  processedAt?: string;
  error?: string;
}

interface BroadcastStats {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
}

interface BroadcastData {
  batchId: string;
  stats: BroadcastStats;
  emails: EmailDetail[];
  subject?: string;
  from?: string;
  htmlContent?: string;
  previewText?: string;
  createdAt?: string;
  sentAt?: string;
}

export default function BroadcastDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const broadcastId = params.id as string;

  const [broadcast, setBroadcast] = useState<BroadcastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBroadcastDetails(broadcastId);
  }, [broadcastId]);

  const loadBroadcastDetails = async (batchId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/broadcasts/status?batchId=${batchId}`);
      const data = await response.json();
      if (response.ok) {
        setBroadcast(data);
        setError("");
        setCurrentPage(1);
      } else {
        setError(data.message || "Failed to load broadcast details");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch broadcast details");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!broadcast) return;
    setRefreshing(true);
    try {
      const res = await fetch(
        `/api/broadcasts/status?batchId=${broadcast.batchId}`
      );
      const data = await res.json();
      if (res.ok) {
        setBroadcast(data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const getTotalEmails = () => {
    const stats = broadcast?.stats;
    return stats
      ? stats.sent + stats.failed + stats.pending + stats.processing
      : 0;
  };

  const getFilteredEmails = () => {
    if (!broadcast?.emails) return [];
    let filtered = broadcast.emails;

    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((e) =>
        e.to.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getPaginatedEmails = () => {
    const emails = getFilteredEmails();
    const start = (currentPage - 1) * itemsPerPage;
    return emails.slice(start, start + itemsPerPage);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredEmails().length / itemsPerPage);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "sent":
        return "default";
      case "failed":
        return "destructive";
      case "processing":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const paginatedEmails = getPaginatedEmails();
  const totalPages = getTotalPages();
  const deliveryRate =
    getTotalEmails() > 0
      ? ((broadcast!.stats.sent / getTotalEmails()) * 100).toFixed(1)
      : "0";

  const toPages = currentPage * paginatedEmails.length;
  const fromPages = toPages - paginatedEmails.length + 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !broadcast) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <AlertTriangle className="w-6 h-6 text-destructive mb-2" />
        <div>
          <p className="text-red-500">{error || "Broadcast not found"}</p>
          <Button
            onClick={() => router.push("/dashboard/broadcasts")}
            className="mt-4"
          >
            Back to Broadcasts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">
            {broadcast.subject || `Broadcast ${broadcast.batchId.slice(0, 8)}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {broadcast.stats.sent} sent / {getTotalEmails()} total
          </span>
          <Button size="sm" onClick={refreshData} disabled={refreshing}>
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Overview</CardTitle>
                <CardDescription>{broadcast.previewText}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {["sent", "failed", "pending", "processing"].map((status) => (
                    <div key={status} className="border rounded p-2">
                      <div
                        className={`text-xl font-bold ${
                          status === "sent"
                            ? "text-green-600"
                            : status === "failed"
                            ? "text-red-600"
                            : status === "pending"
                            ? "text-yellow-600"
                            : "text-blue-600"
                        }`}
                      >
                        {broadcast.stats[status as keyof BroadcastStats]}
                      </div>
                      <div className="text-sm capitalize text-muted-foreground">
                        {status}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-muted rounded text-sm flex justify-between">
                  <span>Delivery Rate</span>
                  <span className="font-bold">{deliveryRate}%</span>
                </div>
              </CardContent>
            </Card>

            {/* HTML Content Preview */}
            {broadcast.htmlContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Email Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none bg-muted/30 p-4 rounded">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: broadcast.htmlContent,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span>{broadcast.from}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subject:</span>
                  <span className="truncate max-w-[160px]">
                    {broadcast.subject}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipients:</span>
                  <span>{getTotalEmails()}</span>
                </div>
                {broadcast.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>
                      {formatDistanceToNowStrict(
                        new Date(broadcast.createdAt),
                        {
                          addSuffix: true,
                        }
                      )}
                    </span>
                  </div>
                )}
                {broadcast.sentAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sent:</span>
                    <span>
                      {formatDistanceToNowStrict(new Date(broadcast.sentAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Email Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Email Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row  items-center justify-between gap-4 mb-4">
              <Input
                placeholder="Search by recipient email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-1/3"
              />
              <Tabs
                defaultValue="all"
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              >
                <TabsList>
                  {["all", "sent", "failed", "pending", "processing"].map(
                    (status) => (
                      <TabsTrigger key={status} value={status}>
                        {`${status.charAt(0).toUpperCase()}${status.slice(1)}`}
                      </TabsTrigger>
                    )
                  )}
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              {paginatedEmails.length ? (
                paginatedEmails.map((email) => (
                  <div
                    key={email._id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex-1 truncate">
                      <div className="font-medium">{email.to}</div>
                      {email.error && (
                        <div className="text-xs text-red-600">
                          {email.error}
                        </div>
                      )}
                      {email.processedAt && (
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNowStrict(
                            new Date(email.processedAt),
                            { addSuffix: true }
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge
                        variant={getStatusVariant(email.status)}
                        className="text-xs capitalize"
                      >
                        {email.status}
                      </Badge>
                      {email.attempts > 1 && (
                        <div className="text-muted-foreground text-xs">
                          {email.attempts} tries
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No matching emails
                </p>
              )}
            </div>

            {/* Pagination */}
            {getFilteredEmails().length > 0 && (
              <div className="flex justify-end gap-7 items-center pt-4 border-t text-sm">
                <span className="text-muted-foreground">
                  {fromPages}-{toPages} of {getFilteredEmails().length} emails
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
