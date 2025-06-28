/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Send,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Mail,
  BarChart3,
  Users,
  Activity,
  Plus,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { SidebarTrigger } from "@/components/home/sidebar";
import WorkerStatus from "@/components/worker-status";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";

interface BatchStatus {
  batchId: string;
  subject: string;
  createdAt: string;
  totalEmails: number;
  sent: number;
  failed: number;
  pending: number;
  processing: number;
}

interface WorkerStats {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
}

export default function BatchEmailPage() {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [from, setFrom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [batches, setBatches] = useState<BatchStatus[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [workerStats, setWorkerStats] = useState<WorkerStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!showBatchDialog) {
      setSelectedBatch(null);
    }
  }, [showBatchDialog]);

  const fetchData = async () => {
    await Promise.all([fetchBatches(), fetchWorkerStats()]);
  };

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/batch-email/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBatches(data.batches || []);
      } else {
        console.error("Failed to fetch batches:", data);
      }
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  const fetchWorkerStats = async () => {
    try {
      const response = await fetch("/api/worker/auto-process");
      const data = await response.json();
      if (response.ok) {
        setWorkerStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch worker stats:", err);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    setSuccess("Data refreshed!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const fetchBatchDetails = async (batchId: string) => {
    try {
      setShowBatchDialog(true);
      const response = await fetch(
        `/api/batch-email/status?batchId=${batchId}`
      );
      const data = await response.json();
      if (response.ok) {
        setSelectedBatch(data);
      }
    } catch {
      console.error("Failed to fetch batch details");
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const extractEmailsFromData = (data: any[]): string[] => {
    const emails: string[] = [];

    data.forEach((row) => {
      if (typeof row === "string") {
        if (validateEmail(row)) {
          emails.push(row.trim());
        }
      } else if (typeof row === "object" && row !== null) {
        Object.values(row).forEach((value) => {
          if (typeof value === "string" && validateEmail(value)) {
            emails.push(value.trim());
          }
        });
      }
    });

    return Array.from(new Set(emails));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError("");
    setUploadedFileName(file.name);

    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      let extractedEmails: string[] = [];

      if (fileExtension === "csv") {
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
        });

        extractedEmails = extractEmailsFromData(result.data);
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        extractedEmails = extractEmailsFromData(jsonData.flat());
      } else {
        throw new Error(
          "Unsupported file format. Please use CSV or Excel files."
        );
      }

      if (extractedEmails.length === 0) {
        setError("No valid email addresses found in the file.");
        return;
      }

      if (extractedEmails.length > 100) {
        setError(
          `Found ${extractedEmails.length} emails, but maximum 100 recipients allowed per batch. Using first 100.`
        );
        extractedEmails = extractedEmails.slice(0, 100);
      }

      const currentRecipients = recipients.trim();
      const newRecipients = currentRecipients
        ? currentRecipients + "\n" + extractedEmails.join("\n")
        : extractedEmails.join("\n");

      setRecipients(newRecipients);
      setSuccess(
        `Successfully extracted ${extractedEmails.length} email addresses from ${file.name}`
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearRecipients = () => {
    setRecipients("");
    setUploadedFileName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const recipientList = recipients
        .split("\n")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (recipientList.length === 0) {
        setError("Please enter at least one recipient email");
        return;
      }

      if (recipientList.length > 100) {
        setError("Maximum 100 recipients allowed per batch");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/batch-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipients: recipientList,
          subject,
          html,
          text,
          from,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          `Batch created successfully! Processing ${data.totalEmails} emails automatically...`
        );

        setRecipients("");
        setSubject("");
        setHtml("");
        setText("");
        setFrom("");
        setUploadedFileName("");

        fetchData();
      } else {
        setError(data.error || data.message);
      }
    } catch {
      setError("Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (batch: BatchStatus) => {
    const completed = batch.sent + batch.failed;
    return Math.round((completed / batch.totalEmails) * 100);
  };

  return (
    <>
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <SidebarTrigger />
          <div className="flex items-center justify-between w-full ml-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-400" />
                Batch Email
              </h1>
              <p className="text-muted-foreground">
                Campaign and bulk email service
              </p>
            </div>
            <Button
              onClick={refreshData}
              variant="outline"
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <Alert className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10">
            <AlertDescription className="text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {workerStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Queue Pending
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {workerStats.pending}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      waiting to send
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Processing
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {workerStats.processing}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      currently sending
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Sent
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {workerStats.sent}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      successfully delivered
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Failed</p>
                    <p className="text-3xl font-bold text-foreground">
                      {workerStats.failed}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      delivery failed
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-6">
          <WorkerStatus />
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-background"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </TabsTrigger>
            <TabsTrigger
              value="campaigns"
              className="data-[state=active]:bg-background"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Campaigns ({batches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Create Batch Email Campaign
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Send emails to up to 100 recipients per batch. This counts
                  towards your account&apos;s overall 100 daily email limit.
                  Processing happens automatically in the background.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from" className="text-foreground">
                        From Name (Optional)
                      </Label>
                      <Input
                        id="from"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        placeholder="Your Name or Company"
                        disabled={loading}
                        className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-foreground">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject"
                        required
                        disabled={loading}
                        className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="recipients" className="text-foreground">
                        Recipients * (One email per line, max 100 per batch)
                      </Label>
                      <div className="flex items-center gap-2">
                        {uploadedFileName && (
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <FileText className="w-4 h-4" />
                            <span>{uploadedFileName}</span>
                          </div>
                        )}
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploadingFile || loading}
                        />

                        {recipients ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearRecipients}
                            disabled={loading}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingFile || loading}
                            className="border-border text-muted-foreground hover:bg-accent bg-transparent"
                          >
                            <Upload
                              className={`w-4 h-4 mr-2 ${
                                uploadingFile ? "animate-spin" : ""
                              }`}
                            />
                            {uploadingFile
                              ? "Processing..."
                              : "Upload CSV/Excel"}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Textarea
                      id="recipients"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder={`user1@example.com
user2@example.com
user3@example.com

Or upload a CSV/Excel file with email addresses`}
                      className="min-h-[120px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                      required
                      disabled={loading || uploadingFile}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {
                          recipients
                            .split("\n")
                            .filter((email) => email.trim().length > 0).length
                        }{" "}
                        recipients
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Supports CSV and Excel files
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="html" className="text-foreground">
                      HTML Content *
                    </Label>
                    <Textarea
                      id="html"
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      placeholder="<h1>Hello!</h1><p>Your HTML email content here...</p>"
                      className="min-h-[200px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text" className="text-foreground">
                      Plain Text Content (Optional)
                    </Label>
                    <Textarea
                      id="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Plain text version of your email..."
                      className="min-h-[100px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || uploadingFile}
                    className="self-start bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading
                      ? "Creating Campaign..."
                      : "Create Batch Email Campaign"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card className="card-gradient">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-foreground">
                      Campaign History
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your batch email campaigns ({batches.length} total)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <div
                      key={batch.batchId}
                      className="p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-lg text-foreground">
                            {batch.subject}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Created:{" "}
                            {new Date(batch.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-border text-muted-foreground"
                          >
                            {batch.totalEmails} emails
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => fetchBatchDetails(batch.batchId)}
                            className="text-muted-foreground hover:text-foreground hover:bg-accent"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>Progress</span>
                          <span>{getProgressPercentage(batch)}% complete</span>
                        </div>
                        <Progress
                          value={getProgressPercentage(batch)}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center text-green-400">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">{batch.sent}</span>
                          <span className="text-muted-foreground ml-1">
                            sent
                          </span>
                        </div>
                        <div className="flex items-center text-red-400">
                          <XCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">{batch.failed}</span>
                          <span className="text-muted-foreground ml-1">
                            failed
                          </span>
                        </div>
                        <div className="flex items-center text-yellow-400">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="font-medium">{batch.pending}</span>
                          <span className="text-muted-foreground ml-1">
                            pending
                          </span>
                        </div>
                        <div className="flex items-center text-blue-400">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            {batch.processing}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            processing
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {batches.length === 0 && (
                    <div className="text-center py-12">
                      <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">
                        No campaigns created yet
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Create your first batch email campaign to get started
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="bg-background border-border max-w-4xl max-h-[80vh] overflow-y-auto">
          {!selectedBatch ? (
            <p className="text-center text-foreground">loading..</p>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Campaign Details
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Campaign ID: {selectedBatch?.batchId} •{" "}
                  {selectedBatch?.emails?.length || 0} emails
                </DialogDescription>
              </DialogHeader>

              {selectedBatch && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="text-2xl font-bold text-green-400">
                        {selectedBatch.stats?.sent || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Sent</div>
                    </div>
                    <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <div className="text-2xl font-bold text-red-400">
                        {selectedBatch.stats?.failed || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Failed
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-400">
                        {selectedBatch.stats?.pending || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pending
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="text-2xl font-bold text-blue-400">
                        {selectedBatch.stats?.processing || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Processing
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Email Details
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedBatch.emails &&
                      selectedBatch.emails.length > 0 ? (
                        selectedBatch.emails.map(
                          (email: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border"
                            >
                              <div className="flex-1">
                                <span className="text-sm font-medium text-foreground">
                                  {email.to}
                                </span>
                                {email.error && (
                                  <p className="text-red-400 text-xs mt-1">
                                    {email.error}
                                  </p>
                                )}
                                {email.messageId && (
                                  <p className="text-green-400 text-xs mt-1">
                                    ID: {email.messageId}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant={
                                  email.status === "sent"
                                    ? "default"
                                    : email.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className={
                                  email.status === "sent"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : email.status === "failed"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : email.status === "processing"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-yellow-600 hover:bg-yellow-700"
                                }
                              >
                                {email.status}
                              </Badge>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No email details available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
