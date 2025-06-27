/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Send, Clock, CheckCircle, XCircle, ArrowLeft, RefreshCw, Eye, ArrowRight, Mail, BarChart3 } from "lucide-react"
import Link from "next/link"
import WorkerStatus from "@/components/worker-status"

interface BatchStatus {
  batchId: string
  subject: string
  createdAt: string
  totalEmails: number
  sent: number
  failed: number
  pending: number
  processing: number
}

interface WorkerStats {
  pending: number
  processing: number
  sent: number
  failed: number
}

export default function BatchEmailPage() {
  const [recipients, setRecipients] = useState("")
  const [subject, setSubject] = useState("")
  const [html, setHtml] = useState("")
  const [text, setText] = useState("")
  const [from, setFrom] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [batches, setBatches] = useState<BatchStatus[]>([])
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  // const [currentBatch, setCurrentBatch] = useState<{ batchId: string; totalEmails: number } | null>(null)
  // const [showProcessor, setShowProcessor] = useState(false)
  const [workerStats, setWorkerStats] = useState<WorkerStats | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    await Promise.all([fetchBatches(), fetchWorkerStats()])
  }

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/batch-email/status", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setBatches(data.batches || [])
        console.log("Fetched batches:", data.batches)
      } else {
        console.error("Failed to fetch batches:", data)
      }
    } catch (err) {
      console.error("Failed to fetch batches:", err)
    }
  }

  const fetchWorkerStats = async () => {
    try {
      const response = await fetch("/api/worker/auto-process")
      const data = await response.json()
      if (response.ok) {
        setWorkerStats(data.stats)
      }
    } catch (err) {
      console.error("Failed to fetch worker stats:", err)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    setSuccess("Data refreshed!")
    setTimeout(() => setSuccess(""), 2000)
  }

  const fetchBatchDetails = async (batchId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/batch-email/status?batchId=${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setSelectedBatch(data)
      }
    } catch {
      console.error("Failed to fetch batch details")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const recipientList = recipients
        .split("\n")
        .map((email) => email.trim())
        .filter((email) => email.length > 0)

      if (recipientList.length === 0) {
        setError("Please enter at least one recipient email")
        return
      }

      if (recipientList.length > 100) {
        setError("Maximum 100 recipients allowed")
        return
      }

      const token = localStorage.getItem("token")
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
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Batch created successfully! Processing ${data.totalEmails} emails automatically...`)

        // Clear form
        setRecipients("")
        setSubject("")
        setHtml("")
        setText("")
        setFrom("")

        fetchData()
      } else {
        setError(data.error || data.message)
      }
    } catch  {
      setError("Failed to create batch")
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (batch: BatchStatus) => {
    const completed = batch.sent + batch.failed
    return Math.round((completed / batch.totalEmails) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Batch Email</h1>
              <p className="text-slate-300">Send emails to multiple recipients</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={refreshData}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-500/10">
            <AlertDescription className="text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {/* Worker Status */}
        <div className="mb-6">
          <WorkerStatus />
        </div>

        {/* Worker Stats Dashboard */}
        {workerStats && (
          <Card className="mb-6 border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Queue Overview
              </CardTitle>
              <CardDescription className="text-slate-300">Current batch email processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-400">{workerStats.pending}</div>
                  <div className="text-sm text-slate-400 mt-1">Pending</div>
                  <div className="text-xs text-slate-500">Waiting to send</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-400">{workerStats.processing}</div>
                  <div className="text-sm text-slate-400 mt-1">Processing</div>
                  <div className="text-xs text-slate-500">Currently sending</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-400">{workerStats.sent}</div>
                  <div className="text-sm text-slate-400 mt-1">Sent</div>
                  <div className="text-xs text-slate-500">Successfully delivered</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-3xl font-bold text-red-400">{workerStats.failed}</div>
                  <div className="text-sm text-slate-400 mt-1">Failed</div>
                  <div className="text-xs text-slate-500">Delivery failed</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Total Processed: {workerStats.sent + workerStats.failed}</span>
                  <span className="text-slate-300">
                    Success Rate:{" "}
                    {workerStats.sent + workerStats.failed > 0
                      ? Math.round((workerStats.sent / (workerStats.sent + workerStats.failed)) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-600">
              <Send className="w-4 h-4 mr-2" />
              Create Batch
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
              <Clock className="w-4 h-4 mr-2" />
              Batch History ({batches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Create Batch Email</CardTitle>
                <CardDescription className="text-slate-300">
                  Send emails to up to 100 recipients. Processing happens automatically in the background.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from" className="text-slate-200">
                        From Name (Optional)
                      </Label>
                      <Input
                        id="from"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        placeholder="Your Name or Company"
                        className="bg-slate-700 border-slate-600 text-white"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-slate-200">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject"
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipients" className="text-slate-200">
                      Recipients * (One email per line, max 100)
                    </Label>
                    <Textarea
                      id="recipients"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder={`user1@example.com
user2@example.com
user3@example.com`}
                      className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                      required
                      disabled={loading}
                    />
                    <div className="text-sm text-slate-400">
                      {recipients.split("\n").filter((email) => email.trim().length > 0).length} recipients
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="html" className="text-slate-200">
                      HTML Content *
                    </Label>
                    <Textarea
                      id="html"
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      placeholder="<h1>Hello!</h1><p>Your HTML email content here...</p>"
                      className="bg-slate-700 border-slate-600 text-white min-h-[200px]"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text" className="text-slate-200">
                      Plain Text Content (Optional)
                    </Label>
                    <Textarea
                      id="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Plain text version of your email..."
                      className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Creating Batch..." : "Create Batch Email"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Batch History</CardTitle>
                    <CardDescription className="text-slate-300">
                      Your recent batch email campaigns ({batches.length} total)
                    </CardDescription>
                  </div>
                  <Button
                    onClick={fetchBatches}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batches.length > 0 ? (
                    batches.map((batch) => (
                      <div key={batch.batchId} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-white font-medium text-lg">{batch.subject}</h3>
                            <p className="text-slate-400 text-sm">
                              Created: {new Date(batch.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-slate-500 text-slate-300">
                              {batch.totalEmails} emails
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => fetchBatchDetails(batch.batchId)}
                              className="text-slate-400 hover:text-white hover:bg-slate-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-slate-400 mb-2">
                            <span>Progress</span>
                            <span>{getProgressPercentage(batch)}% complete</span>
                          </div>
                          <Progress value={getProgressPercentage(batch)} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center text-green-400">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span className="font-medium">{batch.sent}</span>
                            <span className="text-slate-400 ml-1">sent</span>
                          </div>
                          <div className="flex items-center text-red-400">
                            <XCircle className="w-4 h-4 mr-2" />
                            <span className="font-medium">{batch.failed}</span>
                            <span className="text-slate-400 ml-1">failed</span>
                          </div>
                          <div className="flex items-center text-yellow-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="font-medium">{batch.pending}</span>
                            <span className="text-slate-400 ml-1">pending</span>
                          </div>
                          <div className="flex items-center text-blue-400">
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="font-medium">{batch.processing}</span>
                            <span className="text-slate-400 ml-1">processing</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">No batch emails created yet</p>
                      <p className="text-slate-500 text-sm">Create your first batch email to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Batch Details Modal */}
            {selectedBatch && (
              <Card className="mt-6 border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Batch Details</CardTitle>
                  <CardDescription className="text-slate-300">
                    Batch ID: {selectedBatch.batchId} • {selectedBatch.emails?.length || 0} emails
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Batch Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded">
                      <div className="text-xl font-bold text-green-400">{selectedBatch.stats?.sent || 0}</div>
                      <div className="text-xs text-slate-400">Sent</div>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded">
                      <div className="text-xl font-bold text-red-400">{selectedBatch.stats?.failed || 0}</div>
                      <div className="text-xs text-slate-400">Failed</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <div className="text-xl font-bold text-yellow-400">{selectedBatch.stats?.pending || 0}</div>
                      <div className="text-xs text-slate-400">Pending</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                      <div className="text-xl font-bold text-blue-400">{selectedBatch.stats?.processing || 0}</div>
                      <div className="text-xs text-slate-400">Processing</div>
                    </div>
                  </div>

                  {/* Email List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedBatch.emails && selectedBatch.emails.length > 0 ? (
                      selectedBatch.emails.map((email: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                          <div className="flex-1">
                            <span className="text-white text-sm font-medium">{email.to}</span>
                            {email.error && <p className="text-red-400 text-xs mt-1">{email.error}</p>}
                            {email.messageId && <p className="text-green-400 text-xs mt-1">ID: {email.messageId}</p>}
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
                                ? "bg-green-600"
                                : email.status === "failed"
                                  ? "bg-red-600"
                                  : email.status === "processing"
                                    ? "bg-blue-600"
                                    : "bg-yellow-600"
                            }
                          >
                            {email.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">No email details available</p>
                    )}
                  </div>

                  <Button
                    onClick={() => setSelectedBatch(null)}
                    className="mt-4 w-full bg-slate-600 hover:bg-slate-700"
                  >
                    Close Details
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
