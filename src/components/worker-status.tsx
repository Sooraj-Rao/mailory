"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RefreshCw, Zap } from "lucide-react";

export default function WorkerStatus() {
  const [status, setStatus] = useState<"running" | "stopped" | "unknown">(
    "unknown"
  );
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/worker/control");
      const data = await response.json();
      if (response.ok) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error("Failed to fetch worker status:", error);
      setStatus("unknown");
    }
  };

  const startWorker = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/worker/control", { method: "POST" });
      // await response.json();
      if (response.ok) {
        setStatus("running");
      }
    } catch (error) {
      console.error("Failed to start worker:", error);
    } finally {
      setLoading(false);
    }
  };

  const stopWorker = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/worker/control", { method: "DELETE" });
      // const data = await response.json();
      if (response.ok) {
        setStatus("stopped");
      }
    } catch (error) {
      console.error("Failed to stop worker:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Background Worker
          </span>
          <Badge
            variant={status === "running" ? "default" : "secondary"}
            className={status === "running" ? "bg-green-600" : "bg-gray-600"}
          >
            {status === "running"
              ? "Running"
              : status === "stopped"
              ? "Stopped"
              : "Unknown"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">
            {status === "running" ? (
              <span>✅ Automatically processing emails every 10 seconds</span>
            ) : status === "stopped" ? (
              <span>
                ⏸️ Worker is stopped - emails won&apos;t process automatically (APIs)
              </span>
            ) : (
              <span>❓ Worker status unknown</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchStatus}
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {status !== "running" ? (
              <Button
                onClick={startWorker}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={stopWorker}
                size="sm"
                variant="destructive"
                disabled={loading}
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
