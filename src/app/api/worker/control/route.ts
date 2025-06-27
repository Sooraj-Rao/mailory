import { NextResponse } from "next/server";
import BackgroundWorker from "@/lib/background-worker";

export async function POST() {
  try {
    const worker = BackgroundWorker.getInstance();

    if (!worker.isRunning()) {
      worker.start();
      return NextResponse.json({
        success: true,
        message: "Background worker started",
        status: "running",
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Background worker already running",
        status: "running",
      });
    }
  } catch (error) {
    console.error("Worker control error:", error);
    return NextResponse.json(
      {
        error: "Failed to start worker",
        details: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const worker = BackgroundWorker.getInstance();
    worker.stop();

    return NextResponse.json({
      success: true,
      message: "Background worker stopped",
      status: "stopped",
    });
  } catch (error) {
    console.error("Worker control error:", error);
    return NextResponse.json(
      {
        error: "Failed to stop worker",
        details: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const worker = BackgroundWorker.getInstance();

    return NextResponse.json({
      status: worker.isRunning() ? "running" : "stopped",
      message: worker.isRunning()
        ? "Background worker is running"
        : "Background worker is stopped",
    });
  } catch (error) {
    console.error("Worker status error:", error);
    return NextResponse.json(
      {
        error: "Failed to get worker status",
        details: "Internal server error",
      },
      { status: 500 }
    );
  }
}
