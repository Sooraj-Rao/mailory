"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Code,
  Globe,
  ArrowRight,
  Copy,
  Check,
  Send,
} from "lucide-react";
import Link from "next/link";
import CodeBlock from "@/lib/codeblock";
import { Logo } from "../sidebar";

const languages = [
  {
    id: "javascript",
    name: "Node.js",
    icon: "⬢",
    color: "from-green-400 to-green-600",
  },
  {
    id: "php",
    name: "PHP",
    icon: "🐘",
    color: "from-purple-400 to-purple-600",
  },
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "from-blue-400 to-blue-600",
  },
  { id: "go", name: "Go", icon: "🐹", color: "from-cyan-400 to-cyan-600" },
  {
    id: "java",
    name: "Java",
    icon: "☕",
    color: "from-orange-400 to-orange-600",
  },
];

const codeExamples = {
  javascript: `
const response = await fetch('https://mailory.site/api/emails', {
  method: 'POST',
  headers: {
    'mailory-authorization': 'Bearer API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'Mailory <app@mailory.site>',
    to: 'user@example.com',
    subject: 'Welcome to our platform',
    html: '<h1>Welcome!</h1><p>Thanks for joining us.</p>'
  })
});`,
  php: `<?php
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL => 'https://mailory.site/api/emails',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    'mailory-authorization: Bearer API_KEY',
    'Content-Type: application/json'
  ],
  CURLOPT_POSTFIELDS => json_encode([
    'from' => 'Mailory <app@mailory.site>',
    'to' => 'user@example.com',
    'subject' => 'Welcome to our platform',
    'html' => '<h1>Welcome!</h1><p>Thanks for joining us.</p>'
  ])
]);
$response = curl_exec($curl);`,
  python: `import requests

# Transactional Email API
response = requests.post(
  'https://mailory.site/api/emails',
  headers={
    'mailory-authorization': 'Bearer API_KEY',
    'Content-Type': 'application/json'
  },
  json={
    'from': 'Mailory <app@mailory.site>',
    'to': 'user@example.com',
    'subject': 'Welcome to our platform',
    'html': '<h1>Welcome!</h1><p>Thanks for joining us.</p>'
  }
)`,
  go: `package main

import (
  "bytes"
  "encoding/json"
  "net/http"
)

func main() {
  payload := map[string]string{
    "from":    "Mailory <app@mailory.site>",
    "to":      "user@example.com",
    "subject": "Welcome to our platform",
    "html":    "<h1>Welcome!</h1><p>Thanks for joining us.</p>",
  }
  
  jsonData, _ := json.Marshal(payload)
  req, _ := http.NewRequest("POST", "https://mailory.site/api/emails", bytes.NewBuffer(jsonData))
  req.Header.Set("mailory-authorization", "Bearer API_KEY")
  req.Header.Set("Content-Type", "application/json")
  
  client := &http.Client{}
  resp, _ := client.Do(req)
}`,
  java: `import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
String json = """
{
  "from": "Mailory <app@mailory.site>",
  "to": "user@example.com", 
  "subject": "Welcome to our platform",
  "html": "<h1>Welcome!</h1><p>Thanks for joining us.</p>"
}
""";

HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create("https://mailory.site/api/emails"))
  .header("mailory-authorization", "Bearer API_KEY")
  .header("Content-Type", "application/json")
  .POST(HttpRequest.BodyPublishers.ofString(json))
  .build();`,
};

export default function LandingPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(
      codeExamples[selectedLanguage as keyof typeof codeExamples]
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-2xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo />
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/docs"
                className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <Button variant="link" size="lg">
                  Documentation
                </Button>
              </Link>

              <Link href="/register">
                <Button size="lg">
                  <span className="relative z-10">Get Started</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="text-8xl font-black leading-none tracking-tight">
                <div className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Simple Email
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-gray-400">for</span>
                  <span
                    className={`bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-500 `}
                  >
                    Developers
                  </span>
                </div>
              </div>

              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Send transactional and broadcast emails easily, with support for
                custom domains to maintain your brand.
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8 py-6  hover:shadow-blue-500/25 transition-all duration-300 group"
                >
                  Start Building
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-lg px-8 py-6 bg-black/50 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                >
                  <Code className="mr-2 h-5 w-5" />
                  Documentation
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative h-96 lg:h-[600px] perspective-1000">
            {[...Array(1)].map((_, i) => (
              <div
                key={i}
                className="absolute w-72 h-44  backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl transition-all duration-1000 hover:scale-105 cursor-pointer"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${10 + (i % 2) * 40}%`,

                  zIndex: 10 - i,
                }}
              >
                <div className="p-6 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        Email Sent
                      </div>
                      <div className="text-xs text-gray-400">
                        hi@soorajrao.in
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: `${60 + i * 10}%` }}
                    />
                    <div
                      className="h-2 bg-gray-700 rounded-full"
                      style={{ width: `${40 + i * 8}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            <div
              className="absolute w-80 h-48  bg-black/95 backdrop-blur-sm rounded-xl border border-blue-500/30 shadow-2xl font-mono text-xs overflow-hidden"
              style={{
                top: "50%",
                right: "0%",
              }}
            >
              <div className="p-4 space-y-1">
                <div className="text-blue-400">POST /api/emails</div>
                <div className="text-gray-500">{"{"}</div>
                <div className="text-gray-300 ml-2">
                  {'"from"'}: {'"app@user-domain.com"'},
                </div>
                <div className="text-gray-300 ml-2">
                  {'"to"'}: {'"user@example.com"'},
                </div>
                <div className="text-gray-300 ml-2">
                  {'"subject"'}: {'"Welcome!"'},
                </div>
                <div className="text-gray-300 ml-2">
                  {'"html"'}: {'"&lt;h1&gt;Hello World&lt;/h1&gt;"'}
                </div>
                <div className="text-gray-500">{"}"}</div>
                <div className="mt-4 text-green-400">
                  ✓ Email sent successfully
                </div>
              </div>
            </div>

            <div
              className="absolute hidden w-64 h-40 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl"
              style={{
                bottom: "10%",
                left: "20%",
              }}
            >
              <div className="p-4">
                <div className="text-sm font-medium text-white mb-3">
                  Live Analytics
                </div>
                <div className="flex items-end gap-1 h-20">
                  {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map(
                    (height, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-t from-blue-600 to-cyan-400 rounded-sm flex-1 transition-all duration-1000"
                        style={{
                          height: `${height}%`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    )
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  29,486 emails delivered
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="relative inline-block mb-12">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl blur-xl opacity-50" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Integrate{" "}
              </span>
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                in 5 minutes
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light">
              Simple REST API for sending transactional emails and broadcast
              campaigns. Get your API key and start sending emails.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`relative group flex items-center space-x-3 px-6 py-4 rounded-2xl border transition-all duration-500 hover:scale-105 ${
                  selectedLanguage === lang.id
                    ? "bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/80 text-white shadow-2xl shadow-gray-900/50 backdrop-blur-xl"
                    : "bg-gradient-to-r from-gray-900/40 to-gray-800/40 border-gray-700/40 text-gray-400 hover:text-white hover:border-gray-600/60 backdrop-blur-xl"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${lang.color} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {lang.icon}
                </div>
                <span className="font-semibold">{lang.name}</span>
              </button>
            ))}
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <Card className="relative bg-black  shadow backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between px-8 py-2 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 border-gray-600/50 shadow-lg">
                      {languages.find((l) => l.id === selectedLanguage)?.name}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyToClipboard}
                    className="text-gray-400 hover:text-white hover:bg-gray-700/50  "
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <CardContent className="p-0">
                  <div>
                    <CodeBlock
                      language={selectedLanguage}
                      code={
                        codeExamples[
                          selectedLanguage as keyof typeof codeExamples
                        ]
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-20 mt-60 max-w-6xl mx-auto">
            <div className="relative group">
              <div className="relative h-96 rounded-3xl backdrop-blur-xl flex items-center justify-center">
                <div className="text-center">
                  <img alt="" src="../../../../home/api.png" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Core{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light">
              Everything you need to send emails. From transactional emails to
              broadcast campaigns, with custom domains and flexible billing.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <div className="relative group">
              <Card className="relative   shadow-2xl backdrop-blur-xl overflow-hidden  ">
                <CardContent className="p-10">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 custom-gradient5 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Send className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Email Sending
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                    Send transactional emails like password resets,
                    confirmations, and user notifications using a
                    straightforward API.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span className="text-gray-300">
                        Transactional Email API
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span className="text-gray-300">
                        Broadcast Campaigns (UI & API)
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-pink-400 rounded-full" />
                      <span className="text-gray-300">
                        Batch Processing (up to 100 emails)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <Card className="relative  shadow-2xl backdrop-blur-xl overflow-hidden ">
                <CardContent className="p-10">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 custom-gradient5 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Globe className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Custom Domains
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                    Use your own domain to send emails, with support for DKIM
                    and domain verification to maintain brand identity and
                    improve deliverability.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-gray-300">Domain Verification</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span className="text-gray-300">DKIM Configuration</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span className="text-gray-300">Brand Email Sending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-20 max-w-6xl mx-auto">
            <div className="relative group">
              <div className="relative h-96 rounded-3xl backdrop-blur-xl flex items-center justify-center">
                <div className="text-center">
                  <img alt="" src="../../../../home/emails.png" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative hidden py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/30 via-red-600/30 to-pink-600/30 rounded-3xl blur-xl opacity-50" />
            <div className="relative h-80 bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-3xl border border-gray-700/50 backdrop-blur-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-lg">
                  Image placeholder - Email logs and analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative z-10 max-w-7xl mx-auto px-6 py-32"
      >
        <div className="text-center mb-16">
          <h2 className="text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Simple
            </span>{" "}
            pricing
          </h2>
          <p className="text-xl text-gray-300">Start free, scale as you grow</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: "Free",
              price: "₹0",
              features: [
                "3,000 emails/month",
                "100 emails/day",
                "Basic analytics",
                "Domain integration",
              ],
              popular: false,
            },
            {
              name: "Pro",
              price: "₹299",
              features: [
                "18,000 emails/month",
                "600 emails/day",
                "Advanced analytics",
                "Priority support",
              ],
              popular: true,
            },
            {
              name: "Premium",
              price: "₹599",
              features: [
                "40,000 emails/month",
                "1,334 emails/day",
                "Premium analytics",
                "24/7 support",
              ],
              popular: false,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-2xl border transition-all duration-500 hover:scale-105 ${
                plan.popular
                  ? "bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/50"
                  : "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-5xl font-black mb-6">{plan.price}</div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={"/register"}>
                  <Button
                    size="lg"
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        : "bg-transparent border border-gray-700 hover:bg-white/10"
                    }`}
                  >
                    {plan.popular ? "Upgrade to Pro" : "Get Started"}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="mb-12">
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Ready to start sending?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
              Get your API key and start sending emails in minutes. Free tier
              available with generous limits to get you started.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="relative group  text-black  px-12 py-5 text-xl font-bold  hover:shadow hover:shadow-primary transition-all duration-500 "
              >
                <span className="relative z-10 flex items-center">
                  Start for Free
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="relative group border-2 border-gray-600/50 text-white hover:border-gray-500 px-12 py-5 text-xl font-bold bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-xl "
              >
                <span className="relative z-10">Read the Docs</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative border-t pt-16 pb-4 border-white/5 bg-black">
        <h1 className="text-[12rem] text-center  lg:text-[16rem] font-extrabold text-white/5 select-none">
          MAILORY
        </h1>

        <div className="  max-w-7xl    mx-auto p-6">
          <div className="flex justify-between gap-12  mb-12">
            <div className="">
              <Logo />
            </div>

            <div className=" ">
              <div className="flex gap-20">
                <div>
                  <h3 className="text-white font-semibold mb-4">Application</h3>
                  <ul className="space-y-3 text-gray-400 text-sm">
                    <li>
                      <Link
                        href="/#features"
                        className="hover:text-white transition-colors"
                      >
                        Features
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/login"
                        className="hover:text-white transition-colors"
                      >
                        Demo
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-4">Resources</h3>
                  <ul className="space-y-3 text-gray-400 text-sm">
                    <li>
                      <Link
                        href="#pricing"
                        className="hover:text-white transition-colors"
                      >
                        Pricing
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/docs"
                        className="hover:text-white transition-colors"
                      >
                        Docs
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4">Help</h3>
                  <ul className="space-y-3 text-gray-400 text-sm">
                    <li>
                      <Link
                        href="https://contact.soorajrao.in/?querytype=contact&message=I wanna talk&utm_medium=mailory_sidebar&utm_source=mailory"
                        className="hover:text-white transition-colors"
                      >
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="https://contact.soorajrao.in/?querytype=report a issue&message=i want to reporta issue in mailory.site&utm_medium=mailory_footer&utm_source=mailory"
                        className="hover:text-white transition-colors"
                      >
                        Report bug
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="py-4 ">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-500 text-sm">&copy; 2025 Mailory</p>
              <p className="text-gray-500 text-sm">
                Developed by{" "}
                <a target="_blank" href="https://soorajrao.in/?ref=mailory">
                  <span className="text-white font-medium hover:underline">
                    Sooraj Rao
                  </span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
