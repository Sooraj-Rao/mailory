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
import Link from "next/link";

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
  const [recordsAdded, setRecordsAdded] = useState(false);

  const handleAddDomain = async () => {
    setError("");
    setSuccess("");
    setDnsRecords([]);
    setStatus(null);
    setRecordsAdded(false);
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
                disabled={refreshing || !domain || !recordsAdded}
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

          <div className="mb-6">
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
              <Button
                size="sm"
                variant="grad"
                className=" mt-5"
                onClick={handleAddDomain}
                disabled={isLoading || !domain}
              >
                {isLoading ? "Adding..." : "Add Domain"}
              </Button>
            </div>
          </div>

          {dnsRecords.length > 0 && (
            <div className="mb-6">
              <div className="p-4 rounded-lg">
                <h2 className="text-lg font-medium mb-2 flex items-center justify-between">
                  DNS Records
                </h2>
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs">
                      Required
                    </span>
                    <span>DKIM and SPF</span>
                    <span className="text-gray-500">
                      Enable email signing and specify authorized senders.
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-sm p-2 rounded">
                    <div className="col-span-1 font-medium">Type</div>
                    <div className="col-span-1 font-medium">Host / Name</div>
                    <div className="col-span-2 font-medium">Value</div>
                    <div className="col-span-1 font-medium">Priority</div>
                    <div className="col-span-1 font-medium">Status</div>
                  </div>
                  {dnsRecords.map((rec, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-5 gap-2 text-sm p-2 hover:bg-gray-700/50"
                    >
                      <div className="col-span-1">{rec.type}</div>
                      <div className="col-span-1 truncate">
                        <button
                          disabled={copyRecordId !== ""}
                          onClick={() => {
                            copyToClipboard(rec.name, "DNS Record Name", false);
                            setCopyRecordId(String(index));
                            setTimeout(() => setCopyRecordId(""), 1000);
                          }}
                          className="font-medium flex items-center gap-2 group underline hover:decoration-green-400 decoration-dotted underline-offset-2 truncate text-white"
                        >
                          <span className="truncate">{rec.name}</span>
                          {copyRecordId === String(index) ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <Copy
                              size={12}
                              className="group-hover:visible invisible"
                            />
                          )}
                        </button>
                      </div>
                      <div className="col-span-2 truncate">
                        <button
                          disabled={copyRecordId !== ""}
                          onClick={() => {
                            copyToClipboard(
                              rec.value,
                              "DNS Record Value",
                              false
                            );
                            setCopyRecordId(String(index));
                            setTimeout(() => setCopyRecordId(""), 1000);
                          }}
                          className="font-medium flex items-center gap-2 group underline hover:decoration-green-400 decoration-dotted underline-offset-2 truncate text-white"
                        >
                          <span className="truncate">{rec.value}</span>
                          {copyRecordId === String(index) ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <Copy
                              size={12}
                              className="group-hover:visible invisible"
                            />
                          )}
                        </button>
                      </div>
                      <div className="col-span-1">{rec.priority ?? "Auto"}</div>
                      <div className="col-span-1 text-red-500">Failed</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-gray-400 mb-2 mt-4">
                  <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-xs">
                    Recommended
                  </span>
                  <span>DMARC</span>
                  <span className="text-gray-500">
                    Set authentication policies and receive reports.
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-sm p-2 rounded">
                  <div className="col-span-1">TXT</div>
                  <div className="col-span-1 truncate">_dmarc</div>
                  <div className="col-span-2 truncate">v=DMARC1; p=none;</div>
                  <div className="col-span-1">Auto</div>
                  <div className="col-span-1 text-red-500">Failed</div>
                </div>
                <Button
                  onClick={() => setRecordsAdded(true)}
                  disabled={!dnsRecords.length || recordsAdded}
                  className="mt-4 custom-gradient bg-green-600 hover:bg-green-700"
                >
                  I've added the records
                </Button>
              </div>
            </div>
          )}

          {status && (
            <div className="mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-lg font-medium mb-2">Domain Status</h2>
                <div className="text-sm text-gray-400">
                  <p>Created: 1 minute ago</p>
                  <p>Status: {status.verified ? "Verified" : "Failed"}</p>
                  <p>Region: Tokyo (ap-northeast-1)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
