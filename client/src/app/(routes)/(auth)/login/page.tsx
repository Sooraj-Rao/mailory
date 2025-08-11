"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/home/sidebar";
import TestCredentials from "@/components/home/test-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (
    e: React.FormEvent,
    demoMail?: string,
    demoPassword?: string
  ) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: demoMail || email,
          password: demoPassword || password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard/emails");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoCredentials = (
    demoEmail: string,
    demoPassword: string
  ) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    handleSubmit(
      new Event("submit") as unknown as React.FormEvent,
      demoEmail,
      demoPassword
    );
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden app-gradient">
      <TestCredentials onUse={handleUseDemoCredentials} />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>

      <Card className="w-full max-w-md card-gradient relative z-10">
        <CardHeader className="space-y-1 text-center">
          <Logo />
          <CardDescription>Sign in to your Mailory account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button size="lg" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground">
              Don&apos;t have an account?{" "}
            </span>
            <Link href="/login" className=" text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
