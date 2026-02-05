"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, CheckCircle, Loader2, ChevronRight, ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { InspectorHeader } from "@/components/layout/InspectorHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getInspections, getInspectorStats, getChecklistItems } from "@/lib/firebase";
import { formatDate, formatTime, getGreeting } from "@/lib/utils";
import type { Inspection, InspectorStats } from "@/types";

// ==========================================
// Draft Card Component
// ==========================================

interface DraftCardProps {
  inspection: Inspection;
  completedItems: number;
  totalItems: number;
}

function DraftCard({ inspection, completedItems, totalItems }: DraftCardProps) {
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Link href={`/inspector/inspection/${inspection.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-zinc-900">
                {inspection.articleCode} • {inspection.buyerName}
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                {inspection.type === "final" ? "Final Inspection" : "Inline Inspection"}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>{completedItems}/{totalItems} items</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mt-1 h-1.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ==========================================
// Submission Card Component
// ==========================================

interface SubmissionCardProps {
  inspection: Inspection;
}

function SubmissionCard({ inspection }: SubmissionCardProps) {
  return (
    <Link href={`/inspector/inspection/${inspection.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-zinc-900">
                #{inspection.id.slice(-4)} • {inspection.articleCode}
              </h3>
              <p className="text-xs text-zinc-500">
                {inspection.buyerName} • {formatTime(inspection.submittedAt || inspection.createdAt)}
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
// Empty State Component
// ==========================================

function EmptyDrafts() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <FileText className="h-10 w-10 text-zinc-300" />
        <p className="mt-2 text-sm text-zinc-500">No drafts yet</p>
        <Button size="sm" className="mt-3" asChild>
          <Link href="/inspector/new">
            <Plus className="mr-1 h-4 w-4" />
            Start new inspection
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ==========================================
// Main Inspector Home Component
// ==========================================

export default function InspectorHome() {
  const { orgId, user } = useAuth();
  const [drafts, setDrafts] = useState<(Inspection & { completedItems: number; totalItems: number })[]>([]);
  const [submissions, setSubmissions] = useState<Inspection[]>([]);
  const [stats, setStats] = useState<InspectorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0] || "Inspector";

  useEffect(() => {
    async function loadData() {
      if (!orgId || !user) return;

      try {
        // Load drafts
        const draftsResult = await getInspections(orgId, {
          status: ["draft"],
          inspectorId: user.id,
        });

        // Load today's submissions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const submissionsResult = await getInspections(orgId, {
          status: ["submitted"],
          inspectorId: user.id,
        });

        // Filter submissions to today only
        const todaySubmissions = submissionsResult.items.filter((i) => {
          const submittedDate = i.submittedAt ? new Date(i.submittedAt) : new Date(i.createdAt);
          return submittedDate >= today;
        });

        // Load checklist items for each draft to calculate progress
        const draftsWithProgress = await Promise.all(
          draftsResult.items.map(async (draft) => {
            try {
              const items = await getChecklistItems(orgId, draft.id);
              const completedItems = items.filter((item) => item.status !== "pending").length;
              return {
                ...draft,
                completedItems,
                totalItems: items.length,
              };
            } catch {
              return {
                ...draft,
                completedItems: 0,
                totalItems: 0,
              };
            }
          })
        );

        setDrafts(draftsWithProgress);
        setSubmissions(todaySubmissions);

        // Load stats
        const statsData = await getInspectorStats(orgId, user.id);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [orgId, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-emerald-600 to-cyan-600 px-4 pb-8 pt-6 text-white">
        <p className="text-sm text-emerald-100">{greeting}</p>
        <h1 className="mt-1 text-2xl font-semibold">{firstName}</h1>

        {/* Quick stats */}
        <div className="mt-4 flex gap-4">
          <div className="flex-1 rounded-xl bg-white/20 backdrop-blur-sm p-3">
            <p className="text-2xl font-bold">{stats?.drafts || 0}</p>
            <p className="text-xs text-emerald-100">Drafts</p>
          </div>
          <div className="flex-1 rounded-xl bg-white/20 backdrop-blur-sm p-3">
            <p className="text-2xl font-bold">{stats?.todaySubmissions || 0}</p>
            <p className="text-xs text-emerald-100">Today</p>
          </div>
        </div>
      </header>

      {/* New Inspection Button */}
      <div className="px-4 -mt-4">
        <Button size="lg" className="w-full shadow-lg bg-zinc-900 hover:bg-zinc-800" asChild>
          <Link href="/inspector/new">
            <Plus className="mr-2 h-5 w-5" />
            New Inspection
          </Link>
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Drafts Section */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-500">
              Drafts ({drafts.length})
            </h2>
            {drafts.length > 0 && (
              <Link
                href="/inspector/drafts"
                className="text-xs font-medium text-zinc-900 hover:underline"
              >
                View all
              </Link>
            )}
          </div>
          <div className="mt-3 space-y-3">
            {drafts.length === 0 ? (
              <EmptyDrafts />
            ) : (
              drafts.slice(0, 3).map((draft) => (
                <DraftCard
                  key={draft.id}
                  inspection={draft}
                  completedItems={draft.completedItems}
                  totalItems={draft.totalItems}
                />
              ))
            )}
          </div>
        </section>

        {/* Today's Submissions Section */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-500">
              Today&apos;s Submissions ({submissions.length})
            </h2>
            {submissions.length > 0 && (
              <Link
                href="/inspector/history"
                className="text-xs font-medium text-zinc-900 hover:underline"
              >
                View all
              </Link>
            )}
          </div>
          <div className="mt-3 space-y-3">
            {submissions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <ClipboardList className="h-10 w-10 text-zinc-300" />
                  <p className="mt-2 text-sm text-zinc-500">No submissions today</p>
                </CardContent>
              </Card>
            ) : (
              submissions.slice(0, 5).map((submission) => (
                <SubmissionCard key={submission.id} inspection={submission} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
