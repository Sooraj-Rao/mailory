import { NextResponse } from "next/server"

const WORKER_URL = process.env.EMAIL_WORKER_URL || "http://localhost:4000"

export async function POST() {
  try {
    const response = await fetch(`${WORKER_URL}/api/v1/worker/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Auto-process worker error:", error)
    return NextResponse.json(
      {
        error: "Failed to communicate with worker server",
        details: "Email worker server may be offline",
        processed: 0,
        hasMore: false,
      },
      { status: 503 },
    )
  }
}

export async function GET() {
  try {
    const response = await fetch(`${WORKER_URL}/api/v1/stats/overview`)
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Transform the response to match the expected format
    return NextResponse.json({
      stats: data.emails,
      timestamp: data.timestamp,
    })
  } catch (error) {
    console.error("Worker stats error:", error)
    return NextResponse.json(
      {
        error: "Failed to get stats from worker server",
        details: "Email worker server may be offline",
      },
      { status: 503 },
    )
  }
}
