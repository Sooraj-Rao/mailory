"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Code, Globe, ArrowRight, Copy, Check, Send } from "lucide-react";
import Link from "next/link";
import CodeBlock from "@/lib/codeblock";
import { Logo } from "./sidebar";

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
  javascript: `const response = await fetch('https://mailory.site/api/emails', {
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
String json = """{
  "from": "Mailory <app@mailory.site>",
  "to": "user@example.com", 
  "subject": "Welcome to our platform",
  "html": "<h1>Welcome!</h1><p>Thanks for joining us.</p>"
}""";

HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create("https://mailory.site/api/emails"))
  .header("mailory-authorization", "Bearer API_KEY")
  .header("Content-Type", "application/json")
  .POST(HttpRequest.BodyPublishers.ofString(json))
  .build();`,
};

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 },
};

const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const useTorchCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const updateMousePosition = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return {
    mousePosition,
    isHovering,
    setIsHovering,
    updateMousePosition,
  };
};

export default function LandingPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [copied, setCopied] = useState(false);

  const { mousePosition, isHovering, setIsHovering, updateMousePosition } =
    useTorchCursor();

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
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <motion.nav
        className="relative z-50 border-b border-white/5 backdrop-blur-2xl bg-black/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Logo />
            </motion.div>
            <motion.div
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/docs"
                className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <Button variant="link" size="lg">
                  Documentation
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg">
                  <span className="relative z-10">Get Started</span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div className="space-y-6" variants={staggerItem}>
              <motion.div
                className="md:text-8xl sm:text-6xl text-3xl font-black leading-none tracking-tight"
                variants={fadeInUp}
              >
                <motion.div
                  className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Simple Email
                </motion.div>
                <motion.div
                  className="flex items-center gap-4 mt-2"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <span className="text-gray-400">for</span>
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-500">
                    Developers
                  </span>
                </motion.div>
              </motion.div>
              <motion.p
                className="md:text-xl text-sm text-wrap text-gray-300 leading-relaxed max-w-lg"
                variants={fadeInUp}
                transition={{ delay: 0.6 }}
              >
                Send transactional and broadcast emails easily, with support for
                custom domains to maintain your brand.
              </motion.p>
            </motion.div>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={staggerItem}
              transition={{ delay: 0.8 }}
            >
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="scale-90 sm:scale-100 text-sm sm:text-lg px-8 py-6 hover:shadow-blue-500/25 transition-all duration-300 group"
                  >
                    Start Building
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/docs">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-600 text-sm sm:text-lg scale-90 sm:scale-100 px-8 py-6 bg-black/50 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                  >
                    <Code className="mr-2 hidden h-5 w-5" />
                    Documentation
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative flex flex-col items-center gap-10 h-96 lg:h-[600px] perspective-1000"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div
              className="sm:absolute w-72 h-44 top-[10%] left-20 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl cursor-pointer"
              variants={slideInLeft}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 },
              }}
              animate={{
                y: [0, -10, 0],
                transition: {
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
              }}
            >
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Email Sent
                    </div>
                    <div className="text-xs text-gray-400">hi@soorajrao.in</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "50%" }}
                    transition={{ duration: 2, delay: 1 }}
                  />
                  <div className="h-2 bg-gray-700 w-[85%] rounded-full" />
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(Date.now()).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="sm:absolute w-80 h-48 top-[50%] right-0 backdrop-blur-sm rounded-xl border border-blue-500/30 shadow-2xl font-mono text-xs overflow-hidden cursor-pointer"
              variants={slideInRight}
              whileHover={{
                scale: 1.05,
                rotateY: -5,
                transition: { duration: 0.3 },
              }}
              animate={{
                y: [0, 10, 0],
                transition: {
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1,
                },
              }}
            >
              <div className="p-4 space-y-1">
                <motion.div
                  className="text-blue-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  POST /api/emails
                </motion.div>
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
                  {'"html"'}: {'"<h1>Hello there!</h1>"'}
                </div>
                <div className="text-gray-500">{"}"}</div>
                <motion.div
                  className="mt-4 text-green-400"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 }}
                >
                  ✓ Email sent successfully
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <motion.section
        className="relative py-32"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div className="text-center mb-20" variants={staggerItem}>
            <motion.h2
              className="text-3xl md:text-7xl font-black mb-8"
              variants={fadeInUp}
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Integrate{" "}
              </span>
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                in 5 minutes
              </span>
            </motion.h2>
            <motion.p
              className="sm:text-xl text-sm md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Simple REST API for sending transactional emails and broadcast
              campaigns. Get your API key and start sending emails.
            </motion.p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            variants={fadeIn}
          >
            {languages.map((lang, index) => (
              <motion.button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`relative group flex items-center space-x-3 text-sm px-4 py-2 rounded-2xl border transition-all duration-500 ${
                  selectedLanguage === lang.id
                    ? "bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/80 text-white shadow-2xl shadow-gray-900/50 backdrop-blur-xl"
                    : "bg-gradient-to-r from-gray-900/40 to-gray-800/40 border-gray-700/40 text-gray-400 hover:text-white hover:border-gray-600/60 backdrop-blur-xl"
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                custom={index}
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${lang.color} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {lang.icon}
                </div>
                <span className="font-semibold">{lang.name}</span>
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            className="max-w-5xl mx-auto"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <Card className="relative bg-black shadow backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between px-8 py-2 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 border-gray-600/50 shadow-lg">
                      {languages.find((l) => l.id === selectedLanguage)?.name}
                    </Badge>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyToClipboard}
                      className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                    >
                      <motion.div
                        animate={copied ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
                <CardContent className="p-0">
                  <motion.div
                    key={selectedLanguage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CodeBlock
                      language={selectedLanguage}
                      code={
                        codeExamples[
                          selectedLanguage as keyof typeof codeExamples
                        ]
                      }
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="features"
        className="relative py-32"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div className="text-center mb-24" variants={staggerItem}>
            <motion.h2
              className="text-3xl md:text-7xl font-black mb-8"
              variants={fadeInUp}
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Core{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Features
              </span>
            </motion.h2>
            <motion.p
              className="text-sm md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Everything you need to send emails. From transactional emails to
              broadcast campaigns, with custom domains and flexible billing.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-2 gap-12 mb-20"
            variants={staggerContainer}
          >
            <motion.div
              className="relative group"
              variants={slideInLeft}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="relative shadow-2xl backdrop-blur-xl overflow-hidden">
                <CardContent className="p-10">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="relative">
                      <motion.div
                        className="w-12 h-12 sm:w-16 sm:h-16 custom-gradient5 rounded-2xl flex items-center justify-center flex-shrink-0"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Send className="w-6 h-6 sm:w-8 sm:h-8" />
                      </motion.div>
                    </div>
                    <h3 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Email Sending
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-8 leading-relaxed sm:text-lg text-sm">
                    Send transactional emails like password resets,
                    confirmations, and user notifications using a
                    straightforward API.
                  </p>
                  <motion.div
                    className="space-y-4 text-sm sm:text-base"
                    variants={staggerContainer}
                  >
                    {[
                      "Transactional Email API",
                      "Broadcast Campaigns (UI & API)",
                      "Batch Processing (up to 100 emails)",
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3"
                        variants={staggerItem}
                        custom={index}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            index === 0
                              ? "bg-blue-400"
                              : index === 1
                              ? "bg-purple-400"
                              : "bg-pink-400"
                          }`}
                        />
                        <span className="text-gray-300">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="relative group"
              variants={slideInRight}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="relative shadow-2xl backdrop-blur-xl overflow-hidden">
                <CardContent className="p-10">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="relative">
                      <motion.div
                        className="w-12 h-12 sm:w-16 sm:h-16 custom-gradient5 rounded-2xl flex items-center justify-center flex-shrink-0"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Globe className="w-6 h-6 sm:w-8 sm:h-8" />
                      </motion.div>
                    </div>
                    <h3 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Custom Domains
                    </h3>
                  </div>
                  <p className="text-gray-400 mb-8 leading-relaxed sm:text-lg text-sm">
                    Use your own domain to send emails, with support for DKIM
                    and domain verification to maintain brand identity and
                    improve deliverability.
                  </p>
                  <motion.div
                    className="space-y-4 text-sm sm:text-base"
                    variants={staggerContainer}
                  >
                    {[
                      "Domain Verification",
                      "DKIM Configuration",
                      "Brand Email Sending",
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3"
                        variants={staggerItem}
                        custom={index}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            index === 0
                              ? "bg-green-400"
                              : index === 1
                              ? "bg-blue-400"
                              : "bg-purple-400"
                          }`}
                        />
                        <span className="text-gray-300">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="pricing"
        className="relative z-10 max-w-7xl mx-auto px-6 py-32"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div className="text-center mb-16" variants={staggerItem}>
          <motion.h2
            className="text-3xl sm:text-6xl font-black mb-4"
            variants={fadeInUp}
          >
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Simple
            </span>{" "}
            pricing
          </motion.h2>
          <motion.p
            className="sm:text-xl text-sm text-gray-300"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            Start free, scale as you grow
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-5xl text-sm sm:text-base mx-auto"
          variants={staggerContainer}
        >
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
              price: "₹599",
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
              price: "₹1199",
              features: [
                "40,000 emails/month",
                "1,334 emails/day",
                "Premium analytics",
                "24/7 support",
              ],
              popular: false,
            },
          ].map((plan, i) => (
            <motion.div
              key={i}
              className={`relative p-8 rounded-2xl border transition-all duration-500 ${
                plan.popular
                  ? "bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/50"
                  : "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800"
              }`}
              custom={i}
            >
              <div className="text-center">
                <h3 className="sm:text-2xl text-lg font-bold mb-2">
                  {plan.name}
                </h3>
                <motion.div
                  className="sm:text-5xl text-2xl font-black mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                >
                  {plan.price}
                </motion.div>
                <motion.ul
                  className="space-y-4 mb-8"
                  variants={staggerContainer}
                >
                  {plan.features.map((feature, j) => (
                    <motion.li
                      key={j}
                      className="flex items-center gap-3"
                      variants={staggerItem}
                      custom={j}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
                      <span className="text-gray-300">{feature}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <Link href={"/login"}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
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
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-center my-7"
          variants={fadeInUp}
          transition={{ delay: 0.8 }}
        >
          To customize your plan, please
          <a
            target="_blank"
            href="https://contact.soorajrao.in/?querytype=contact&message=I want to customize plan for mailory&utm_medium=mailory_pricing&utm_source=mailory"
            className="text-primary hover:underline ml-1"
            rel="noreferrer"
          >
            reach out to us
          </a>
        </motion.p>
      </motion.section>

      <motion.section
        className="relative py-32 overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div className="mb-12" variants={staggerItem}>
            <motion.h2
              className="text-3xl md:text-7xl font-black mb-8"
              variants={fadeInUp}
            >
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Ready to start sending?
              </span>
            </motion.h2>
            <motion.p
              className="text-sm sm:text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed font-light"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Get your API key and start sending emails in minutes. Free tier
              available with generous limits to get you started.
            </motion.p>
          </motion.div>
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            variants={staggerItem}
            transition={{ delay: 0.4 }}
          >
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="relative group scale-75 sm:scale-100 px-12 py-5 text-xl font-bold hover:shadow hover:shadow-primary transition-all duration-500"
                >
                  <span className="relative z-10 flex items-center">
                    Start for Free
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <motion.footer
        className="relative border-t pt-20 pb-4 border-white/5 bg-black"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div
          className="relative md:text-[12rem] hidden md:block text-center lg:text-[16rem] font-extrabold select-none overflow-hidden"
          variants={fadeIn}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={updateMousePosition}
          style={{ cursor: isHovering ? "none" : "default" }}
        >
          <h1 className="text-white/5">MAILORY</h1>

          <motion.h1
            className="absolute inset-0 text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text font-extrabold"
            style={{
              maskImage: isHovering
                ? `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)`
                : "none",
              WebkitMaskImage: isHovering
                ? `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)`
                : "none",
            }}
            animate={{
              opacity: isHovering ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            MAILORY
          </motion.h1>

          {isHovering && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                left: mousePosition.x - 75,
                top: mousePosition.y - 75,
                width: 150,
                height: 150,
                background:
                  "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(34, 197, 94, 0.2) 30%, rgba(168, 85, 247, 0.1) 60%, transparent 100%)",
                borderRadius: "50%",
                filter: "blur(20px)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          )}

          {isHovering && (
            <motion.div
              className="fixed pointer-events-none z-50"
              style={{
                left: mousePosition.x - 10,
                top: mousePosition.y - 10,
                width: 20,
                height: 20,
                background:
                  "radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(34, 197, 94, 0.6) 50%, transparent 100%)",
                borderRadius: "50%",
                filter: "blur(2px)",
              }}
              animate={{
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.div>
        <div className="max-w-7xl mx-auto p-6">
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between gap-12 mb-12"
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem}>
              <Logo />
            </motion.div>
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-20"
              variants={staggerContainer}
            >
              {[
                {
                  title: "Application",
                  links: [
                    { name: "Features", href: "#features" },
                    { name: "Demo", href: "/login" },
                  ],
                },
                {
                  title: "Resources",
                  links: [
                    { name: "Pricing", href: "#pricing" },
                    { name: "Docs", href: "/docs" },
                  ],
                },
                {
                  title: "Help",
                  links: [
                    {
                      name: "Contact",
                      href: "https://contact.soorajrao.in/?querytype=contact&message=I wanna talk&utm_medium=mailory_sidebar&utm_source=mailory",
                    },
                    {
                      name: "Report bug",
                      href: "https://contact.soorajrao.in/?querytype=report a issue&message=i want to reporta issue in mailory.site&utm_medium=mailory_footer&utm_source=mailory",
                    },
                  ],
                },
              ].map((section, index) => (
                <motion.div key={index} variants={staggerItem} custom={index}>
                  <h3 className="text-white font-semibold mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-3 text-gray-400 text-sm">
                    {section.links.map((link, linkIndex) => (
                      <motion.li
                        key={linkIndex}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          href={link.href}
                          className="hover:text-white transition-colors"
                        >
                          {link.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div className="py-4" variants={staggerItem}>
            <div className="flex justify-center space-y-4 md:space-y-0">
              <p className="text-gray-500 text-sm">
                Developed by{" "}
                <a
                  target="_blank"
                  href="https://soorajrao.in/?ref=mailory"
                  rel="noreferrer"
                >
                  <span className="text-white font-medium hover:underline">
                    Sooraj Rao
                  </span>
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
