"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { FullPageSpinner } from "@/components/ui/spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return null; // AuthContext will redirect
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardSidebar />
      <main className="md:ml-64">
        {children}
      </main>
    </div>
  );
}
