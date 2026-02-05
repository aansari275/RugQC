"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  MinusCircle,
  AlertTriangle,
  Download,
  Share2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getInspection, getChecklistItems, updateInspection } from "@/lib/firebase";
import { formatDate } from "@/lib/utils";
import type { Inspection, ChecklistItem, RiskScore, OwnerAction } from "@/types";

// ==========================================
// Checklist Item Component
// ==========================================

function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  const statusConfig = {
    ok: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    not_ok: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    na: { icon: MinusCircle, color: "text-zinc-400", bg: "bg-zinc-50" },
    pending: { icon: MinusCircle, color: "text-zinc-400", bg: "bg-zinc-50" },
  };

  const config = statusConfig[item.status];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg ${config.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-900">{item.checkpoint}</p>
          {item.remarks && (
            <p className="text-sm text-zinc-600 mt-1">{item.remarks}</p>
          )}
          {item.defects && item.defects.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.defects.map((defect, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {defect.code} ({defect.severity})
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main Page Component
// ==========================================

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orgId, user } = useAuth();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);

  const inspectionId = params.id as string;

  // Load inspection data
  useEffect(() => {
    if (!orgId || !inspectionId) return;

    const loadData = async () => {
      try {
        const [inspectionData, items] = await Promise.all([
          getInspection(orgId, inspectionId),
          getChecklistItems(orgId, inspectionId),
        ]);

        if (inspectionData) {
          setInspection(inspectionData);
          setChecklistItems(items);
        }
      } catch (error) {
        console.error("Error loading inspection:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [orgId, inspectionId]);

  // Handle owner action
  const handleAction = async (action: OwnerAction) => {
    if (!orgId || !user || !inspection) return;

    setIsActioning(true);
    try {
      await updateInspection(orgId, inspection.id, {
        ownerAction: action,
        ownerActionAt: new Date(),
        ownerActionBy: user.id,
        status: "reviewed",
      });

      setInspection({
        ...inspection,
        ownerAction: action,
        status: "reviewed",
      });
    } catch (error) {
      console.error("Error taking action:", error);
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <DashboardHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <DashboardHeader />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                Inspection not found
              </h3>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/owner/inspections">Back to inspections</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const riskConfig: Record<RiskScore, { label: string; badgeVariant: "red" | "amber" | "green" }> = {
    red: { label: "Failed AQL", badgeVariant: "red" },
    amber: { label: "Needs Review", badgeVariant: "amber" },
    green: { label: "Passed", badgeVariant: "green" },
  };

  const risk = riskConfig[inspection.riskScore];

  // Group checklist items by category
  const groupedItems = checklistItems.reduce((acc, item) => {
    const category = item.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardHeader />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/owner/inspections"
          className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Inspections
        </Link>

        {/* Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant={risk.badgeVariant} className="mb-2">
                  {risk.label}
                </Badge>
                <h1 className="text-2xl font-bold text-zinc-900">
                  {inspection.articleCode}
                </h1>
                <p className="text-zinc-600 mt-1">
                  {inspection.buyerName} • {inspection.type === "final" ? "Final" : "Inline"} Inspection
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Key info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">PO Number</p>
                <p className="font-medium">{inspection.poNumber || "-"}</p>
              </div>
              <div>
                <p className="text-zinc-500">Lot Size</p>
                <p className="font-medium">{inspection.lotSize} pcs</p>
              </div>
              <div>
                <p className="text-zinc-500">Sample Size</p>
                <p className="font-medium">{inspection.sampleSize} pcs</p>
              </div>
              <div>
                <p className="text-zinc-500">Date</p>
                <p className="font-medium">{formatDate(inspection.createdAt)}</p>
              </div>
            </div>

            {/* Defect summary */}
            <div className="mt-4 p-4 bg-zinc-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-red-600">{inspection.criticalDefectsFound}</p>
                  <p className="text-xs text-zinc-500">Critical</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{inspection.majorDefectsFound}</p>
                  <p className="text-xs text-zinc-500">Major</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-600">{inspection.minorDefectsFound}</p>
                  <p className="text-xs text-zinc-500">Minor</p>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {inspection.aiSummary && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm font-medium text-emerald-800 mb-1">AI Summary</p>
                <p className="text-sm text-emerald-700">{inspection.aiSummary}</p>
              </div>
            )}

            {/* Actions */}
            {inspection.riskScore !== "green" && !inspection.ownerAction && (
              <div className="mt-6 flex gap-3">
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  onClick={() => handleAction("ship")}
                  disabled={isActioning}
                >
                  {isActioning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Approve & Ship
                </Button>
                <Button variant="outline" onClick={() => handleAction("hold")} disabled={isActioning}>
                  Hold
                </Button>
                <Button variant="outline" onClick={() => handleAction("rework")} disabled={isActioning}>
                  Send for Rework
                </Button>
              </div>
            )}

            {inspection.ownerAction && (
              <div className="mt-6 p-4 bg-zinc-100 rounded-lg">
                <p className="text-sm text-zinc-600">
                  Decision: <span className="font-semibold capitalize text-zinc-900">{inspection.ownerAction}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklist Items */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Photos */}
        {inspection.photos && inspection.photos.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inspection.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative aspect-square bg-zinc-100 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={photo}
                      alt={`Inspection photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
