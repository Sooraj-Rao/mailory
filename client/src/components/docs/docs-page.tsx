"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Book,
  Shield,
  Clock,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/user/auth-user";
import CodeBlock from "@/lib/codeblock";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Logo } from "@/components/home/sidebar";
import { useSearchParams } from "next/navigation";

const APP_URL = "https://mailory.site";

const sidebarItems = [
  {
    title: "Getting Started",
    id: "getting-started",
    icon: Book,
  },
  {
    title: "Authentication",
    id: "authentication",
    icon: Shield,
  },
  {
    title: "Send Email API",
    id: "send-email",
    icon: Send,
  },
  {
    title: "Broadcasts API",
    id: "broadcasts",
    icon: Users,
  },
  {
    title: "Rate Limits",
    id: "rate-limits",
    icon: Clock,
  },
  {
    title: "Error Handling",
    id: "error-handling",
    icon: AlertCircle,
  },
];

export default function DocsPage() {
  const { userData } = useUser();
  const searchParam = useSearchParams();
  const [activeSection, setActiveSection] = useState("getting-started");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const isSearchParam = searchParam.get("to");
    if (isSearchParam) {
      const isValidTo = sidebarItems.find((item) => item.id == isSearchParam);
      if (isValidTo) setActiveSection(isValidTo.id);
    }
  }, []);

  return (
    <div className="min-h-screen app-gradient">
      <header className="sticky top-0 z-[999] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 ">
              <Logo />
            </div>
            <div className="flex items-center gap-2 ">
              {!userData && (
                <div className=" md:flex hidden gap-x-10 mx-4">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button  size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
              <ThemeToggle />
              <button
                className="md:hidden ml-5"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <aside
            className={`${
              isSidebarOpen ? "fixed" : "hidden"
            } md:block w-full py-3 z-[990]  bg-background top-14 md:w-64 flex-shrink-0 transition-all duration-300`}
          >
            <nav className="space-y-1 md:sticky md:top-24">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsSidebarOpen(false);
                    window.scrollTo(0, 0);
                  }}
                  className={`w-full flex items-center gap-3 border px-3 py-2 rounded-lg text-sm transition-all ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/30"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 max-w-full md:max-w-4xl">
            {activeSection === "getting-started" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-4">
                    API Documentation
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6">
                    Send transactional emails and batch campaigns with our email
                    API service.
                  </p>
                </div>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      Quick Start
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg border gap-4">
                      <div>
                        <h3 className="font-medium mb-1">
                          1. Create an API Key
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Get your API key to start sending emails
                        </p>
                      </div>
                      <Link href="/dashboard/api-keys">
                        <Button  size="sm">
                          Create API Key
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Base URL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock
                      code={`${
                        typeof window !== "undefined"
                          ? window.location.origin
                          : APP_URL
                      }`}
                      language="URL"
                      shouldCopy={true}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            {activeSection === "authentication" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-4">
                    Authentication
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    All API requests require authentication using API keys.
                  </p>
                </div>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>API Key Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Include your API key in the mailory-authorization header of every
                      request:
                    </p>

                    <CodeBlock
                      code={`mailory-authorization: Bearer YOUR_API_KEY`}
                      language="HTTP Header"
                    />

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                            Keep your API key secure
                          </h4>
                          <p className="text-sm text-yellow-600 dark:text-yellow-300">
                            Never expose your API key in client-side code or
                            public repositories. Always use it on the server
                            side.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "send-email" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-4">
                    Send Email API
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Send individual transactional emails with our API.
                  </p>
                </div>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Endpoint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-green-600">POST</Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {APP_URL}/api/emails
                      </code>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Send a single email to one recipient. Suitable for
                      transactional emails like password resets, confirmations,
                      and notifications.
                    </p>
                    <GenerateAPIKeyDialog />
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Request Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <code className="text-sm font-medium">to</code>
                          <Badge variant="destructive" className="ml-2 text-xs">
                            required
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          string
                        </div>
                        <div className="text-sm">Recipient email address</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <code className="text-sm font-medium">subject</code>
                          <Badge variant="destructive" className="ml-2 text-xs">
                            required
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          string
                        </div>
                        <div className="text-sm">Email subject line</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <code className="text-sm font-medium">from</code>
                          <Badge variant="destructive" className="ml-2 text-xs">
                            required
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          string
                        </div>
                        <div className="text-sm">Sender name</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <code className="text-sm font-medium">html</code>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            optional
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          string
                        </div>
                        <div className="text-sm">HTML content of the email</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <code className="text-sm font-medium">text</code>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            optional
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          string
                        </div>
                        <div className="text-sm">
                          Plain text content of the email
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                              Content Requirements
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-300">
                              You must provide either <code>html</code> or{" "}
                              <code>text</code> content (or both). HTML content
                              is recommended for better formatting.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Code Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="php">PHP</TabsTrigger>
                      </TabsList>

                      <TabsContent value="curl" className="mt-4">
                        <CodeBlock
                          code={`curl -X POST ${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : APP_URL
                          }/api/emails \\
  -H "Content-Type: application/json" \\
  -H "mailory-authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "to": "user@example.com",
    "subject": "Welcome to our service!",
    "html": "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
    "text": "Welcome! Thanks for signing up.",
    "from": "MyApp"
  }'`}
                          language="bash"
                          shouldCopy={true}
                        />
                      </TabsContent>

                      <TabsContent value="javascript" className="mt-4">
                        <CodeBlock
                          code={`const response = await fetch('${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : APP_URL
                          }/api/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'mailory-authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Welcome to our service!',
    html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
    text: 'Welcome! Thanks for signing up.',
    from: 'MyApp'
  })
});

const data = await response.json();
console.log(data);`}
                          language="javascript"
                          shouldCopy={true}
                        />
                      </TabsContent>

                      <TabsContent value="python" className="mt-4">
                        <CodeBlock
                          code={`import requests

url = "${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : APP_URL
                          }/api/emails"

headers = {
    "Content-Type": "application/json",
    "mailory-authorization": "Bearer YOUR_API_KEY"
}

data = {
    "to": "user@example.com",
    "subject": "Welcome to our service!",
    "html": "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
    "text": "Welcome! Thanks for signing up.",
    "from": "MyApp"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`}
                          language="python"
                          shouldCopy={true}
                        />
                      </TabsContent>

                      <TabsContent value="php" className="mt-4">
                        <CodeBlock
                          code={`<?php
$url = "${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : APP_URL
                          }/api/emails";

$data = [
    'to' => 'user@example.com',
    'subject' => 'Welcome to our service!',
    'html' => '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
    'text' => 'Welcome! Thanks for signing up.',
    'from' => 'MyApp'
];

$options = [
    'http' => [
        'header' => [
            'Content-Type: application/json',
            'mailory-authorization: Bearer YOUR_API_KEY'
        ],
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
echo $response;
?>`}
                          language="php"
                          shouldCopy={true}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Response</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h4 className="font-medium">Success Response (200)</h4>
                    <CodeBlock
                      code={`{
  "success": true,
  "messageId": "0000014a-f4d4-4f45-b8d0-123456789abc"
}`}
                      language="json"
                    />

                    <h4 className="font-medium">
                      Error Response (400/401/429/500)
                    </h4>
                    <CodeBlock
                      code={`{
  "error": "Missing required fields",
  "required": ["to", "subject", "text or html"]
}`}
                      language="json"
                    />
                    <ErrorRedirectDialog />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "broadcasts" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-4">
                    Batch Email API
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Send emails to multiple recipients in a single request.
                  </p>
                </div>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Endpoint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-green-600">POST</Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {APP_URL}/api/broadcasts
                      </code>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Send the same email to multiple recipients. Suitable for
                      marketing campaigns, newsletters, and announcements.
                      Maximum 100 recipients per batch.
                    </p>
                    <GenerateAPIKeyDialog />
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Request Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <code className="text-sm font-medium">
                            recipients
                          </code>
                          <Badge variant="destructive" className="ml-2 text-xs">
                            required
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          string[]
                        </div>
                        <div className="text-sm">
                          Array of recipient email addresses (max 100)
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <code className="text-sm font-medium">subject</code>
                          <Badge variant="destructive" className="ml-2 text-xs">
                            required
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          string
                        </div>
                        <div className="text-sm">Email subject line</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <code className="text-sm font-medium">html</code>
                          <Badge variant="destructive" className="ml-2 text-xs">
                            required
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          string
                        </div>
                        <div className="text-sm">HTML content of the email</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <code className="text-sm font-medium">text</code>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            optional
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          string
                        </div>
                        <div className="text-sm">
                          Plain text content of the email
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <code className="text-sm font-medium">from</code>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            optional
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          string
                        </div>
                        <div className="text-sm">Sender name</div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                              Batch Processing
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-300">
                              Emails are processed automatically in the
                              background. You will receive a batch ID to track
                              progress. Processing typically takes 2-4 minutes
                              for 100 emails.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Code Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="php">PHP</TabsTrigger>
                      </TabsList>

                      <TabsContent value="curl" className="mt-4">
                        <CodeBlock
                          code={`curl -X POST ${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : APP_URL
                          }/api/broadcasts \\
  -H "Content-Type: application/json" \\
  -H "mailory-authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "recipients": [
      "user1@example.com",
      "user2@example.com",
      "user3@example.com"
    ],
    "subject": "Monthly Newsletter",
    "html": "<h1>Newsletter</h1><p>Check out our latest updates!</p>",
    "text": "Newsletter: Check out our latest updates!",
    "from": "MyCompany"
  }'`}
                          language="bash"
                          shouldCopy={true}
                        />
                      </TabsContent>

                      <TabsContent value="javascript" className="mt-4">
                        <CodeBlock
                          code={`const response = await fetch('${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : APP_URL
                          }/api/broadcasts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'mailory-authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    recipients: [
      'user1@example.com',
      'user2@example.com',
      'user3@example.com'
    ],
    subject: 'Monthly Newsletter',
    html: '<h1>Newsletter</h1><p>Check out our latest updates!</p>',
    text: 'Newsletter: Check out our latest updates!',
    from: 'MyCompany'
  })
});

const data = await response.json();
console.log(data);`}
                          language="javascript"
                          shouldCopy={true}
                        />
                      </TabsContent>

                      <TabsContent value="python" className="mt-4">
                        <CodeBlock
                          code={`import requests

url = "${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : APP_URL
                          }/api/broadcasts"

headers = {
    "Content-Type": "application/json",
    "mailory-authorization": "Bearer YOUR_API_KEY"
}

data = {
    "recipients": [
        "user1@example.com",
        "user2@example.com",
        "user3@example.com"
    ],
    "subject": "Monthly Newsletter",
    "html": "<h1>Newsletter</h1><p>Check out our latest updates!</p>",
    "text": "Newsletter: Check out our latest updates!",
    "from": "MyCompany"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`}
                          language="python"
                          shouldCopy={true}
                        />
                      </TabsContent>

                      <TabsContent value="php" className="mt-4">
                        <CodeBlock
                          code={`<?php
$url = "${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : APP_URL
                          }/api/broadcasts";

$data = [
    'recipients' => [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com'
    ],
    'subject' => 'Monthly Newsletter',
    'html' => '<h1>Newsletter</h1><p>Check out our latest updates!</p>',
    'text' => 'Newsletter: Check out our latest updates!',
    'from' => 'MyCompany'
];

$options = [
    'http' => [
        'header' => [
            'Content-Type: application/json',
            'mailory-authorization: Bearer YOUR_API_KEY'
        ],
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
echo $response;
?>`}
                          language="php"
                          shouldCopy={true}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Response</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h4 className="font-medium">Success Response (200)</h4>
                    <CodeBlock
                      code={`{
  "success": true,
  "batchId": "abc123def456",
  "totalEmails": 3,
  "message": "Batch emails queued for processing",
  "processingStarted": true
}`}
                      language="json"
                    />

                    <h4 className="font-medium">
                      Error Response (400/401/429/500)
                    </h4>
                    <CodeBlock
                      code={`{
  "error": "Maximum 100 recipients allowed per batch"
}`}
                      language="json"
                    />
                    <ErrorRedirectDialog />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "rate-limits" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-4">
                    Rate Limits
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Understand the limits and quotas for our email APIs.
                  </p>
                </div>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Rate Limit Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">Reset Schedule</h4>
                          <p className="text-sm text-muted-foreground">
                            Rate limits reset daily at midnight UTC. Your quota
                            is fully restored every 24 hours.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">
                            Combined Daily Limit
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Both APIs share the same daily limit. For example,
                            if you send 50 individual emails, you can still send
                            a batch of 50 recipients.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Rate Limit Exceeded</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      When you exceed your daily limit, you will receive a 429
                      status code:
                    </p>
                    <CodeBlock
                      code={`HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Rate limit exceeded",
  "message": "You have sent 100/100 emails today. Limit resets at midnight UTC."
}`}
                      language="HTTP Response"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "error-handling" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-4">
                    Error Handling
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Understand and handle API errors effectively.
                  </p>
                </div>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>HTTP Status Codes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div>
                          <Badge className="bg-green-600">200</Badge>
                        </div>
                        <div className="font-medium">Success</div>
                        <div className="text-sm text-muted-foreground">
                          Request completed successfully
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div>
                          <Badge variant="destructive">400</Badge>
                        </div>
                        <div className="font-medium">Bad Request</div>
                        <div className="text-sm text-muted-foreground">
                          Invalid request parameters
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div>
                          <Badge variant="destructive">401</Badge>
                        </div>
                        <div className="font-medium">Unauthorized</div>
                        <div className="text-sm text-muted-foreground">
                          Invalid or missing API key
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div>
                          <Badge className="bg-yellow-600">429</Badge>
                        </div>
                        <div className="font-medium">Rate Limited</div>
                        <div className="text-sm text-muted-foreground">
                          Daily email limit exceeded
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div>
                          <Badge variant="destructive">500</Badge>
                        </div>
                        <div className="font-medium">Server Error</div>
                        <div className="text-sm text-muted-foreground">
                          Internal server error
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Common Error Responses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">
                        Missing Required Fields (400)
                      </h4>
                      <CodeBlock
                        code={`{
  "error": "Missing required fields",
  "required": ["to", "subject", "text or html"]
}`}
                        language="json"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        Invalid Email Format (400)
                      </h4>
                      <CodeBlock
                        code={`{
  "error": "Invalid email format: invalid-email"
}`}
                        language="json"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        Invalid API Key (401)
                      </h4>
                      <CodeBlock
                        code={`{
  "error": "Invalid or missing mailory-authorization header. Use 'Bearer {api_key}'"
}`}
                        language="json"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        Rate Limit Exceeded (429)
                      </h4>
                      <CodeBlock
                        code={`{
  "error": "Rate limit exceeded",
  "message": "You have sent 100/100 emails today. Limit resets at midnight UTC."
}`}
                        language="json"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        Batch Size Exceeded (400)
                      </h4>
                      <CodeBlock
                        code={`{
  "error": "Maximum 100 recipients allowed per batch"
}`}
                        language="json"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Error Handling Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">
                            Always Check Status Codes
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Check the HTTP status code before processing the
                            response. A 200 status indicates success.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">
                            Implement Retry Logic
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            For 5xx errors, implement exponential backoff retry
                            logic. For 429 errors, wait until the rate limit
                            resets.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">
                            Log Error Details
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Log both the status code and error message for
                            debugging. Include the request ID if available.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-1">
                            Validate Before Sending
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Validate email addresses and required fields on your
                            end before making API calls to reduce errors.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle>Example Error Handling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="javascript" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="php">PHP</TabsTrigger>
                      </TabsList>

                      <TabsContent value="javascript" className="mt-4">
                        <CodeBlock
                          code={`async function sendEmail(emailData) {
  try {
    const response = await fetch('/api/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'mailory-authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify(emailData)
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle different error types
      switch (response.status) {
        case 400:
          console.error('Bad request:', data.error);
          break;
        case 401:
          console.error('Authentication failed:', data.error);
          break;
        case 429:
          console.error('Rate limit exceeded:', data.message);
          break;
        case 500:
          console.error('Server error:', data.error);
          break;
        default:
          console.error('Unexpected error:', data.error);
      }
      throw new Error(data.error);
    }

    console.log('Email sent successfully:', data.messageId);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    throw error;
  }
}`}
                          language="javascript"
                          shouldCopy={true}
                        />
                      </TabsContent>

                      <TabsContent value="python" className="mt-4">
                        <CodeBlock
                          code={`import requests
import time

def send_email(email_data, max_retries=3):
    url = "/api/emails"
    headers = {
        "Content-Type": "application/json",
        "mailory-authorization": "Bearer YOUR_API_KEY"
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=email_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                print(f"Email sent successfully: {data['messageId']}")
                return data
            elif response.status_code == 400:
                print(f"Bad request: {response.json()['error']}")
                break  # Don't retry for client errors
            elif response.status_code == 401:
                print(f"Authentication failed: {response.json()['error']}")
                break  # Don't retry for auth errors
            elif response.status_code == 429:
                print(f"Rate limit exceeded: {response.json()['message']}")
                break  # Don't retry for rate limits
            elif response.status_code >= 500:
                print(f"Server error (attempt {attempt + 1}): {response.json()['error']}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
            else:
                print(f"Unexpected error: {response.json()['error']}")
                break
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            
    raise Exception("Failed to send email after all retries")`}
                          language="python"
                          shouldCopy={true}
                        />
                      </TabsContent>

                      <TabsContent value="php" className="mt-4">
                        <CodeBlock
                          code={`<?php

function send_email($email_data, $max_retries = 3) {
    $url = "/api/emails";
    $headers = [
        "Content-Type: application/json",
        "mailory-authorization: Bearer YOUR_API_KEY"
    ];

    for ($attempt = 1; $attempt <= $max_retries; $attempt++) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($email_data));

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code == 200) {
            $data = json_decode($response, true);
            echo "Email sent successfully: " . $data['messageId'] . "\n";
            return $data;
        } elseif ($http_code == 400) {
            $data = json_decode($response, true);
            echo "Bad request: " . $data['error'] . "\n";
            break; // Don't retry for client errors
        } elseif ($http_code == 401) {
            $data = json_decode($response, true);
            echo "Authentication failed: " . $data['error'] . "\n";
            break; // Don't retry for auth errors
        } elseif ($http_code == 429) {
            $data = json_decode($response, true);
            echo "Rate limit exceeded: " . $data['message'] . "\n";
            break; // Don't retry for rate limits
        } elseif ($http_code >= 500) {
            $data = json_decode($response, true);
            echo "Server error (attempt $attempt): " . $data['error'] . "\n";
            if ($attempt < $max_retries) {
                sleep(pow(2, $attempt - 1));  // Exponential backoff
                continue;
            }
        } else {
            $data = json_decode($response, true);
            echo "Unexpected error: " . $data['error'] . "\n";
            break;
        }
    }

    throw new Exception("Failed to send email after all retries");
}

// Example usage
$email_data = ['to' => 'example@example.com', 'subject' => 'Test', 'body' => 'Hello'];
send_email($email_data);
?>`}
                          language="php"
                          shouldCopy={true}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const GenerateAPIKeyDialog = () => (
  <div className="bg-yellow-500/10 border mt-4 border-yellow-500/20 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-yellow-500 " />
      <p className="text-sm text-yellow-600 dark:text-yellow-300">
        You must have an API key to use the service. Generate one if you
        don&apos;t already have it
        <Link
          className="ml-1 underline text-primary"
          href={"/dashboard/api-keys"}
        >
          here.
        </Link>
      </p>
    </div>
  </div>
);

const ErrorRedirectDialog = () => (
  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
      <div>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          More details on all types of errors and how to handle them can be
          found
          <Link
            className=" ml-1 text-foreground underline"
            href={"/docs/?to=error-handling"}
          >
            here
          </Link>
          .
        </p>
      </div>
    </div>
  </div>
);
