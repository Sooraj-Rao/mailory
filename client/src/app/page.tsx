"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/user/auth-user";
import LandingPage from "@/components/home/landing";

export default function HomePage() {
  const router = useRouter();
  const { userData } = useUser();

  useEffect(() => {
    if (userData) {
      router.push("/dashboard/emails");
      return;
    }
  }, [userData, router]);

  if (userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingPage />
    </div>
  );
}
