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
  Send,
  Users,
  Key,
  Settings,
  LogOut,
  ChevronUp,
  CreditCard,
  Bug,
  SunMoon,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useZustandStore } from "@/zustand/store";
import { ThemeToggle } from "../theme/theme-toggle";

const menuItems = [
  {
    title: "Emails",
    url: "/dashboard/emails",
    icon: Send,
  },
  {
    title: "Broadcasts",
    url: "/dashboard/broadcasts",
    icon: Users,
  },
  {
    title: "Domains",
    url: "/dashboard/domains",
    icon: Globe,
  },
  {
    title: "API Keys",
    url: "/dashboard/api-keys",
    icon: Key,
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      <aside
        className={`fixed left-0 p-4 top-0 h-full w-64 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 `}
      >
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 px-4">
            <div className="flex items-center justify-start">
              <Logo />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4">
            <div className="my-6">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    onClick={onToggle}
                    key={item.title}
                    href={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border  text-sm transition-all duration-200 ${
                      isActive(item.url)
                        ? "bg-gradient-to-r from-primary/20 to-primary/10  border-primary/30 text-foreground shadow-lg shadow-primary/10"
                        : "text-muted-foreground hover:bg-accent/20 border-transparent"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-border p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 hover:bg-accent/20"
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
                <DropdownMenuItem className="text-muted-foreground hover:bg-accent/20">
                  <Bug className="w-4 h-4 mr-2" />
                  Report a Bug
                </DropdownMenuItem>
                <ThemeToggle>
                  <DropdownMenuItem className="text-muted-foreground w-full hover:bg-accent/20">
                    <SunMoon className="w-4 h-4 mr-2" />
                    Toggle theme
                  </DropdownMenuItem>
                </ThemeToggle>
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
      </aside>
    </>
  );
}

export const Logo = () => (
  <h2 className="text-2xl font-bold bg-gradient-to-r  to-blue-500 from-blue-950/90  via-blue-800 bg-clip-text text-transparent select-none">
    Mailory
  </h2>
);
