"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, FileText, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/inspector",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Drafts",
    href: "/inspector/drafts",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "New",
    href: "/inspector/new",
    icon: <PlusCircle className="h-6 w-6" />,
  },
  {
    label: "History",
    href: "/inspector/history",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    label: "Profile",
    href: "/inspector/profile",
    icon: <User className="h-5 w-5" />,
  },
];

export function InspectorNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white pb-safe">
      <div className="mx-auto flex max-w-xl items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/inspector"
              ? pathname === "/inspector"
              : pathname.startsWith(item.href);

          const isNew = item.href === "/inspector/new";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isNew
                  ? "text-zinc-900"
                  : isActive
                  ? "text-zinc-900"
                  : "text-zinc-400"
              )}
            >
              {isNew ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg -mt-6">
                  {item.icon}
                </div>
              ) : (
                item.icon
              )}
              <span className={isNew ? "mt-1" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
