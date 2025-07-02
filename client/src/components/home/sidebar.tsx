/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Send,
  Users,
  Key,
  FileText,
  Calendar,
  LayoutTemplateIcon as Template,
  Settings,
  LogOut,
  ChevronUp,
  Zap,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "../theme/theme-toggle";
import Link from "next/link";
import { useZustandStore } from "@/zustand/store";

const menuItems = [
  {
    title: "Overview",
    url: "/dashboard/overview",
    icon: BarChart3,
  },
  {
    title: "Send Email API",
    url: "/dashboard/send-email",
    icon: Send,
    // Removed specific daily limit badge
  },
  {
    title: "Batch Email",
    url: "/dashboard/batch-email",
    icon: Users,
    // Removed specific daily limit badge
  },
];

const futureItems = [
  {
    title: "Email Templates",
    url: "/templates",
    icon: Template,
    badge: "Soon",
  },
  {
    title: "Scheduling",
    url: "/scheduling",
    icon: Calendar,
    badge: "Soon",
  },
];

const settingsItems = [
  {
    title: "API Keys",
    url: "/dashboard/api-keys",
    icon: Key,
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: CreditCard,
    // badge: "Soon",
  },
  {
    title: "Documentation",
    url: "/docs",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

interface CustomSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function CustomSidebar({ isOpen, onToggle }: CustomSidebarProps) {
  const { userData } = useZustandStore();
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch {
      console.error("Logout failed");
    }
  };

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-background/95 to-muted/95 backdrop-blur-xl border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:z-auto`}
      >
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  SendMailr
                </h2>
                <p className="text-xs text-muted-foreground">
                  Email Service Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={onToggle}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-2 py-4">
          {/* Main Services */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
              Services
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                    isActive(item.url)
                      ? "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-foreground shadow-lg shadow-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1">{item.title}</span>
                  {/* {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )} */}
                </Link>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
              Coming Soon
            </h3>
            <div className="space-y-1">
              {futureItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground cursor-not-allowed"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
              Settings
            </h3>
            <div className="space-y-1">
              {settingsItems.map((item) => (
                <div key={item.title}>
                  <Link
                    href={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                      isActive(item.url)
                        ? "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-foreground shadow-lg shadow-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3 hover:bg-accent"
              >
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm">
                    {userData?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate text-foreground">
                    {userData?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userData?.email || "user@example.com"}
                  </p>
                </div>
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="w-56 bg-popover border-border"
            >
              <DropdownMenuItem className="text-muted-foreground hover:text-foreground hover:bg-accent">
                <Zap className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground hover:text-foreground hover:bg-accent">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}

export function SidebarTrigger({ onToggle }: { onToggle?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="md:hidden text-foreground hover:bg-accent"
    >
      <Menu className="w-4 h-4" />
    </Button>
  );
}
