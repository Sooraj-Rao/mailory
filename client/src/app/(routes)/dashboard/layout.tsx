"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomSidebar } from "@/components/home/sidebar";
import { useUser } from "@/hooks/user/auth-user";
import DashboardHeader from "@/components/home/dashboard-header";

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
  }, [userData, userDataLoading, router]);

  // if (!userData && userDataLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-foreground">Loading...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      <CustomSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="md:ml-64">
        <DashboardHeader onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
