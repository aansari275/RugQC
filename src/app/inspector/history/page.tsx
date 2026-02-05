"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ClipboardList, ChevronRight, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInspections } from "@/lib/firebase";
import { formatDate } from "@/lib/utils";
import type { Inspection, RiskScore } from "@/types";

// ==========================================
// Submission Card Component
// ==========================================

function SubmissionCard({ inspection }: { inspection: Inspection }) {
  const riskConfig: Record<RiskScore, { label: string; badgeVariant: "red" | "amber" | "green" }> = {
    red: { label: "Failed", badgeVariant: "red" },
    amber: { label: "Review", badgeVariant: "amber" },
    green: { label: "Passed", badgeVariant: "green" },
  };

  const risk = riskConfig[inspection.riskScore];

  return (
    <Link href={`/inspector/inspection/${inspection.id}`}>
      <Card className="transition-shadow hover:shadow-md hover:border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-zinc-900">
                  {inspection.articleCode}
                </h3>
                <Badge variant={risk.badgeVariant} className="text-xs">
                  {risk.label}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500">
                {inspection.buyerName} • {formatDate(inspection.submittedAt || inspection.createdAt)}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ==========================================
// Main Page Component
// ==========================================

export default function HistoryPage() {
  const { orgId, user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!orgId || !user) return;

      try {
        const result = await getInspections(orgId, {
          status: ["submitted", "reviewed"],
          inspectorId: user.id,
        });
        setInspections(result.items);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, [orgId, user]);

  // Group by date
  const groupedByDate = inspections.reduce((acc, inspection) => {
    const date = formatDate(inspection.submittedAt || inspection.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(inspection);
    return acc;
  }, {} as Record<string, Inspection[]>);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4">
        <Link
          href="/inspector"
          className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
        <h1 className="mt-2 text-xl font-bold text-zinc-900">Submission History</h1>
        <p className="text-sm text-zinc-500">{inspections.length} inspection{inspections.length !== 1 ? "s" : ""} submitted</p>
      </header>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : inspections.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-zinc-300" />
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">No submissions yet</h3>
              <p className="mt-1 text-sm text-zinc-500 text-center">
                Your completed inspections will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date} className="mb-6">
              <h2 className="text-sm font-semibold text-zinc-500 mb-3">{date}</h2>
              <div className="space-y-3">
                {items.map((inspection) => (
                  <SubmissionCard key={inspection.id} inspection={inspection} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
