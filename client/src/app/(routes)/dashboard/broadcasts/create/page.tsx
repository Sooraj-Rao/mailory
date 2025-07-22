/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import type React from "react";
import { useState, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Upload,
  FileText,
  X,
  Eye,
  Code,
  ArrowLeft,
  Users,
  Mail,
  RefreshCw,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/home/sidebar";

export default function CreateBroadcastPage() {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [from, setFrom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

      const response = await fetch("/api/broadcasts/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        router.push("/dashboard/broadcasts");
      } else {
        setError(data.error || data.message);
      }
    } catch {
      setError("Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  const recipientCount = recipients
    .split("\n")
    .filter((email) => email.trim().length > 0).length;

  return (
    <div className="min-h-screen m-10 flex justify-center">
      <div className="w-[64rem]">
        {/* Header */}
        <div>
          <div className="flex h-16 items-center px-6">
            <SidebarTrigger />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/broadcasts">
                  <Button
                    variant="outline"
                    size="sm"
                    className="custom-gradient bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Broadcasts
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Create Broadcast</h1>
                  <p className="text-muted-foreground text-sm">
                    Campaign and bulk email service
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="custom-gradient bg-transparent"
                >
                  <Code className="w-4 h-4 mr-2" />
                  API
                </Button>
                <Button
                  variant="outline"
                  className="custom-gradient bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Templates
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Alerts */}
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

          {/* Campaign Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="custom-gradient1">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-200 hover:bg-blue-300 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-500 text-blue-900 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recipients</p>
                    <p className="text-xl font-bold">{recipientCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="custom-gradient1">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-200 hover:bg-green-300 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-500 text-green-900 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60 dark:text-yellow-500 text-yellow-900">
                      Draft
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="custom-gradient1">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-200 hover:bg-purple-300 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 dark:text-purple-500 text-purple-900 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Content</p>
                    <p className="text-xl font-bold">
                      {html.length > 0 ? "Ready" : "Empty"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <Card className="custom-gradient1">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Campaign Details
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure your email campaign settings and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
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
                        className="custom-gradient1"
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
                        className="custom-gradient1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="recipients" className="text-foreground">
                        Recipients * (Max 100 per batch)
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
                            className="custom-gradient bg-transparent"
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
                            className="custom-gradient bg-transparent"
                          >
                            <Upload
                              className={`w-4 h-4 mr-2 ${
                                uploadingFile ? "animate-spin" : ""
                              }`}
                            />
                            {uploadingFile ? "Processing..." : "Upload File"}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Textarea
                      id="recipients"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com&#10;&#10;Or upload a CSV/Excel file"
                      className="min-h-[120px] custom-gradient1"
                      required
                      disabled={loading || uploadingFile}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{recipientCount} recipients</span>
                      <span className="text-xs">
                        Supports CSV and Excel files
                      </span>
                    </div>
                  </div>

                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 custom-gradient1">
                      <TabsTrigger value="html">HTML Content</TabsTrigger>
                      <TabsTrigger value="text">Plain Text</TabsTrigger>
                    </TabsList>
                    <TabsContent value="html" className="space-y-2">
                      <Label htmlFor="html" className="text-foreground">
                        HTML Content *
                      </Label>
                      <Textarea
                        id="html"
                        value={html}
                        onChange={(e) => {
                          setHtml(e.target.value);
                          setPreviewMode("html");
                        }}
                        placeholder="<h1>Hello!</h1><p>Your HTML email content here...</p>"
                        className="min-h-[200px] custom-gradient1 font-mono text-sm"
                        required
                        disabled={loading}
                      />
                    </TabsContent>
                    <TabsContent value="text" className="space-y-2">
                      <Label htmlFor="text" className="text-foreground">
                        Plain Text Content (Optional)
                      </Label>
                      <Textarea
                        id="text"
                        value={text}
                        onChange={(e) => {
                          setText(e.target.value);
                          setPreviewMode("text");
                        }}
                        placeholder="Plain text version of your email..."
                        className="min-h-[200px] custom-gradient1"
                        disabled={loading}
                      />
                    </TabsContent>
                  </Tabs>

                  <Button
                    type="submit"
                    disabled={loading || uploadingFile}
                    className="w-full custom-gradient"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading
                      ? "Creating Campaign..."
                      : "Create Broadcast Campaign"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card className="custom-gradient1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Live Preview
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      See how your email will look to recipients
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={previewMode === "html" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode("html")}
                      className="custom-gradient bg-transparent"
                    >
                      HTML
                    </Button>
                    <Button
                      variant={previewMode === "text" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode("text")}
                      className="custom-gradient bg-transparent"
                    >
                      Text
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Email Header Preview */}
                  <div className="border rounded-lg p-4 custom-gradient1">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">From:</span>
                        <span>{from || "Your Email"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subject:</span>
                        <span className="font-medium">
                          {subject || "Email Subject"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">To:</span>
                        <span>
                          {recipientCount > 0
                            ? `${recipientCount} recipients`
                            : "No recipients"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="border rounded-lg custom-gradient1 min-h-[300px]">
                    {previewMode === "html" ? (
                      <div className="p-4">
                        {html ? (
                          <div
                            className="prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: html }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-64 text-muted-foreground">
                            <div className="text-center">
                              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>HTML content will appear here</p>
                              <p className="text-sm">
                                Start typing in the HTML field
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4">
                        {text ? (
                          <pre className="whitespace-pre-wrap text-sm font-sans">
                            {text}
                          </pre>
                        ) : (
                          <div className="flex items-center justify-center h-64 text-muted-foreground">
                            <div className="text-center">
                              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>Plain text content will appear here</p>
                              <p className="text-sm">
                                Start typing in the text field
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
