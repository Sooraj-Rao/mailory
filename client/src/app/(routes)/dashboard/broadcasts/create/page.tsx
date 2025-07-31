/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Upload, FileText, X, Code, Mail, RefreshCw } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto">
        <div>
          <div className="flex h-16 items-center px-4 sm:px-6">
            <div className="flex items-center justify-between w-full ml-4">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    Create Broadcast
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <AlertDescription className="text-green-400">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="custom-gradient3 hover:bg-transparent">
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6 mt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from" className="text-foreground">
                        From*
                      </Label>
                      <Input
                        id="from"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        placeholder="Your Name or Company"
                        disabled={loading}
                        className="custom-gradient3"
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
                        className="custom-gradient3"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <Label htmlFor="recipients" className="text-foreground">
                        Recipients * (Max 100 per batch)
                      </Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {uploadedFileName && (
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <FileText className="w-4 h-4" />
                            <span className="truncate max-w-32">
                              {uploadedFileName}
                            </span>
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
                            className="custom-gradient3 bg-transparent"
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
                            className="custom-gradient1 bg-transparent mt-2 sm:mt-0"
                          >
                            <Upload
                              className={`w-4 h-4 mr-2 ${
                                uploadingFile ? "animate-spin" : ""
                              }`}
                            />
                            <span className="hidden sm:inline">
                              {uploadingFile ? "Processing..." : "Upload File"}
                            </span>
                            <span className="sm:hidden">
                              {uploadingFile ? "..." : "Upload"}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className=" flex sm:justify-end justify-start">
                      <span className="text-xs  text-muted-foreground">
                        Supports CSV and Excel files
                      </span>
                    </div>
                    <Textarea
                      id="recipients"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com&#10;&#10;Or upload a CSV/Excel file"
                      className="min-h-[120px] custom-gradient3"
                      required
                      disabled={loading || uploadingFile}
                    />
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-muted-foreground gap-1">
                      <span>{recipientCount} recipients</span>
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
                        className="min-h-[200px] custom-gradient3 font-mono text-sm"
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
                        className="min-h-[200px] custom-gradient3 "
                        disabled={loading}
                      />
                    </TabsContent>
                  </Tabs>

                  <Button
                    size="sm"
                    
                    type="submit"
                    disabled={loading || uploadingFile}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      {loading
                        ? "Creating Campaign..."
                        : "Create Broadcast Campaign"}
                    </span>
                    <span className="sm:hidden">
                      {loading ? "Creating..." : "Create Campaign"}
                    </span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="custom-gradient3 hover:bg-transparent">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      Preview
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={previewMode === "html" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode("html")}
                      className="custom-gradient3 bg-transparent"
                    >
                      HTML
                    </Button>
                    <Button
                      variant={previewMode === "text" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode("text")}
                      className="custom-gradient3 bg-transparent"
                    >
                      Text
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 custom-gradient3 hover:bg-transparent">
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted-foreground">From:</span>
                        <span className="break-all">
                          {from || "Your Email"}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted-foreground">Subject:</span>
                        <span className="font-medium break-all">
                          {subject || "Email Subject"}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted-foreground">To:</span>
                        <span>
                          {recipientCount > 0
                            ? `${recipientCount} recipients`
                            : "No recipients"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg custom-gradient3 hover:bg-transparent min-h-[300px]">
                    {previewMode === "html" ? (
                      <div className="p-4">
                        {html ? (
                          <div
                            className="prose prose-sm max-w-none dark:prose-invert break-words"
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
                          <pre className="whitespace-pre-wrap text-sm font-sans break-words">
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

          <div className="hidden s flex-col gap-2">
            <Button
              variant="outline"
              className="custom-gradient bg-transparent"
            >
              <Code className="w-4 h-4 mr-2" />
              API Documentation
            </Button>
            <Button
              variant="outline"
              className="custom-gradient bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Email Templates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
