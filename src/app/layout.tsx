import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Email Service",
  description: "Centralized email sending service with AWS SES",
}

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
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
