let workerInterval: NodeJS.Timeout | null = null;

export function startEmailWorker() {
  if (workerInterval) return;

  console.log("Starting email worker...");

  workerInterval = setInterval(async () => {
    try {
      await fetch(
        `${
          process.env.APP_URL || "http://localhost:3000"
        }/api/worker/process-emails`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error("Worker error:", error);
    }
  }, 10000);
  // 10sec
}

export function stopEmailWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log("Email worker stopped");
  }
}
