"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (router) {
      router.push("/dashboard/overview");
    }
  }, [router]);

  return (
    <div className="min-h-screen  w-screen flex items-center justify-center ">
      <div className="text-white">Loading...</div>
    </div>
  );
}
