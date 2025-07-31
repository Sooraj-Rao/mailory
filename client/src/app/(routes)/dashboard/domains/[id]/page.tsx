"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Copy,
  RefreshCw,
  Globe,
  Code,
  MoreHorizontal,
  Trash2,
  Loader2,
} from "lucide-react";
import { copyToClipboard } from "@/app/helper/copy";
import { formatDistanceToNowStrict } from "date-fns";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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

interface DNSRecord {
  name: string;
  type: string;
  value: string;
  priority?: number;
  status?: "verified" | "failed" | "pending";
}

interface Domain {
  id: string;
  userId: string;
  domain: string;
  mailFromDomain?: string;
  dnsRecords: DNSRecord[];
  verified: boolean;
  dkimStatus: string;
  createdAt: string;
  updatedAt: string;
  region?: string;
}

export default function DomainDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copyRecordId, setCopyRecordId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDomain();
  }, [params.id]);

  const fetchDomain = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/domains?id=${params.id}`);
      const data = await res.json();
      if (data.success) {
        setDomain(data.domain);
      } else {
        setError(data.error || "Failed to fetch domain details");
      }
    } catch {
      setError("Failed to fetch domain details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!domain) return;
    setRefreshing(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/domains/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.domain }),
      });
      const data = await res.json();
      setDomain((prev) => (prev ? { ...prev, ...data } : null));
      setSuccess("Data Refreshed!");
    } catch {
      setError("Failed to check domain status");
    } finally {
      setRefreshing(false);
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  useEffect(() => {
    if (success || error) toast(success || error);
  }, [success, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen gap-x-2 app-gradient flex items-center justify-center p-4">
        <p>
          <Loader2 className=" animate-spin" />
        </p>
        <div className="text-foreground">Feteching Domain info..</div>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2 text-sm sm:text-base">
            Domain not found
          </p>
          <Button
            variant="link"
            onClick={() => router.push("/domains")}
            className="text-sm sm:text-base"
          >
            Back to Domains
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="green">Verified</Badge>;
      case "failed":
        return <Badge variant="red">Failed</Badge>;
      case "pending":
        return <Badge variant="blue">Pending</Badge>;
      default:
        return <Badge variant="red">Failed</Badge>;
    }
  };

  const deleteDomain = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/domains?id=${params.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/domains");
      } else {
        setError(data.error || "Failed to fetch domain details");
      }
    } catch {
      setError("Failed to fetch domain details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 custom-gradient5 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs sm:text-sm text-gray-400">Domain</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold truncate">
                {domain.domain}
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <Button
              onClick={handleCheckStatus}
              disabled={refreshing}
              variant="outline"
              className="custom-gradient bg-transparent "
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing ? "animate-spin" : ""
                } sm:mr-2`}
              />
              <span className=" text-xs">Refresh</span>
            </Button>
            <Link target="_blank"  className=" hidden" href={"/docs/?to=domains"}>
              <Button
                variant="outline"
                className="custom-gradient bg-transparent   hidden sm:flex"
              >
                <Code className="w-4 h-4 mr-2" />
                Docs
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Domain
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Domain</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this domain? This action
                        cannot be undone and will immediately revoke access for
                        any applications using this domain.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteDomain}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                      >
                        Delete Domain
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">
              CREATED
            </div>
            <div className="text-sm">
              {formatDistanceToNowStrict(new Date(domain.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">
              STATUS
            </div>
            {getStatusBadge(domain.dkimStatus)}
          </div>
        </div>

        {error && (
          <Alert className="bg-red-500/10 border border-red-500/30 text-red-400 mb-6 p-3 sm:p-4">
            <AlertDescription className="flex items-center gap-2 text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-500/10 border border-green-500/30 text-green-400 mb-6 p-3 sm:p-4">
            <AlertDescription className="flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle className="h-4 w-4" />
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="custom-gradient4 border-none rounded-xl ">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-base sm:text-lg font-medium">DKIM and SPF</h3>
              <Badge variant="grad">Required</Badge>
            </div>

            <div className="custom-gradient4 rounded-lg overflow-x-auto">
              <div className="hidden sm:grid grid-cols-8 gap-4 px-4 py-3 custom-gradient2 text-xs sm:text-sm font-medium text-gray-300 border-b border-gray-700">
                <span className="col-span-2"> Name</span>
                <span className="col-span-1">Type</span>
                <span className="col-span-4">Value</span>
                <span className="col-span-1">Priority</span>
              </div>

              {domain.dnsRecords.map((record, index) => (
                <div
                  key={index}
                  className="sm:grid sm:grid-cols-8 sm:gap-4 px-4 py-3 text-xs sm:text-sm border-b last:border-b-0 dark:sm:hover:bg-gray-800/10 dark:text-muted-foreground text-gray-600 flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                    <div className="sm:col-span-2 flex items-center gap-2 sm:gap-0">
                    <span className="sm:hidden font-medium ">
                      Name:
                    </span>
                    <button
                      className="flex items-center group gap-1 "
                      onClick={() => {
                        copyToClipboard(record.name, "Name", false);
                        setCopyRecordId(`name-${index}`);
                        setTimeout(() => setCopyRecordId(""), 1000);
                      }}
                    >
                      <span className="truncate max-w-[150px] sm:max-w-[120px] font-mono hover:text-primary transition-colors">
                        {record.name}
                      </span>
                      <span className="group-hover:visible invisible">
                        {copyRecordId === `name-${index}` ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-500" />
                        )}
                      </span>
                    </button>
                  </div>
                  <div className="sm:col-span-1 flex items-center gap-2 sm:gap-0">
                    <span className="sm:hidden font-medium ">
                      Type:
                    </span>
                    <span className="dark:text-yellow-400 text-yellow-700  font-mono">
                      {record.type}
                    </span>
                  </div>
                
                  <div className="sm:col-span-4 flex items-center gap-2 sm:gap-0">
                    <span className="sm:hidden font-medium ">Value:</span>
                    <button
                      className="flex items-center group gap-1  "
                      onClick={() => {
                        copyToClipboard(record.value, "Value", false);
                        setCopyRecordId(`value-${index}`);
                        setTimeout(() => setCopyRecordId(""), 1000);
                      }}
                    >
                      <span className="truncate max-w-[200px] sm:max-w-[300px] hover:text-blue-400 transition-colors font-mono ">
                        {record.value}
                      </span>
                      <span className="group-hover:visible invisible">
                        {copyRecordId === `value-${index}` ? (
                          <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        )}
                      </span>
                    </button>
                  </div>
                  {record?.priority && (
                    <div className="sm:col-span-1 flex items-center gap-2 sm:gap-0">
                      <span className="sm:hidden font-medium text-gray-400">
                        Priority:
                      </span>
                      <span className="">{record.priority || ""}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
