"use client";

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
  CheckCircle,
  PauseCircle,
  AlertCircle,
  ExternalLink,
  Plus,
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { useZustandStore } from "@/zustand/store";
import Link from "next/link";

interface Domain {
  id: string;
  userId: string;
  domain: string;
  mailFromDomain?: string;
  verified: boolean;
  dkimStatus: string;
  createdAt: string;
  updatedAt: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch domains");
  }
  return data.domains;
};

export default function DomainPage() {
  const { userData } = useZustandStore();
  const {
    data: domains,
    error,
    mutate,
    isLoading,
  } = useSWR<Domain[], Error>("/api/domains", fetcher);
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const getStatusIcon = (dkimStatus: string) => {
    if (dkimStatus === "verified") {
      return (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-200 hover:bg-green-300 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-500 text-green-900 flex items-center justify-center">
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
      );
    } else if (dkimStatus === "pending") {
      return (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-200 hover:bg-blue-300 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-500 text-blue-900 flex items-center justify-center">
          <PauseCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
      );
    } else {
      return (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-200 hover:bg-red-300 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-500 text-red-900 flex items-center justify-center">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
      );
    }
  };

  const getStatusBadge = (dkimStatus: string) => {
    if (dkimStatus === "verified") {
      return <Badge variant="green">Verified</Badge>;
    } else if (dkimStatus === "pending") {
      return <Badge variant="blue">Pending</Badge>;
    } else {
      return <Badge variant="gray">Not Verified</Badge>;
    }
  };

  const filteredDomains = (domains || []).filter((domain) => {
    const matchesSearch =
      domain.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.mailFromDomain
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      false;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" &&
        domain.verified &&
        domain.dkimStatus === "verified") ||
      (statusFilter === "pending" && domain.dkimStatus === "pending") ||
      (statusFilter === "failed" &&
        !domain.verified &&
        domain.dkimStatus !== "configured");
    return matchesSearch && matchesStatus;
  });

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
                <h1 className="text-xl sm:text-2xl font-bold">Domains</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/dashboard/domains/add">
                  <Button size="sm">
                    <Plus className="w-4 h-4 sm:mr-2" />
                    Add Domain
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
          {(domains || []).length > 0 &&
            domains?.some(
              (d) => !d.verified && d.dkimStatus !== "verified"
            ) && (
              <Alert className="mb-4 sm:mb-6 border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
                <AlertDescription className="flex items-center gap-2 sm:gap-3 text-sm">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Some domains are not verified. Please check their DNS
                    records.
                  </span>
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
                className="pl-10 custom-gradient2"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 sm:w-40 custom-gradient2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="custom-gradient_dropdown">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="hidden lg:grid grid-cols-11 gap-4 px-4 py-2 border-b text-muted-foreground text-sm font-bold custom-gradient2 hover:bg-transparent">
              <div className="col-span-4">Domain</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3">MAIL FROM</div>
              <div className="col-span-2">Created</div>
            </div>

            <div className="lg:hidden divide-y">
              {filteredDomains.length > 0 ? (
                filteredDomains.map((domain, index) => (
                  <div
                    key={index}
                    className="p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getStatusIcon(domain.dkimStatus)}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/dashboard/domains/${domain.id}`}
                            className="font-medium flex items-center gap-2 group hover:underline underline-offset-2 truncate"
                          >
                            <span className="truncate">{domain.domain}</span>
                            <ExternalLink
                              className="group-hover:visible invisible"
                              size={14}
                            />
                          </Link>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNowStrict(
                              new Date(domain.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(domain.dkimStatus)}
                      </div>
                    </div>
                    <div className="">
                      <p className="text-sm text-muted-foreground/90 font-medium truncate">
                        <span className="font-bold">MAIL FROM: </span>
                        {domain.mailFromDomain || "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              ) : isLoading ? (
                <div>
                  <div className="h-24 dark:bg-muted/40 bg-gray-300 animate-pulse"></div>
                  <div className="h-24 dark:bg-muted/20 bg-gray-200 animate-pulse"></div>
                  <div className="h-24 dark:bg-muted/40 bg-gray-300 animate-pulse"></div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-2">
                    {searchQuery || statusFilter !== "all"
                      ? "No domains match your filters"
                      : "No domains added yet"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Add a domain to see it listed here"}
                  </p>
                </div>
              )}
            </div>

            <div className="hidden lg:block divide-y">
              {filteredDomains.length > 0 ? (
                filteredDomains.map((domain, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-11 items-center gap-4 px-4 py-2 text-foreground/90 text-sm hover:bg-gray-50 dark:hover:bg-gray-900/20"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      {getStatusIcon(domain.dkimStatus)}
                      <Link
                        href={`/dashboard/domains/${domain.id}`}
                        className="font-medium flex items-center gap-2 group hover:underline underline-offset-2 truncate"
                      >
                        <span className="truncate">{domain.domain}</span>
                        <ExternalLink
                          className="group-hover:visible invisible"
                          size={14}
                        />
                      </Link>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {getStatusBadge(domain.dkimStatus)}
                    </div>
                    <div className="col-span-3 truncate">
                      <span>{domain.mailFromDomain || "N/A"}</span>
                    </div>
                    <div className="col-span-2 flex items-center min-w-28">
                      <span className="text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(domain.createdAt), {
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
                  <p className="text-gray-400 text-lg mb-2">
                    {searchQuery || statusFilter !== "all"
                      ? "No domains match your filters"
                      : "No domains added yet"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Add a domain to see it listed here"}
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
