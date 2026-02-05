"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  subscribeToExceptionInspections,
  getDashboardStats,
  updateInspection,
} from "@/lib/firebase";
import { formatDate } from "@/lib/utils";
import type { Inspection, RiskScore, OwnerAction, DashboardStats } from "@/types";

// ==========================================
// Stats Card Component
// ==========================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "critical" | "warning" | "success";
}

function StatCard({ label, value, icon, variant = "default" }: StatCardProps) {
  const variantClasses = {
    default: "bg-white",
    critical: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    success: "bg-green-50 border-green-200",
  };

  return (
    <Card className={variantClasses[variant]}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{value}</p>
          </div>
          <div className="text-zinc-400">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// Inspection Card Component
// ==========================================

interface InspectionCardProps {
  inspection: Inspection;
  onAction: (id: string, action: OwnerAction) => Promise<void>;
  isActioning: boolean;
}

function InspectionCard({ inspection, onAction, isActioning }: InspectionCardProps) {
  const riskConfig: Record<RiskScore, { label: string; emoji: string; badgeVariant: "red" | "amber" | "green" }> = {
    red: { label: "FAILED AQL", emoji: "🔴", badgeVariant: "red" },
    amber: { label: "REVIEW", emoji: "🟡", badgeVariant: "amber" },
    green: { label: "PASSED", emoji: "🟢", badgeVariant: "green" },
  };

  const risk = riskConfig[inspection.riskScore];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge variant={risk.badgeVariant} className="text-xs">
            {risk.emoji} {risk.label}
          </Badge>
          <span className="text-xs text-zinc-500">
            {inspection.type === "final" ? "Final" : "Inline"} • {formatDate(inspection.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-sm font-semibold text-zinc-900">
          #{inspection.id.slice(-4)} • {inspection.articleCode} • {inspection.buyerName}
        </h3>

        {/* Defect summary */}
        <div className="mt-2 flex gap-3 text-xs text-zinc-500">
          {inspection.criticalDefectsFound > 0 && (
            <span className="text-red-600">
              {inspection.criticalDefectsFound} critical
            </span>
          )}
          <span>
            {inspection.majorDefectsFound} major / {inspection.minorDefectsFound} minor
          </span>
          <span>Lot: {inspection.lotSize} pcs</span>
        </div>

        {/* AI Summary */}
        {inspection.aiSummary && (
          <p className="mt-3 text-sm text-zinc-600 line-clamp-3">
            {inspection.aiSummary}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/owner/inspections/${inspection.id}`}>
              View
            </Link>
          </Button>
          {inspection.riskScore !== "green" && !inspection.ownerAction && (
            <>
              <Button
                size="sm"
                onClick={() => onAction(inspection.id, "ship")}
                disabled={isActioning}
              >
                {isActioning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ship"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction(inspection.id, "hold")}
                disabled={isActioning}
              >
                Hold
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction(inspection.id, "rework")}
                disabled={isActioning}
              >
                Rework
              </Button>
            </>
          )}
          {inspection.ownerAction && (
            <Badge variant="secondary" className="capitalize">
              {inspection.ownerAction}ed
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// Empty State Component
// ==========================================

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-zinc-900">All clear!</h3>
        <p className="mt-1 text-sm text-zinc-500 text-center max-w-sm">
          No inspections need your attention right now. Your team is doing great work.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/owner/inspections">
            View all inspections
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ==========================================
// Main Dashboard Component
// ==========================================

export default function OwnerDashboard() {
  const { orgId, user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Subscribe to exception inspections
  useEffect(() => {
    if (!orgId) return;

    const unsubscribe = subscribeToExceptionInspections(orgId, (data) => {
      setInspections(data);
      setIsLoading(false);
    });

    // Load stats
    getDashboardStats(orgId).then(setStats);

    return () => unsubscribe();
  }, [orgId]);

  // Handle owner action
  const handleAction = async (inspectionId: string, action: OwnerAction) => {
    if (!orgId || !user) return;

    setActioningId(inspectionId);
    try {
      await updateInspection(orgId, inspectionId, {
        ownerAction: action,
        ownerActionAt: new Date(),
        ownerActionBy: user.id,
        status: "reviewed",
      });

      // Refresh stats
      const newStats = await getDashboardStats(orgId);
      setStats(newStats);
    } catch (error) {
      console.error("Error taking action:", error);
    } finally {
      setActioningId(null);
    }
  };

  // Filter to show only inspections without owner action
  const pendingInspections = inspections.filter((i) => !i.ownerAction);

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Critical"
            value={stats?.critical || 0}
            icon={<AlertCircle className="h-6 w-6" />}
            variant="critical"
          />
          <StatCard
            label="Needs Review"
            value={stats?.review || 0}
            icon={<AlertTriangle className="h-6 w-6" />}
            variant="warning"
          />
          <StatCard
            label="Clear"
            value={stats?.clear || 0}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            label="Total Submitted"
            value={stats?.total || 0}
            icon={<CheckCircle className="h-6 w-6" />}
          />
        </div>

        {/* Exception inspections */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Needs your decision
              </h2>
              <p className="text-sm text-zinc-500">
                {pendingInspections.length} inspection{pendingInspections.length !== 1 ? "s" : ""} requiring action
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/owner/inspections">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : pendingInspections.length === 0 ? (
              <EmptyState />
            ) : (
              pendingInspections.map((inspection) => (
                <InspectionCard
                  key={inspection.id}
                  inspection={inspection}
                  onAction={handleAction}
                  isActioning={actioningId === inspection.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
