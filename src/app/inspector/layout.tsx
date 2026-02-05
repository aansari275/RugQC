"use client";

import { useAuth } from "@/contexts/AuthContext";
import { InspectorNav } from "@/components/layout/InspectorNav";
import { FullPageSpinner } from "@/components/ui/spinner";

export default function InspectorLayout({
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
    <div className="min-h-screen bg-white pb-20">
      {children}
      <InspectorNav />
    </div>
  );
}
