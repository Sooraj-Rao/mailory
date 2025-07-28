/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Palette,
  Send,
  Upload,
  X,
  Users,
  ChevronDown,
  Type,
  ImageIcon,
  List,
  ListOrdered,
  MousePointer,
  Minus,
  Save,
  Eye,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface BroadcastData {
  id: string;
  subject: string;
  from: string;
  replyTo: string;
  previewText: string;
  htmlContent: string;
  textContent: string;
  recipients: string[];
  status: "draft" | "sent" | "scheduled";
  createdAt: string;
  scheduledFor?: string;
}

export default function BroadcastCreatePage() {
  const router = useRouter();
  const params = useParams();
  const broadcastId = params.id as string;

  const [broadcast, setBroadcast] = useState<BroadcastData>({
    id: broadcastId || "",
    subject: "",
    from: "Acme <acme@example.com>",
    replyTo: "",
    previewText: "",
    htmlContent: "",
    textContent: "",
    recipients: [],
    status: "draft",
    createdAt: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAudienceDialog, setShowAudienceDialog] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [recipientText, setRecipientText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (broadcastId && broadcastId !== "new") {
      loadBroadcast();
    }
  }, [broadcastId]);

  const loadBroadcast = async () => {
    try {
      const response = await fetch(`/api/broadcasts/${broadcastId}`);
      const data = await response.json();
      if (response.ok) {
        setBroadcast(data);
        setRecipientText(data.recipients.join("\n"));
      }
    } catch (err) {
      console.error("Failed to load broadcast:", err);
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/broadcasts/${broadcastId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...broadcast,
          recipients: recipientText.split("\n").filter((email) => email.trim()),
        }),
      });

      if (response.ok) {
        setSuccess("Draft saved successfully!");
        setTimeout(() => setSuccess(""), 2000);
      }
    } catch {
      setError("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcast.subject.trim()) {
      setError("Subject is required");
      return;
    }

    if (!broadcast.htmlContent.trim()) {
      setError("Email content is required");
      return;
    }

    if (broadcast.recipients.length === 0) {
      setError("At least one recipient is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/broadcasts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...broadcast,
          recipients: recipientText.split("\n").filter((email) => email.trim()),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Broadcast sent successfully!");
        setTimeout(() => {
          router.push("/dashboard/broadcasts");
        }, 2000);
      } else {
        setError(data.error || "Failed to send broadcast");
      }
    } catch {
      setError("Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    console.log("Sending test email...");
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

      const currentRecipients = recipientText.trim();
      const newRecipients = currentRecipients
        ? currentRecipients + "\n" + extractedEmails.join("\n")
        : extractedEmails.join("\n");

      setRecipientText(newRecipients);
      setBroadcast((prev) => ({
        ...prev,
        recipients: newRecipients.split("\n").filter((email) => email.trim()),
      }));
      setSuccess(
        `Successfully imported ${extractedEmails.length} email addresses`
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

  const insertContent = (type: string) => {
    const editor = document.getElementById(
      "html-editor"
    ) as HTMLTextAreaElement;
    if (!editor) return;

    const cursorPos = editor.selectionStart;
    const textBefore = broadcast.htmlContent.substring(0, cursorPos);
    const textAfter = broadcast.htmlContent.substring(editor.selectionEnd);

    let insertText = "";
    switch (type) {
      case "heading1":
        insertText = "<h1>Heading 1</h1>";
        break;
      case "heading2":
        insertText = "<h2>Heading 2</h2>";
        break;
      case "heading3":
        insertText = "<h3>Heading 3</h3>";
        break;
      case "text":
        insertText = "<p>Your text here</p>";
        break;
      case "image":
        insertText =
          '<img src="https://via.placeholder.com/400x200" alt="Image" style="max-width: 100%; height: auto;" />';
        break;
      case "bullet":
        insertText = "<ul><li>List item 1</li><li>List item 2</li></ul>";
        break;
      case "numbered":
        insertText = "<ol><li>List item 1</li><li>List item 2</li></ol>";
        break;
      case "button":
        insertText =
          '<a href="#" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Button Text</a>';
        break;
      case "divider":
        insertText =
          '<hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />';
        break;
    }

    const newContent = textBefore + insertText + textAfter;
    setBroadcast((prev) => ({ ...prev, htmlContent: newContent }));

    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(
        cursorPos + insertText.length,
        cursorPos + insertText.length
      );
    }, 0);
  };

  const recipientCount = recipientText
    .split("\n")
    .filter((email) => email.trim()).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <Palette className="w-4 h-4" />
              Styles
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Broadcasts</span>
            <span>/</span>
            <span>{broadcast.subject || "Untitled"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={saveDraft}
              disabled={saving}
              className="gap-2 bg-transparent"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestEmail}
              className="gap-2 bg-transparent"
            >
              <Eye className="w-4 h-4" />
              Test email
            </Button>
            <Button
              onClick={sendBroadcast}
              disabled={loading}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <Alert className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertDescription className="text-red-600 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10">
            <AlertDescription className="text-green-600 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  From
                </Label>
                <Input
                  value={broadcast.from}
                  onChange={(e) =>
                    setBroadcast((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className="mt-1"
                  placeholder="Your Name <email@example.com>"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  To
                  <Dialog
                    open={showAudienceDialog}
                    onOpenChange={setShowAudienceDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs bg-transparent"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        {recipientCount} recipients
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Manage Recipients</DialogTitle>
                        <DialogDescription>
                          Add email addresses manually or upload a CSV/Excel
                          file
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingFile}
                            className="gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {uploadingFile
                              ? "Processing..."
                              : "Upload CSV/Excel"}
                          </Button>
                          {recipientText && (
                            <Button
                              variant="outline"
                              onClick={() => setRecipientText("")}
                              className="gap-2 text-red-600"
                            >
                              <X className="w-4 h-4" />
                              Clear All
                            </Button>
                          )}
                        </div>
                        <Textarea
                          value={recipientText}
                          onChange={(e) => setRecipientText(e.target.value)}
                          placeholder="Enter email addresses, one per line..."
                          className="min-h-[200px]"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {recipientCount} recipients
                          </span>
                          <Button
                            onClick={() => {
                              setBroadcast((prev) => ({
                                ...prev,
                                recipients: recipientText
                                  .split("\n")
                                  .filter((email) => email.trim()),
                              }));
                              setShowAudienceDialog(false);
                            }}
                          >
                            Save Recipients
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </Label>
                <Input
                  value={
                    recipientCount > 0
                      ? `${recipientCount} recipients selected`
                      : ""
                  }
                  readOnly
                  className="mt-1 bg-gray-50 dark:bg-gray-700"
                  placeholder="Click to add recipients"
                  onClick={() => setShowAudienceDialog(true)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subject
                </Label>
                <Input
                  value={broadcast.subject}
                  onChange={(e) =>
                    setBroadcast((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="mt-1"
                  placeholder="Email subject line"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reply-To
                </Label>
                <Input
                  value={broadcast.replyTo}
                  onChange={(e) =>
                    setBroadcast((prev) => ({
                      ...prev,
                      replyTo: e.target.value,
                    }))
                  }
                  className="mt-1"
                  placeholder="reply@example.com"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  When
                </Label>
                <Input
                  value={broadcast.scheduledFor || ""}
                  onChange={(e) =>
                    setBroadcast((prev) => ({
                      ...prev,
                      scheduledFor: e.target.value,
                    }))
                  }
                  type="datetime-local"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preview text
                </Label>
                <Input
                  value={broadcast.previewText}
                  onChange={(e) =>
                    setBroadcast((prev) => ({
                      ...prev,
                      previewText: e.target.value,
                    }))
                  }
                  className="mt-1"
                  placeholder="This appears in email previews"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                /
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                  >
                    <Type className="w-4 h-4" />
                    Add Content
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-gray-900 border-gray-700">
                  <DropdownMenuItem
                    onClick={() => insertContent("text")}
                    className="gap-2 text-gray-300 hover:bg-gray-800"
                  >
                    <Type className="w-4 h-4" />
                    Text
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => insertContent("image")}
                    className="gap-2 text-gray-300 hover:bg-gray-800"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => insertContent("heading1")}
                    className="gap-2 text-gray-300 hover:bg-gray-800"
                  >
                    <Type className="w-4 h-4" />
                    Heading 1
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => insertContent("heading2")}
                    className="gap-2 text-gray-300 hover:bg-gray-800"
                  >
                    <Type className="w-4 h-4" />
                    Heading 2
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => insertContent("heading3")}
                    className="gap-2 text-gray-300 hover:bg-gray-800"
                  >
                    <Type className="w-4 h-4" />
                    Heading 3
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => insertContent("bullet")}
                    className="gap-2 text-gray-300 hover:bg-gray-800"
                  >
                    <List className="w-4 h-4" />
                    Bullet List
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => insertContent("numbered")}
                    className="gap-2 text-gray-300 hover:bg-gray-800"
                  >
                    <ListOrdered className="w-4 h-4" />
                    Numbered List
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => insertContent("button")}
                    className="gap-2 text-gray-300 hover:bg-gray-800"
                  >
                    <MousePointer className="w-4 h-4" />
                    Button
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => insertContent("divider")}
                    className="gap-2 text-gray-300 hover:bg-gray-800"
                  >
                    <Minus className="w-4 h-4" />
                    Divider
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Textarea
              id="html-editor"
              value={broadcast.htmlContent}
              onChange={(e) =>
                setBroadcast((prev) => ({
                  ...prev,
                  htmlContent: e.target.value,
                }))
              }
              className="min-h-[400px] font-mono text-sm"
              placeholder="<h1>Welcome to our newsletter!</h1>
<p>Your HTML content goes here...</p>"
            />
          </div>

          <div className="mt-6">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Plain Text Version (Optional)
            </Label>
            <Textarea
              value={broadcast.textContent}
              onChange={(e) =>
                setBroadcast((prev) => ({
                  ...prev,
                  textContent: e.target.value,
                }))
              }
              className="mt-2 min-h-[150px]"
              placeholder="Plain text version of your email content..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
