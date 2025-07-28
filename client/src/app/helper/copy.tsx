"use client";

import { toast } from "sonner";

export const copyToClipboard = async (
  text: string,
  title?: string,
  showToast: boolean = true
) => {
  if (!navigator.clipboard) {
    console.error("Clipboard API is not supported in this browser.");
    if (showToast) return toast("Failed to copy. Try again later");
  }

  try {
    await navigator.clipboard.writeText(text);
    if (showToast) return toast(`${title ? title : ""} Copied to clipboard!`);
  } catch {
    if (showToast) return toast("Failed to copy text to clipboard");
  }
};
