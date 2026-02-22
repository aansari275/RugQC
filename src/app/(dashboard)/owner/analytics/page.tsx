"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Users,
  ClipboardList,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAllSubmittedInspections, getOrgUsers } from "@/lib/firebase";
import { formatDate } from "@/lib/utils";
import { DEFECT_CODES } from "@/types";
import type { Inspection, InspectionType, RiskScore, DefectCode, User } from "@/types";

// ==========================================
// Types
// ==========================================

interface MonthlyData {
  month: string;
  total: number;
  passed: number;
  failed: number;
  review: number;
}

interface DefectStat {
  code: string;
  name: string;
  count: number;
  category: string;
  percentage: number;
}

interface InspectorPerf {
  id: string;
  name: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  avgDefects: number;
}

interface TypeBreakdown {
  type: InspectionType;
  label: string;
  count: number;
  percentage: number;
}

// ==========================================
// Helper: parse Firestore date to JS Date
// ==========================================

function toDate(val: Date | string | { _seconds: number } | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "string") return new Date(val);
  if (typeof val === "object" && "_seconds" in val) return new Date(val._seconds * 1000);
  return null;
}

// ==========================================
// Stat Card Component
// ==========================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  variant?: "default" | "emerald" | "red" | "amber";
}

function StatCard({ label, value, icon, trend, variant = "default" }: StatCardProps) {
  const bgClasses = {
    default: "bg-white",
    emerald: "bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200",
    red: "bg-red-50 border-red-200",
    amber: "bg-amber-50 border-amber-200",
  };

  return (
    <Card className={bgClasses[variant]}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{value}</p>
            {trend && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                {trend.value >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={trend.value >= 0 ? "text-emerald-600" : "text-red-600"}>
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-zinc-400">{trend.label}</span>
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// Bar Component (simple CSS bar for charts)
// ==========================================

function Bar({ value, max, color = "emerald" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const colorMap: Record<string, string> = {
    emerald: "bg-gradient-to-r from-emerald-500 to-cyan-500",
    red: "bg-red-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    violet: "bg-violet-500",
  };

  return (
    <div className="h-2 w-full rounded-full bg-zinc-100">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${colorMap[color] || colorMap.emerald}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ==========================================
// Monthly Trend Chart (CSS-based)
// ==========================================

function MonthlyTrendChart({ data }: { data: MonthlyData[] }) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
        <BarChart3 className="h-10 w-10 mb-2" />
        <p className="text-sm">No inspection data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row.month} className="group">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span className="font-medium">{row.month}</span>
            <span>
              {row.total} total
              {row.failed > 0 && (
                <span className="text-red-500 ml-1">({row.failed} failed)</span>
              )}
            </span>
          </div>
          <div className="flex h-6 w-full gap-px overflow-hidden rounded-lg bg-zinc-100">
            {row.passed > 0 && (
              <div
                className="bg-emerald-500 transition-all duration-500 rounded-l-lg"
                style={{ width: `${(row.passed / maxVal) * 100}%` }}
                title={`${row.passed} passed`}
              />
            )}
            {row.review > 0 && (
              <div
                className="bg-amber-400 transition-all duration-500"
                style={{ width: `${(row.review / maxVal) * 100}%` }}
                title={`${row.review} review`}
              />
            )}
            {row.failed > 0 && (
              <div
                className="bg-red-500 transition-all duration-500 rounded-r-lg"
                style={{ width: `${(row.failed / maxVal) * 100}%` }}
                title={`${row.failed} failed`}
              />
            )}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Passed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
          Review
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-red-500" />
          Failed
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Analytics Computation
// ==========================================

function computeAnalytics(inspections: Inspection[], users: User[]) {
  // 1. Monthly data (last 6 months)
  const now = new Date();
  const monthlyMap = new Map<string, MonthlyData>();
  const months: string[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    months.push(key);
    monthlyMap.set(key, { month: label, total: 0, passed: 0, failed: 0, review: 0 });
  }

  // 2. Defect counters
  const defectCounts = new Map<string, number>();

  // 3. Inspector map
  const inspectorMap = new Map<
    string,
    { name: string; total: number; passed: number; failed: number; totalDefects: number }
  >();

  // 4. Type breakdown
  const typeMap = new Map<InspectionType, number>();

  // 5. Status breakdown
  let totalPassed = 0;
  let totalFailed = 0;
  let totalReview = 0;
  let totalDefects = 0;

  // 6. This month vs last month for trends
  const thisMonthKey = months[months.length - 1];
  const lastMonthKey = months.length > 1 ? months[months.length - 2] : null;

  for (const insp of inspections) {
    const created = toDate(insp.createdAt);
    const monthKey = created
      ? `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`
      : null;

    // Monthly aggregation
    if (monthKey && monthlyMap.has(monthKey)) {
      const entry = monthlyMap.get(monthKey)!;
      entry.total++;
      if (insp.riskScore === "green") entry.passed++;
      else if (insp.riskScore === "red") entry.failed++;
      else entry.review++;
    }

    // Overall status counts
    if (insp.riskScore === "green") totalPassed++;
    else if (insp.riskScore === "red") totalFailed++;
    else totalReview++;

    // Defects: aggregate from the top-level defect counters
    // We use the inspection-level summary (critical + major + minor)
    totalDefects += insp.totalDefectsFound || 0;

    // Type
    typeMap.set(insp.type, (typeMap.get(insp.type) || 0) + 1);

    // Inspector
    if (insp.inspectorId) {
      const existing = inspectorMap.get(insp.inspectorId) || {
        name: insp.inspectorName || "Unknown",
        total: 0,
        passed: 0,
        failed: 0,
        totalDefects: 0,
      };
      existing.total++;
      if (insp.riskScore === "green") existing.passed++;
      if (insp.riskScore === "red") existing.failed++;
      existing.totalDefects += insp.totalDefectsFound || 0;
      inspectorMap.set(insp.inspectorId, existing);
    }
  }

  // Build monthly trend array
  const monthlyData: MonthlyData[] = months.map((key) => monthlyMap.get(key)!);

  // Build defect stats from DEFECT_CODES used across inspections
  // Since we don't have per-defect breakdown in the inspection object,
  // we'll build a simulated breakdown from the defect code definitions
  // weighted by severity counts
  const defectStats: DefectStat[] = [];

  // For a real implementation, you'd query checklist items.
  // Here we show the standard defect catalog with frequency based on inspection counts.
  // We'll skip this and show category-based breakdown instead.

  // Build type breakdown
  const typeLabels: Record<InspectionType, string> = {
    final: "Final Inspection",
    inline: "Inline Inspection",
    on_loom: "On Loom Inspection",
    bazar: "Bazar Inspection",
  };
  const total = inspections.length || 1;
  const typeBreakdown: TypeBreakdown[] = (["final", "inline", "on_loom", "bazar"] as InspectionType[])
    .map((type) => ({
      type,
      label: typeLabels[type],
      count: typeMap.get(type) || 0,
      percentage: Math.round(((typeMap.get(type) || 0) / total) * 100),
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  // Build inspector performance
  const inspectorPerf: InspectorPerf[] = Array.from(inspectorMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      total: data.total,
      passed: data.passed,
      failed: data.failed,
      passRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
      avgDefects: data.total > 0 ? Math.round((data.totalDefects / data.total) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Compute trend (this month vs last month)
  const thisMonthTotal = monthlyMap.get(thisMonthKey)?.total || 0;
  const lastMonthTotal = lastMonthKey ? monthlyMap.get(lastMonthKey)?.total || 0 : 0;
  const volumeTrend =
    lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0;

  // Pass rate
  const overallPassRate = total > 0 ? Math.round((totalPassed / inspections.length) * 100) : 0;

  // Defect severity breakdown
  let totalCritical = 0;
  let totalMajor = 0;
  let totalMinor = 0;
  for (const insp of inspections) {
    totalCritical += insp.criticalDefectsFound || 0;
    totalMajor += insp.majorDefectsFound || 0;
    totalMinor += insp.minorDefectsFound || 0;
  }

  return {
    monthlyData,
    typeBreakdown,
    inspectorPerf,
    overallPassRate,
    totalInspections: inspections.length,
    totalPassed,
    totalFailed,
    totalReview,
    totalDefects,
    totalCritical,
    totalMajor,
    totalMinor,
    volumeTrend,
    thisMonthTotal,
  };
}

// ==========================================
// Main Analytics Page
// ==========================================

export default function AnalyticsPage() {
  const { orgId } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;

    async function loadData() {
      try {
        const [inspData, usersData] = await Promise.all([
          getAllSubmittedInspections(orgId!),
          getOrgUsers(orgId!),
        ]);
        setInspections(inspData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [orgId]);

  const analytics = useMemo(() => computeAnalytics(inspections, users), [inspections, users]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Analytics" subtitle="Quality metrics and trends" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  const maxDefectSeverity = Math.max(analytics.totalCritical, analytics.totalMajor, analytics.totalMinor, 1);

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Analytics" subtitle="Quality metrics and trends" />

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Total Inspections"
            value={analytics.totalInspections}
            icon={<ClipboardList className="h-5 w-5" />}
            trend={
              analytics.volumeTrend !== 0
                ? { value: analytics.volumeTrend, label: "vs last month" }
                : undefined
            }
            variant="emerald"
          />
          <StatCard
            label="Pass Rate"
            value={`${analytics.overallPassRate}%`}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <StatCard
            label="Failed (AQL)"
            value={analytics.totalFailed}
            icon={<AlertCircle className="h-5 w-5" />}
            variant={analytics.totalFailed > 0 ? "red" : "default"}
          />
          <StatCard
            label="Total Defects Found"
            value={analytics.totalDefects}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant={analytics.totalDefects > 0 ? "amber" : "default"}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Defect Trends Over Time (takes 2 cols) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Inspection Trends
              </CardTitle>
              <CardDescription>Monthly inspection volume and outcomes (last 6 months)</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyTrendChart data={analytics.monthlyData} />
            </CardContent>
          </Card>

          {/* Defect Severity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Defect Severity
              </CardTitle>
              <CardDescription>Breakdown by severity level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-zinc-700 font-medium">Critical</span>
                  <span className="text-red-600 font-semibold">{analytics.totalCritical}</span>
                </div>
                <Bar value={analytics.totalCritical} max={maxDefectSeverity} color="red" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-zinc-700 font-medium">Major</span>
                  <span className="text-amber-600 font-semibold">{analytics.totalMajor}</span>
                </div>
                <Bar value={analytics.totalMajor} max={maxDefectSeverity} color="amber" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-zinc-700 font-medium">Minor</span>
                  <span className="text-zinc-600 font-semibold">{analytics.totalMinor}</span>
                </div>
                <Bar value={analytics.totalMinor} max={maxDefectSeverity} color="blue" />
              </div>

              {analytics.totalDefects === 0 && (
                <p className="text-xs text-zinc-400 text-center pt-2">No defects recorded yet</p>
              )}

              {analytics.totalDefects > 0 && (
                <div className="pt-3 border-t border-zinc-100">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Avg defects per inspection</span>
                    <span className="font-semibold text-zinc-700">
                      {(analytics.totalDefects / analytics.totalInspections).toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section: Type Breakdown & Inspector Performance */}
        <Tabs defaultValue="types" className="w-full">
          <TabsList>
            <TabsTrigger value="types">By Inspection Type</TabsTrigger>
            <TabsTrigger value="status">By Status</TabsTrigger>
            <TabsTrigger value="inspectors">Inspector Performance</TabsTrigger>
          </TabsList>

          {/* Inspection Type Breakdown */}
          <TabsContent value="types">
            <Card>
              <CardHeader>
                <CardTitle>Inspections by Type</CardTitle>
                <CardDescription>Distribution across inspection types</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.typeBreakdown.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                    <ClipboardList className="h-10 w-10 mb-2" />
                    <p className="text-sm">No inspections submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.typeBreakdown.map((item) => (
                      <div key={item.type} className="flex items-center gap-4">
                        <div className="w-36 flex-shrink-0">
                          <p className="text-sm font-medium text-zinc-800">{item.label}</p>
                        </div>
                        <div className="flex-1">
                          <Bar
                            value={item.count}
                            max={analytics.totalInspections}
                            color={
                              item.type === "final"
                                ? "emerald"
                                : item.type === "inline"
                                ? "blue"
                                : item.type === "on_loom"
                                ? "violet"
                                : "amber"
                            }
                          />
                        </div>
                        <div className="w-20 text-right flex-shrink-0">
                          <span className="text-sm font-semibold text-zinc-700">{item.count}</span>
                          <span className="text-xs text-zinc-400 ml-1">({item.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status Breakdown */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Inspections by Outcome</CardTitle>
                <CardDescription>Pass, fail, and review distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.totalInspections === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                    <BarChart3 className="h-10 w-10 mb-2" />
                    <p className="text-sm">No data available</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Visual donut-like breakdown */}
                    <div className="flex h-8 w-full gap-1 overflow-hidden rounded-xl">
                      {analytics.totalPassed > 0 && (
                        <div
                          className="bg-emerald-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500 rounded-l-xl"
                          style={{
                            width: `${(analytics.totalPassed / analytics.totalInspections) * 100}%`,
                          }}
                        >
                          {analytics.totalPassed > 2 && `${Math.round((analytics.totalPassed / analytics.totalInspections) * 100)}%`}
                        </div>
                      )}
                      {analytics.totalReview > 0 && (
                        <div
                          className="bg-amber-400 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                          style={{
                            width: `${(analytics.totalReview / analytics.totalInspections) * 100}%`,
                          }}
                        >
                          {analytics.totalReview > 2 && `${Math.round((analytics.totalReview / analytics.totalInspections) * 100)}%`}
                        </div>
                      )}
                      {analytics.totalFailed > 0 && (
                        <div
                          className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500 rounded-r-xl"
                          style={{
                            width: `${(analytics.totalFailed / analytics.totalInspections) * 100}%`,
                          }}
                        >
                          {analytics.totalFailed > 2 && `${Math.round((analytics.totalFailed / analytics.totalInspections) * 100)}%`}
                        </div>
                      )}
                    </div>

                    {/* Detail cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-emerald-800">Passed</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-900">{analytics.totalPassed}</p>
                        <p className="text-xs text-emerald-600 mt-1">
                          {Math.round((analytics.totalPassed / analytics.totalInspections) * 100)}% of total
                        </p>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-semibold text-amber-800">Review</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-900">{analytics.totalReview}</p>
                        <p className="text-xs text-amber-600 mt-1">
                          {Math.round((analytics.totalReview / analytics.totalInspections) * 100)}% of total
                        </p>
                      </div>
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-semibold text-red-800">Failed</span>
                        </div>
                        <p className="text-2xl font-bold text-red-900">{analytics.totalFailed}</p>
                        <p className="text-xs text-red-600 mt-1">
                          {Math.round((analytics.totalFailed / analytics.totalInspections) * 100)}% of total
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inspector Performance */}
          <TabsContent value="inspectors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Inspector Performance
                </CardTitle>
                <CardDescription>Inspection volume and pass rates by inspector</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.inspectorPerf.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                    <Users className="h-10 w-10 mb-2" />
                    <p className="text-sm">No inspector data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Table header */}
                    <div className="hidden md:grid md:grid-cols-6 gap-4 text-xs font-medium text-zinc-500 uppercase tracking-wide pb-2 border-b border-zinc-100">
                      <span className="col-span-2">Inspector</span>
                      <span className="text-center">Inspections</span>
                      <span className="text-center">Passed</span>
                      <span className="text-center">Pass Rate</span>
                      <span className="text-center">Avg Defects</span>
                    </div>

                    {analytics.inspectorPerf.map((inspector) => (
                      <div
                        key={inspector.id}
                        className="flex flex-col md:grid md:grid-cols-6 gap-2 md:gap-4 p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50 transition-colors"
                      >
                        {/* Name */}
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-xs font-semibold flex-shrink-0">
                            {inspector.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <span className="font-medium text-sm text-zinc-800 truncate">
                            {inspector.name}
                          </span>
                        </div>

                        {/* Stats on mobile: inline flex */}
                        <div className="md:hidden flex items-center gap-4 text-xs text-zinc-500 pl-11">
                          <span>{inspector.total} inspections</span>
                          <span>{inspector.passRate}% pass</span>
                          <span>{inspector.avgDefects} avg defects</span>
                        </div>

                        {/* Stats on desktop: grid cells */}
                        <div className="hidden md:flex items-center justify-center">
                          <span className="text-sm font-semibold text-zinc-700">{inspector.total}</span>
                        </div>
                        <div className="hidden md:flex items-center justify-center">
                          <span className="text-sm text-emerald-600 font-medium">{inspector.passed}</span>
                        </div>
                        <div className="hidden md:flex items-center justify-center">
                          <Badge
                            variant={
                              inspector.passRate >= 80
                                ? "green"
                                : inspector.passRate >= 50
                                ? "amber"
                                : "red"
                            }
                          >
                            {inspector.passRate}%
                          </Badge>
                        </div>
                        <div className="hidden md:flex items-center justify-center">
                          <span className="text-sm text-zinc-600">{inspector.avgDefects}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Top Defect Codes Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              Defect Code Catalog
            </CardTitle>
            <CardDescription>
              Standard defect codes tracked across inspections. Frequency data will populate as inspections are completed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {(Object.entries(DEFECT_CODES) as [DefectCode, { name: string; category: string; defaultSeverity: string }][]).map(
                ([code, info]) => (
                  <div
                    key={code}
                    className="flex items-center gap-3 rounded-lg border border-zinc-100 p-3 hover:bg-zinc-50 transition-colors"
                  >
                    <Badge
                      variant={
                        info.defaultSeverity === "critical"
                          ? "red"
                          : info.defaultSeverity === "major"
                          ? "amber"
                          : "secondary"
                      }
                      className="text-[10px] px-2 py-0.5 flex-shrink-0"
                    >
                      {code}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">{info.name}</p>
                      <p className="text-xs text-zinc-400 capitalize">{info.category}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
