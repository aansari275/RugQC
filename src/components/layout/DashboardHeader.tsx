"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getGreeting } from "@/lib/utils";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  showSearch = false,
  actions,
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Title or greeting */}
        <div>
          {title ? (
            <>
              <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-zinc-500">{subtitle}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-500">{greeting}</p>
              <h1 className="text-xl font-semibold text-zinc-900">
                Welcome back, {firstName}
              </h1>
            </>
          )}
        </div>

        {/* Right side - Search, notifications, actions */}
        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search inspections..."
                className="w-64 pl-9"
              />
            </div>
          )}

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {actions}
        </div>
      </div>
    </header>
  );
}
