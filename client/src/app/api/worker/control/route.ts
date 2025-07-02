import { NextResponse } from "next/server"

const WORKER_URL = process.env.EMAIL_WORKER_URL || "http://localhost:4000"

export async function POST() {
  try {
    const response = await fetch(`${WORKER_URL}/api/v1/worker/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Worker control error:", error)
    return NextResponse.json(
      {
        error: "Failed to communicate with worker server",
        details: "Email worker server may be offline",
      },
      { status: 503 },
    )
  }
}

export async function DELETE() {
  try {
    const response = await fetch(`${WORKER_URL}/api/v1/worker/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Worker control error:", error)
    return NextResponse.json(
      {
        error: "Failed to communicate with worker server",
        details: "Email worker server may be offline",
      },
      { status: 503 },
    )
  }
}

export async function GET() {
  try {
    const response = await fetch(`${WORKER_URL}/api/v1/worker/status`)
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Worker status error:", error)
    return NextResponse.json(
      {
        error: "Failed to communicate with worker server",
        details: "Email worker server may be offline",
        status: "unknown",
      },
      { status: 503 },
    )
  }
}
