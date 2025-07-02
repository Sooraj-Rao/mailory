import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (!["start", "stop", "status"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const workerUrl = process.env.EMAIL_WORKER_URL || "http://localhost:4000";

    let endpoint = "";
    let method = "GET";

    switch (action) {
      case "start":
        endpoint = "/api/v1/worker/start";
        method = "POST";
        break;
      case "stop":
        endpoint = "/api/v1/worker/stop";
        method = "POST";
        break;
      case "status":
        endpoint = "/api/v1/worker/status";
        method = "GET";
        break;
    }

    const response = await fetch(`${workerUrl}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || "Worker operation failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Worker control error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with worker server" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const workerUrl = process.env.EMAIL_WORKER_URL || "http://localhost:4000";
    const response = await fetch(`${workerUrl}/api/v1/worker/status`);

    if (!response.ok) {
      throw new Error("Failed to get worker status");
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Worker status error:", error);
    return NextResponse.json(
      { error: "Failed to get worker status" },
      { status: 500 }
    );
  }
}
