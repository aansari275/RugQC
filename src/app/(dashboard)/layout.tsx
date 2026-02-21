"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  FileText,
  Settings,
  ClipboardCheck,
  Building2,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FullPageSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// ==========================================
// Navigation items
// ==========================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  mobileIcon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/owner",
    icon: <LayoutDashboard className="h-5 w-5" />,
    mobileIcon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Inspections",
    href: "/owner/inspections",
    icon: <ClipboardList className="h-5 w-5" />,
    mobileIcon: <ClipboardList className="h-5 w-5" />,
  },
  {
    label: "Team",
    href: "/owner/team",
    icon: <Users className="h-5 w-5" />,
    mobileIcon: <Users className="h-5 w-5" />,
  },
  {
    label: "Analytics",
    href: "/owner/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    mobileIcon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: "Reports",
    href: "/owner/reports",
    icon: <FileText className="h-5 w-5" />,
    mobileIcon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/owner/settings",
    icon: <Settings className="h-5 w-5" />,
    mobileIcon: <Settings className="h-5 w-5" />,
  },
];

// Show only 5 items in mobile bottom bar (hide analytics)
const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) =>
  ["/owner", "/owner/inspections", "/owner/team", "/owner/reports", "/owner/settings"].includes(item.href)
);

// ==========================================
// Sidebar Component
// ==========================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, organization, signOut } = useAuth();

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const isActive = (href: string) => {
    if (href === "/owner") return pathname === "/owner";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-white border-r border-zinc-200 shadow-xl transition-transform duration-300 ease-in-out",
          "md:translate-x-0 md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo + close */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-zinc-100 px-5">
          <Link
            href="/owner"
            className="flex items-center gap-2.5"
            onClick={onClose}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md">
              <ClipboardCheck className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-zinc-900">RugQC</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden h-8 w-8 text-zinc-500 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Organisation info */}
        <div className="flex-shrink-0 border-b border-zinc-100 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-800">
                {organization?.name || "Your Organisation"}
              </p>
              <p className="text-xs text-zinc-400 capitalize">
                {organization?.tier || "free"} plan
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-200/50"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    )}
                  >
                    <span className={cn("flex-shrink-0", active ? "text-white" : "text-zinc-500")}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {active && (
                      <ChevronRight className="h-3.5 w-3.5 text-white/70" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="flex-shrink-0 border-t border-zinc-100 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user?.photoUrl || undefined} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-800">
                    {user?.name || "User"}
                  </p>
                  <p className="truncate text-xs text-zinc-400">
                    {user?.email || ""}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold text-zinc-900">{user?.name || "User"}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/owner/settings" onClick={onClose} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}

// ==========================================
// Mobile Bottom Bar
// ==========================================

function MobileBottomBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/owner") return pathname === "/owner";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur-md safe-area-pb md:hidden">
      <ul className="flex items-stretch">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors",
                  active
                    ? "text-emerald-600"
                    : "text-zinc-400 hover:text-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-xl transition-all",
                    active
                      ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-200/50 scale-110"
                      : "text-zinc-500"
                  )}
                >
                  {item.mobileIcon}
                </span>
                <span className={active ? "text-emerald-600 font-semibold" : ""}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ==========================================
// Dashboard Layout
// ==========================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    // AuthContext will handle redirect to /login
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Desktop + mobile sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile menu button (top-left, visible on mobile only) */}
      <div className="fixed left-4 top-4 z-30 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="h-9 w-9 rounded-xl border-zinc-200 bg-white shadow-md hover:bg-zinc-50"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          "md:ml-64", // offset for sidebar on desktop
          "pb-20 md:pb-0" // padding for mobile bottom bar
        )}
      >
        {children}
      </main>

      {/* Mobile bottom navigation bar */}
      <MobileBottomBar />
    </div>
  );
}
