"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronUp,
  Save,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { InspectorHeader } from "@/components/layout/InspectorHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChecklistGroup } from "@/components/inspection/ChecklistItem";
import {
  getInspection,
  getChecklistItems,
  updateInspection,
  updateChecklistItem,
  uploadImage,
} from "@/lib/firebase";
import { calculateRiskScore, calculateAQLResult, formatDate } from "@/lib/utils";
import type { Inspection, ChecklistItem, RiskScore } from "@/types";

// ==========================================
// Summary Bar Component
// ==========================================

interface SummaryBarProps {
  inspection: Inspection;
  completedCount: number;
  totalCount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function SummaryBar({
  inspection,
  completedCount,
  totalCount,
  onSubmit,
  isSubmitting,
}: SummaryBarProps) {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-zinc-200 bg-white p-4 shadow-lg">
      <div className="mx-auto max-w-xl">
        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{completedCount}/{totalCount} items checked</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="mt-1 h-1.5" />
        </div>

        {/* Defect summary */}
        <div className="mb-3 flex items-center gap-3 text-sm">
          {inspection.criticalDefectsFound > 0 && (
            <span className="font-medium text-red-600">
              {inspection.criticalDefectsFound} critical
            </span>
          )}
          <span className="text-zinc-600">
            {inspection.majorDefectsFound} major / {inspection.minorDefectsFound} minor
          </span>
        </div>

        {/* Submit button */}
        <Button
          onClick={onSubmit}
          disabled={!isComplete || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isComplete ? (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Inspection
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {totalCount - completedCount} items remaining
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// Submission Confirmation Dialog
// ==========================================

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection: Inspection;
  onConfirm: () => void;
  isSubmitting: boolean;
}

function SubmitDialog({
  open,
  onOpenChange,
  inspection,
  onConfirm,
  isSubmitting,
}: SubmitDialogProps) {
  const isHundredPercent = inspection.inspectionMode === "hundred_percent";
  const aqlResult = isHundredPercent
    ? { sampleSize: inspection.lotSize, majorLimit: 0, minorLimit: 0 }
    : calculateAQLResult(inspection.lotSize, inspection.aqlLevel || "II");

  const riskScore = calculateRiskScore(
    inspection.criticalDefectsFound,
    inspection.majorDefectsFound,
    inspection.minorDefectsFound,
    aqlResult.majorLimit,
    aqlResult.minorLimit
  );

  const riskConfig: Record<RiskScore, { label: string; color: string; bgColor: string }> = {
    green: { label: "PASSED", color: "text-green-600", bgColor: "bg-green-100" },
    amber: { label: "REVIEW NEEDED", color: "text-amber-600", bgColor: "bg-amber-100" },
    red: { label: "FAILED", color: "text-red-600", bgColor: "bg-red-100" },
  };

  const config = riskConfig[riskScore];

  const hasDefects = inspection.majorDefectsFound > 0 || inspection.minorDefectsFound > 0 || inspection.criticalDefectsFound > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Inspection</DialogTitle>
          <DialogDescription>
            Review the inspection summary before submitting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Result badge */}
          <div className={`rounded-xl p-4 text-center ${config.bgColor}`}>
            <p className={`text-2xl font-bold ${config.color}`}>{config.label}</p>
            <p className="mt-1 text-sm text-zinc-600">
              {isHundredPercent
                ? (hasDefects ? "Defects found in 100% inspection" : "Zero defects. 100% inspection passed.")
                : (inspection.majorDefectsFound <= aqlResult.majorLimit && inspection.minorDefectsFound <= aqlResult.minorLimit ? "Within AQL limits" : "Exceeds AQL limits")}
            </p>
          </div>

          {/* Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Mode</span>
              <span className="font-medium">{isHundredPercent ? "100% Inspection" : `AQL Level ${inspection.aqlLevel}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Lot Size</span>
              <span className="font-medium">{inspection.lotSize} pcs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">{isHundredPercent ? "Pieces Inspected" : "Sample Size"}</span>
              <span className="font-medium">{inspection.sampleSize} pcs</span>
            </div>
            {isHundredPercent ? (
              <>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Defects</span>
                  <span className={`font-medium ${hasDefects ? "text-red-600" : ""}`}>
                    {inspection.criticalDefectsFound + inspection.majorDefectsFound + inspection.minorDefectsFound}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Major Defects</span>
                  <span className={`font-medium ${inspection.majorDefectsFound > aqlResult.majorLimit ? "text-red-600" : ""}`}>
                    {inspection.majorDefectsFound} / {aqlResult.majorLimit} limit
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Minor Defects</span>
                  <span className={`font-medium ${inspection.minorDefectsFound > aqlResult.minorLimit ? "text-red-600" : ""}`}>
                    {inspection.minorDefectsFound} / {aqlResult.minorLimit} limit
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Confirm & Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// Main Inspection Page Component
// ==========================================

export default function InspectionPage() {
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;
  const { orgId, user } = useAuth();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [error, setError] = useState("");

  // Load inspection and items
  useEffect(() => {
    async function loadData() {
      if (!orgId || !inspectionId) return;

      try {
        const [inspectionData, itemsData] = await Promise.all([
          getInspection(orgId, inspectionId),
          getChecklistItems(orgId, inspectionId),
        ]);

        if (!inspectionData) {
          setError("Inspection not found");
          return;
        }

        setInspection(inspectionData);
        setItems(itemsData);
      } catch (err) {
        console.error("Error loading inspection:", err);
        setError("Failed to load inspection");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [orgId, inspectionId]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    items.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [items]);

  // Calculate progress
  const completedCount = items.filter((i) => i.status !== "pending").length;
  const totalCount = items.length;

  // Calculate defects
  const defectCounts = useMemo(() => {
    let critical = 0;
    let major = 0;
    let minor = 0;

    items.forEach((item) => {
      item.defects.forEach((defect) => {
        if (defect.severity === "critical") critical += defect.count;
        else if (defect.severity === "major") major += defect.count;
        else minor += defect.count;
      });
    });

    return { critical, major, minor, total: critical + major + minor };
  }, [items]);

  // Update inspection with defect counts
  useEffect(() => {
    if (!inspection) return;
    if (
      inspection.criticalDefectsFound !== defectCounts.critical ||
      inspection.majorDefectsFound !== defectCounts.major ||
      inspection.minorDefectsFound !== defectCounts.minor
    ) {
      setInspection({
        ...inspection,
        criticalDefectsFound: defectCounts.critical,
        majorDefectsFound: defectCounts.major,
        minorDefectsFound: defectCounts.minor,
        totalDefectsFound: defectCounts.total,
      });
    }
  }, [defectCounts, inspection]);

  // Handle item update
  const handleUpdateItem = useCallback(
    async (itemId: string, updates: Partial<ChecklistItem>) => {
      if (!orgId || !inspectionId) return;

      // Optimistic update
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      );

      // Save to Firestore
      try {
        await updateChecklistItem(orgId, inspectionId, itemId, updates);
      } catch (err) {
        console.error("Error updating item:", err);
        // TODO: Show error toast and revert
      }
    },
    [orgId, inspectionId]
  );

  // Handle photo upload
  const handleUploadPhoto = useCallback(
    async (file: Blob): Promise<string> => {
      if (!orgId || !inspectionId) throw new Error("Missing context");

      const filename = `photo-${Date.now()}.jpg`;
      return uploadImage(orgId, inspectionId, file, filename);
    },
    [orgId, inspectionId]
  );

  // Handle submit
  const handleSubmit = async () => {
    if (!orgId || !inspectionId || !inspection) return;

    setIsSubmitting(true);

    try {
      const isHundredPercent = inspection.inspectionMode === "hundred_percent";
      const aqlResult = isHundredPercent
        ? { sampleSize: inspection.lotSize, majorLimit: 0, minorLimit: 0 }
        : calculateAQLResult(inspection.lotSize, inspection.aqlLevel || "II");

      const riskScore = calculateRiskScore(
        defectCounts.critical,
        defectCounts.major,
        defectCounts.minor,
        aqlResult.majorLimit,
        aqlResult.minorLimit
      );

      const aqlPassed = isHundredPercent
        ? (defectCounts.critical === 0 && defectCounts.major === 0 && defectCounts.minor === 0)
        : (defectCounts.major <= aqlResult.majorLimit && defectCounts.minor <= aqlResult.minorLimit);

      await updateInspection(orgId, inspectionId, {
        status: "submitted",
        result: aqlPassed ? "pass" : "fail",
        riskScore,
        criticalDefectsFound: defectCounts.critical,
        majorDefectsFound: defectCounts.major,
        minorDefectsFound: defectCounts.minor,
        totalDefectsFound: defectCounts.total,
        submittedAt: new Date(),
      });

      setShowSubmitDialog(false);
      router.push("/inspector");
    } catch (err) {
      console.error("Error submitting inspection:", err);
      setError("Failed to submit inspection");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg font-medium text-zinc-900">
          {error || "Inspection not found"}
        </p>
        <Button className="mt-4" onClick={() => router.push("/inspector")}>
          Go Back
        </Button>
      </div>
    );
  }

  const isReadOnly = inspection.status !== "draft";

  return (
    <div className="min-h-screen bg-zinc-50 pb-40">
      <InspectorHeader
        title={inspection.articleCode}
        subtitle={`${inspection.buyerName} • ${inspection.type === "final" ? "Final" : "Inline"}`}
        showBack
        onBack={() => router.push("/inspector")}
        actions={
          isReadOnly
            ? undefined
            : [
                { label: "Save Draft", onClick: () => {} },
                { label: "Delete", onClick: () => {}, destructive: true },
              ]
        }
      />

      {/* Inspection info card */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-zinc-500">PO Number</span>
                <p className="font-medium">{inspection.poNumber || "—"}</p>
              </div>
              <div>
                <span className="text-zinc-500">Lot Size</span>
                <p className="font-medium">{inspection.lotSize} pcs</p>
              </div>
              <div>
                <span className="text-zinc-500">{inspection.inspectionMode === "hundred_percent" ? "Inspecting" : "Sample Size"}</span>
                <p className="font-medium">{inspection.sampleSize} pcs</p>
              </div>
              <div>
                <span className="text-zinc-500">Mode</span>
                <p className="font-medium">{inspection.inspectionMode === "hundred_percent" ? "100%" : `AQL ${inspection.aqlLevel}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checklist */}
      <div className="p-4 space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <ChecklistGroup
            key={category}
            category={category}
            items={categoryItems}
            onUpdateItem={handleUpdateItem}
            onUploadPhoto={handleUploadPhoto}
            disabled={isReadOnly}
          />
        ))}
      </div>

      {/* Summary bar */}
      {!isReadOnly && inspection && (
        <SummaryBar
          inspection={{
            ...inspection,
            criticalDefectsFound: defectCounts.critical,
            majorDefectsFound: defectCounts.major,
            minorDefectsFound: defectCounts.minor,
          }}
          completedCount={completedCount}
          totalCount={totalCount}
          onSubmit={() => setShowSubmitDialog(true)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Submit dialog */}
      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        inspection={{
          ...inspection,
          criticalDefectsFound: defectCounts.critical,
          majorDefectsFound: defectCounts.major,
          minorDefectsFound: defectCounts.minor,
        }}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
