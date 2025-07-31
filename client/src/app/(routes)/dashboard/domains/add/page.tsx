"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Copy,
  RefreshCw,
} from "lucide-react";
import { copyToClipboard } from "@/app/helper/copy";
import { Badge } from "@/components/ui/badge";

interface DNSRecord {
  name: string;
  type: string;
  value: string;
  priority?: number;
}

interface DomainStatus {
  verified: boolean;
  dkimStatus: string;
}

export default function AddDomainPage() {
  const [domain, setDomain] = useState("");
  const [mailFrom, setMailFrom] = useState("");
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [status, setStatus] = useState<DomainStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copyRecordId, setCopyRecordId] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleAddDomain = async () => {
    setError("");
    setSuccess("");
    setDnsRecords([]);
    setStatus(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/domains/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, mailFromDomain: mailFrom }),
      });

      const data = await res.json();
      if (data.success) {
        setDnsRecords(data.dnsRecords);
        setSuccess("Domain added successfully! Add the DNS records below.");
      } else {
        setError(data.error || "Failed to add domain");
      }
    } catch {
      setError("Failed to add domain");
      console.error("Failed to add domain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setError("");
    setSuccess("");
    setRefreshing(true);

    try {
      const res = await fetch("/api/domains/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      setStatus(data);
      setSuccess("Status updated!");
    } catch {
      setError("Failed to check domain status");
      console.error("Failed to check domain status");
    } finally {
      setRefreshing(false);
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  useEffect(() => {
    if (success || error) toast(success || error);
  }, [success, error]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 flex justify-center ">
      <div className="w-full max-w-7xl">
        <div className="flex h-12 sm:h-16 items-center px-2 sm:px-6">
          <div className="flex items-center justify-between w-full ml-2 sm:ml-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Add Domain</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={handleCheckStatus}
                disabled={refreshing || !domain}
                variant="outline"
                className="custom-gradient bg-transparent border-gray-700 hover:bg-gray-800"
                size="sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    refreshing ? "animate-spin" : ""
                  } sm:mr-2`}
                />
                <span className="hidden sm:inline">Check Status</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="p-2 sm:p-6">
          {status && (
            <div>
              <div className=" p-4 rounded-lg">
                <h2 className="text-lg font-medium mb-2">Domain Status</h2>
                <Badge variant={status.verified ? "green" : "red"}>
                  {status.verified ? "Verified" : "Not verified"}
                </Badge>
              </div>
            </div>
          )}
          {error && (
            <Alert className="mb-4 sm:mb-6 border-red-500/50 bg-red-500/10 text-red-400">
              <AlertDescription className="flex items-center gap-3 text-sm">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 sm:mb-6 border-green-500/50 bg-green-500/10 text-green-400">
              <AlertDescription className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>{success}</span>
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6 max-w-2xl">
            <div className="custom-gradient4 p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-2">Domain</h2>
              <p className="text-sm text-gray-400 mb-2">Domain name</p>
              <div className="flex items-center gap-2 mb-4">
                <Input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="mailory.site"
                  className="flex-1 "
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-400">
                  MAIL FROM Domain (optional)
                </label>
                <Input
                  type="text"
                  value={mailFrom}
                  onChange={(e) => setMailFrom(e.target.value)}
                  placeholder="email.mailory.site"
                  disabled={isLoading}
                />
              </div>
              {dnsRecords.length == 0 && (
                <Button
                  size="sm"
                  className=" mt-5"
                  onClick={handleAddDomain}
                  disabled={isLoading || !domain}
                >
                  {isLoading ? "Adding..." : "Add Domain"}
                </Button>
              )}
            </div>
          </div>
          {dnsRecords?.length !== 0 && (
            <div className="custom-gradient4 rounded-lg overflow-x-auto">
              <div className="hidden sm:grid grid-cols-8 gap-4 px-4 py-3 custom-gradient2 text-xs sm:text-sm font-medium text-gray-300 border-b border-gray-700">
                <span className="col-span-2"> Name</span>
                <span className="col-span-1">Type</span>
                <span className="col-span-4">Value</span>
                <span className="col-span-1">Priority</span>
              </div>

              {dnsRecords.map((record, index) => (
                <div
                  key={index}
                  className="sm:grid sm:grid-cols-8 sm:gap-4 px-4 py-3 text-xs sm:text-sm border-b last:border-b-0 dark:sm:hover:bg-gray-800/10 dark:text-muted-foreground text-gray-600 flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <div className="sm:col-span-2 flex items-center gap-2 sm:gap-0">
                    <span className="sm:hidden font-medium ">Name:</span>
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
                    <span className="sm:hidden font-medium ">Type:</span>
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
          )}
        </div>
      </div>
    </div>
  );
}
