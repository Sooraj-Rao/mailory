"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomSidebar } from "@/components/home/sidebar";
import { useUser } from "@/hooks/user/auth-user";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { userData, userDataLoading } = useUser();

  useEffect(() => {
    if (!userData && !userDataLoading) {
      router.push("/login");
      return;
    }
  }, [userData]);

  if (!router) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CustomSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-y-scroll">{children}</div>
    </div>
  );
}
