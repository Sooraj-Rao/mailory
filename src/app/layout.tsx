import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EmailFlow - Reliable Email API Service",
  description:
    "The most reliable email API for developers, startups, and enterprises. Send transactional emails and campaigns with confidence.",
};

if (typeof window === "undefined") {
  import("@/lib/background-worker").then((module) => {
    const BackgroundWorker = module.default
    const worker = BackgroundWorker.getInstance()

    setTimeout(() => {
      if (!worker.isRunning()) {
        worker.start()
        console.log("🚀 Auto-started background email worker")
      }
    }, 2000)
  })
}


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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
