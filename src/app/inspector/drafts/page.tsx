"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, FileText, ChevronRight, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getInspections, getChecklistItems, deleteInspection } from "@/lib/firebase";
import { formatDate } from "@/lib/utils";
import type { Inspection } from "@/types";

// ==========================================
// Draft Card Component
// ==========================================

interface DraftCardProps {
  inspection: Inspection & { completedItems: number; totalItems: number };
  onDelete: (id: string) => void;
}

function DraftCard({ inspection, onDelete }: DraftCardProps) {
  const progress = inspection.totalItems > 0 ? (inspection.completedItems / inspection.totalItems) * 100 : 0;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Link href={`/inspector/inspection/${inspection.id}`} className="flex-1">
            <h3 className="font-medium text-zinc-900">
              {inspection.articleCode} • {inspection.buyerName}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {inspection.type === "final" ? "Final" : "Inline"} • {formatDate(inspection.createdAt)}
            </p>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.preventDefault();
                onDelete(inspection.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Link href={`/inspector/inspection/${inspection.id}`}>
              <ChevronRight className="h-5 w-5 text-zinc-400" />
            </Link>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{inspection.completedItems}/{inspection.totalItems} items</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="mt-1 h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// Main Page Component
// ==========================================

export default function DraftsPage() {
  const { orgId, user } = useAuth();
  const [drafts, setDrafts] = useState<(Inspection & { completedItems: number; totalItems: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDrafts() {
      if (!orgId || !user) return;

      try {
        const result = await getInspections(orgId, {
          status: ["draft"],
          inspectorId: user.id,
        });

        // Load checklist items for each draft
        const draftsWithProgress = await Promise.all(
          result.items.map(async (draft) => {
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
      } catch (error) {
        console.error("Error loading drafts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDrafts();
  }, [orgId, user]);

  const handleDelete = async (id: string) => {
    if (!orgId) return;
    if (!confirm("Delete this draft? This cannot be undone.")) return;

    try {
      await deleteInspection(orgId, id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  };

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
        <h1 className="mt-2 text-xl font-bold text-zinc-900">Drafts</h1>
        <p className="text-sm text-zinc-500">{drafts.length} inspection{drafts.length !== 1 ? "s" : ""} in progress</p>
      </header>

      {/* Content */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : drafts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-zinc-300" />
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">No drafts</h3>
              <p className="mt-1 text-sm text-zinc-500 text-center">
                Start a new inspection to create a draft
              </p>
              <Button className="mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500" asChild>
                <Link href="/inspector/new">Start new inspection</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          drafts.map((draft) => (
            <DraftCard key={draft.id} inspection={draft} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
