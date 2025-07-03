"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Copy,
  Key,
  RefreshCw,
  Plus,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  Crown,
  AlertTriangle,
} from "lucide-react"
import { SidebarTrigger } from "@/components/home/sidebar"
import Link from "next/link"

interface ApiKey {
  id: string
  keyName: string
  keyValue?: string
  createdAt: string
  lastUsed: string | null
  stats: {
    total: number
    sent: number
    failed: number
    today: {
      total: number
      sent: number
      failed: number
    }
  }
}

interface EmailStats {
  today: {
    sent: number
    failed: number
    total: number
    remaining: number
  }
  total: {
    sent: number
    failed: number
    total: number
  }
  limits: {
    dailyLimit: number
    monthlyLimit: number
    dailyUsed: number
    monthlyUsed: number
    dailyRemaining: number
    monthlyRemaining: number
  }
  subscription: {
    plan: string
    status: string
  }
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string>("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchApiKeys(), fetchEmailStats()])
  }

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/keys")
      const data = await response.json()
      if (response.ok) {
        setApiKeys(data.apiKeys)
      } else {
        setError(data.error || "Failed to fetch API keys")
      }
    } catch {
      setError("Failed to fetch API keys")
      console.error("Failed to fetch API keys")
    }
  }

  const fetchEmailStats = async () => {
    try {
      const response = await fetch("/api/email-stats")
      const data = await response.json()
      if (response.ok) {
        setEmailStats(data)
      } else {
        setError(data.error || "Failed to fetch email stats")
      }
    } catch {
      setError("Failed to fetch email stats")
      console.error("Failed to fetch email stats")
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    setSuccess("Data refreshed!")
    setTimeout(() => setSuccess(""), 2000)
  }

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyName: newKeyName }),
      })

      const data = await response.json()

      if (data.success) {
        setNewlyCreatedKey(data.apiKey.keyValue)
        setShowNewKeyDialog(true)
        setNewKeyName("")
        fetchApiKeys()
      } else {
        setError(data.error)
      }
    } catch {
      setError("Failed to create API key")
    } finally {
      setLoading(false)
    }
  }

  const deleteApiKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to delete the API key "${keyName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/keys?id=${keyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("API key deleted successfully!")
        fetchApiKeys()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete API key")
      }
    } catch {
      setError("Failed to delete API key")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("Copied to clipboard!")
    setTimeout(() => setSuccess(""), 2000)
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-500"
      case "starter":
        return "bg-blue-500"
      case "pro":
        return "bg-purple-500"
      case "premium":
        return "bg-gold-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1)
  }

  return (
    <div className="min-h-screen app-gradient overflow-y-auto">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <SidebarTrigger />
          <div className="flex items-center justify-between w-full ml-4">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
                API Keys
              </h1>
              <p className="text-muted-foreground text-sm">Manage your API keys and view usage statistics</p>
            </div>
            <div className="flex items-center gap-4">
              {emailStats && (
                <Badge
                  className={`${getPlanColor(emailStats.subscription.plan)} hover:${getPlanColor(emailStats.subscription.plan)}`}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {getPlanName(emailStats.subscription.plan)} Plan
                </Badge>
              )}
              <Button onClick={refreshData} variant="outline" disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <Alert className="mb-6 border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Limit Warning */}
        {emailStats && emailStats.limits.dailyRemaining <= 10 && (
          <Alert className="mb-6 border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: You have only {emailStats.limits.dailyRemaining} emails remaining today.
              {emailStats.subscription.plan === "free" && (
                <Link href="/dashboard/billing" className="ml-2 underline">
                  Upgrade your plan for higher limits.
                </Link>
              )}
            </AlertDescription>
          </Alert>
        )}

        {emailStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Today&apos;s API Calls</p>
                    <p className="text-3xl font-bold text-foreground">{emailStats.today.total}</p>
                    <p className="text-xs text-muted-foreground">
                      {emailStats.today.sent} sent, {emailStats.today.failed} failed
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Daily Remaining</p>
                    <p className="text-3xl font-bold text-foreground">{emailStats.limits.dailyRemaining}</p>
                    <p className="text-xs text-muted-foreground">out of {emailStats.limits.dailyLimit} daily limit</p>
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
                    <p className="text-sm text-muted-foreground mb-1">Total API Calls</p>
                    <p className="text-3xl font-bold text-foreground">{emailStats.total.total}</p>
                    <p className="text-xs text-muted-foreground">all time</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-foreground">
                      {emailStats.total.total > 0
                        ? Math.round((emailStats.total.sent / emailStats.total.total) * 100)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground">API success rate</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="card-gradient mb-6">
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key to access the email service (Max 5 keys per account)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createApiKey} className="flex gap-4">
              <div>
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  className="w-full"
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  required
                  disabled={apiKeys.length >= 5}
                />
              </div>
              <Button variant="grad1" type="submit" disabled={loading || apiKeys.length >= 5} className="mt-6">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Creating..." : "Create Key"}
              </Button>
            </form>
            {apiKeys.length >= 5 && (
              <p className="text-sm text-muted-foreground mt-2">
                You have reached the maximum limit of 5 API keys. Delete an existing key to create a new one.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Your API Keys ({apiKeys.length}/5)</CardTitle>
            <CardDescription>Manage your existing API keys and view their usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground">{key.keyName}</h3>
                      <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Calls</p>
                        <p className="font-semibold text-foreground">{key.stats.total}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-semibold text-green-400">
                          {key.stats.total > 0 ? Math.round((key.stats.sent / key.stats.total) * 100) : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Today&apos;s Calls</p>
                        <p className="font-semibold text-foreground">{key.stats.today.total}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Used</p>
                        <p className="font-semibold text-foreground">
                          {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="destructive" onClick={() => deleteApiKey(key.id, key.keyName)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && (
                <div className="text-center py-12">
                  <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">No API keys created yet</p>
                  <p className="text-muted-foreground text-sm">Create your first API key above to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">API Key Created Successfully!</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Please copy your API key now. You won&apos;t be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm break-all text-foreground">{newlyCreatedKey}</code>
            </div>
            <Button onClick={() => copyToClipboard(newlyCreatedKey)} className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
