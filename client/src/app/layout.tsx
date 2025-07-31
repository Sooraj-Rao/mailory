import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mailory - Reliable Email API Service",
  description:
    "The simple email API for developers, startups, and enterprises. Send transactional emails and campaigns with confidence.",
  keywords: [
    "email API",
    "transactional email",
    "email service",
    "email campaigns",
    "developer email API",
    "email provider",
    "Mailory",
  ],
  authors: [{ name: "Sooraj Rao", url: "https://soorajrao.in" }],
  openGraph: {
    title: "Mailory - Simple Email for Developers",
    description:
      "The simple email API for developers, startups, and enterprises. Send transactional emails and campaigns with confidence.",
    url: "https://mailory.site",
    siteName: "Mailory",
    images: [
      {
        url: "https://mailory.site/home.png",
        width: 1200,
        height: 630,
        alt: "Mailory Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mailory - Simple Email for Developers",
    description:
      "The simple email API for developers, startups, and enterprises. Send transactional emails and campaigns with confidence.",
    site: "@soorajraoo",
    creator: "@soorajraoo",
    images: ["https://soorajrao.in/profile.webp"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  metadataBase: new URL("https://mailory.site"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
