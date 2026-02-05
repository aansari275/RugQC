"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, Loader2, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getInspections } from "@/lib/firebase";
import { formatDate } from "@/lib/utils";
import type { Inspection, RiskScore } from "@/types";

// ==========================================
// Inspection Row Component
// ==========================================

interface InspectionRowProps {
  inspection: Inspection;
}

function InspectionRow({ inspection }: InspectionRowProps) {
  const riskConfig: Record<RiskScore, { label: string; badgeVariant: "red" | "amber" | "green" }> = {
    red: { label: "Failed", badgeVariant: "red" },
    amber: { label: "Review", badgeVariant: "amber" },
    green: { label: "Passed", badgeVariant: "green" },
  };

  const risk = riskConfig[inspection.riskScore];

  return (
    <Link href={`/owner/inspections/${inspection.id}`}>
      <Card className="transition-all hover:shadow-md hover:border-emerald-200 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={risk.badgeVariant} className="text-xs">
                {risk.label}
              </Badge>
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {inspection.articleCode} • {inspection.buyerName}
                </p>
                <p className="text-xs text-zinc-500">
                  {inspection.type === "final" ? "Final" : "Inline"} • {formatDate(inspection.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">
                {inspection.majorDefectsFound} major / {inspection.minorDefectsFound} minor
              </p>
              {inspection.ownerAction && (
                <Badge variant="secondary" className="mt-1 capitalize text-xs">
                  {inspection.ownerAction}ed
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ==========================================
// Main Page Component
// ==========================================

export default function InspectionsPage() {
  const { orgId } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | RiskScore>("all");

  // Load inspections
  useEffect(() => {
    if (!orgId) return;

    const loadInspections = async () => {
      try {
        const result = await getInspections(orgId);
        setInspections(result.items);
        setFilteredInspections(result.items);
      } catch (error) {
        console.error("Error loading inspections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInspections();
  }, [orgId]);

  // Filter inspections
  useEffect(() => {
    let result = inspections;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.articleCode.toLowerCase().includes(query) ||
          i.buyerName.toLowerCase().includes(query) ||
          i.poNumber?.toLowerCase().includes(query)
      );
    }

    // Apply risk filter
    if (filter !== "all") {
      result = result.filter((i) => i.riskScore === filter);
    }

    setFilteredInspections(result);
  }, [searchQuery, filter, inspections]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardHeader />

      <div className="p-6">
        {/* Back link */}
        <Link
          href="/owner"
          className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">All Inspections</h1>
            <p className="text-sm text-zinc-500">
              {filteredInspections.length} inspection{filteredInspections.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by article, buyer, or PO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "red", "amber", "green"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={filter === f ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : ""}
              >
                {f === "all" ? "All" : f === "red" ? "Failed" : f === "amber" ? "Review" : "Passed"}
              </Button>
            ))}
          </div>
        </div>

        {/* Inspections list */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : filteredInspections.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardCheck className="h-12 w-12 text-zinc-300" />
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">No inspections found</h3>
                <p className="mt-1 text-sm text-zinc-500 text-center">
                  {searchQuery || filter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Inspections will appear here once submitted"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInspections.map((inspection) => (
              <InspectionRow key={inspection.id} inspection={inspection} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
