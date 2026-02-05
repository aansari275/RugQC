"use client";

import { useState } from "react";
import { Plus, Minus, ChevronRight, X, Camera, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoCapture } from "./PhotoCapture";
import { cn } from "@/lib/utils";
import type { Defect, DefectCode, DefectSeverity, DefectCategory, DEFECT_CODES } from "@/types";
import type { CustomDefect } from "@/lib/firebase";

// ==========================================
// Defect Code Data
// ==========================================

const DEFECT_CODE_DATA: Record<DefectCode, {
  name: string;
  category: DefectCategory;
  defaultSeverity: DefectSeverity;
}> = {
  "CLR-VAR": { name: "Color Variation", category: "visual", defaultSeverity: "major" },
  "WEV-DEF": { name: "Weaving Defect", category: "construction", defaultSeverity: "major" },
  "PAT-MIS": { name: "Pattern Mismatch", category: "design", defaultSeverity: "major" },
  "DIM-LEN": { name: "Length Out of Tolerance", category: "dimension", defaultSeverity: "major" },
  "DIM-WID": { name: "Width Out of Tolerance", category: "dimension", defaultSeverity: "major" },
  "FIN-EDG": { name: "Edge/Binding Defect", category: "finishing", defaultSeverity: "minor" },
  "FIN-FRG": { name: "Fringe Defect", category: "finishing", defaultSeverity: "minor" },
  "STN-OIL": { name: "Oil/Grease Stain", category: "contamination", defaultSeverity: "major" },
  "STN-WAT": { name: "Water Stain", category: "contamination", defaultSeverity: "minor" },
  "STN-INK": { name: "Ink/Dye Stain", category: "contamination", defaultSeverity: "major" },
  "TXT-PIL": { name: "Pilling", category: "visual", defaultSeverity: "minor" },
  "TXT-SNK": { name: "Snag/Pull", category: "visual", defaultSeverity: "minor" },
  "CON-LOO": { name: "Loose Threads", category: "construction", defaultSeverity: "minor" },
  "CON-MIS": { name: "Missing Knots", category: "construction", defaultSeverity: "major" },
  "LAB-MIS": { name: "Label Missing/Wrong", category: "other", defaultSeverity: "minor" },
};

const DEFECT_CODES_LIST = Object.keys(DEFECT_CODE_DATA) as DefectCode[];

const CATEGORY_LABELS: Record<DefectCategory, string> = {
  visual: "Visual",
  construction: "Construction",
  design: "Design",
  dimension: "Dimension",
  finishing: "Finishing",
  contamination: "Contamination",
  other: "Other",
};

const SEVERITY_CONFIG: Record<DefectSeverity, { label: string; color: string; badgeVariant: "red" | "amber" | "secondary" }> = {
  critical: { label: "Critical", color: "text-red-600", badgeVariant: "red" },
  major: { label: "Major", color: "text-amber-600", badgeVariant: "amber" },
  minor: { label: "Minor", color: "text-zinc-600", badgeVariant: "secondary" },
};

// ==========================================
// Types
// ==========================================

interface DefectPickerProps {
  defects: Defect[];
  onDefectsChange: (defects: Defect[]) => void;
  onUploadPhoto: (file: Blob) => Promise<string>;
  customDefects?: CustomDefect[];
  onAddCustomDefect?: (defect: CustomDefect) => Promise<void>;
  disabled?: boolean;
}

interface DefectFormData {
  code: string; // Can be standard code or custom
  severity: DefectSeverity;
  description: string;
  count: number;
  photos: { id: string; url: string }[];
  isCustom: boolean;
  customName: string;
  customCategory: DefectCategory;
}

// ==========================================
// Defect Picker Component
// ==========================================

export function DefectPicker({
  defects,
  onDefectsChange,
  onUploadPhoto,
  customDefects = [],
  onAddCustomDefect,
  disabled = false,
}: DefectPickerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [formData, setFormData] = useState<DefectFormData>({
    code: "",
    severity: "major",
    description: "",
    count: 1,
    photos: [],
    isCustom: false,
    customName: "",
    customCategory: "other",
  });

  // Combine standard and custom defects
  const allDefectCodes = [
    ...DEFECT_CODES_LIST.map(code => ({
      code,
      ...DEFECT_CODE_DATA[code],
      isCustom: false,
    })),
    ...customDefects.map(d => ({
      code: d.code,
      name: d.name,
      category: d.category as DefectCategory,
      defaultSeverity: d.defaultSeverity,
      isCustom: true,
    })),
  ];

  const resetForm = () => {
    setFormData({
      code: "",
      severity: "major",
      description: "",
      count: 1,
      photos: [],
      isCustom: false,
      customName: "",
      customCategory: "other",
    });
    setEditingDefect(null);
    setShowCustomForm(false);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (defect: Defect) => {
    setEditingDefect(defect);
    const isCustomDefect = !DEFECT_CODE_DATA[defect.code as DefectCode];
    setFormData({
      code: defect.code,
      severity: defect.severity,
      description: defect.description || "",
      count: defect.count,
      photos: defect.photos.map((url) => ({ id: url, url })),
      isCustom: isCustomDefect,
      customName: isCustomDefect ? defect.name : "",
      customCategory: defect.category,
    });
    setIsDialogOpen(true);
  };

  const handleCodeChange = (code: string) => {
    if (code === "__custom__") {
      setShowCustomForm(true);
      setFormData({
        ...formData,
        code: "",
        isCustom: true,
        customName: "",
        customCategory: "other",
        severity: "major",
      });
      return;
    }

    setShowCustomForm(false);
    const standardDefect = DEFECT_CODE_DATA[code as DefectCode];
    const customDef = customDefects.find(d => d.code === code);

    if (standardDefect) {
      setFormData({
        ...formData,
        code,
        isCustom: false,
        severity: standardDefect.defaultSeverity,
      });
    } else if (customDef) {
      setFormData({
        ...formData,
        code,
        isCustom: true,
        customName: customDef.name,
        customCategory: customDef.category as DefectCategory,
        severity: customDef.defaultSeverity,
      });
    }
  };

  const handleSaveCustomDefect = async () => {
    if (!onAddCustomDefect || !formData.code || !formData.customName) return;

    setIsSavingCustom(true);
    try {
      await onAddCustomDefect({
        code: formData.code.toUpperCase(),
        name: formData.customName,
        category: formData.customCategory,
        defaultSeverity: formData.severity,
      });
    } catch (error) {
      console.error("Error saving custom defect:", error);
    } finally {
      setIsSavingCustom(false);
    }
  };

  const handleSave = async () => {
    if (!formData.code && !showCustomForm) return;
    if (showCustomForm && (!formData.code || !formData.customName)) return;

    // If it's a new custom defect, save it first
    if (showCustomForm && formData.code && formData.customName && onAddCustomDefect) {
      await handleSaveCustomDefect();
    }

    const isStandard = DEFECT_CODE_DATA[formData.code as DefectCode];
    const customDef = customDefects.find(d => d.code === formData.code);

    let name: string;
    let category: DefectCategory;

    if (isStandard) {
      name = isStandard.name;
      category = isStandard.category;
    } else if (customDef) {
      name = customDef.name;
      category = customDef.category as DefectCategory;
    } else {
      name = formData.customName;
      category = formData.customCategory;
    }

    const newDefect: Defect = {
      id: editingDefect?.id || `defect-${Date.now()}`,
      code: formData.code.toUpperCase() as DefectCode,
      name,
      category,
      severity: formData.severity,
      description: formData.description || undefined,
      count: formData.count,
      photos: formData.photos.map((p) => p.url),
    };

    if (editingDefect) {
      onDefectsChange(defects.map((d) => (d.id === editingDefect.id ? newDefect : d)));
    } else {
      onDefectsChange([...defects, newDefect]);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleRemove = (defectId: string) => {
    onDefectsChange(defects.filter((d) => d.id !== defectId));
  };

  const handlePhotosChange = (photos: { id: string; url: string }[]) => {
    setFormData({ ...formData, photos });
  };

  // Calculate totals
  const criticalCount = defects.filter((d) => d.severity === "critical").reduce((sum, d) => sum + d.count, 0);
  const majorCount = defects.filter((d) => d.severity === "major").reduce((sum, d) => sum + d.count, 0);
  const minorCount = defects.filter((d) => d.severity === "minor").reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {defects.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3">
          <AlertTriangle className="h-5 w-5 text-zinc-400" />
          <div className="flex gap-3 text-sm">
            {criticalCount > 0 && (
              <span className="text-red-600 font-medium">{criticalCount} critical</span>
            )}
            {majorCount > 0 && (
              <span className="text-amber-600 font-medium">{majorCount} major</span>
            )}
            {minorCount > 0 && (
              <span className="text-zinc-600">{minorCount} minor</span>
            )}
          </div>
        </div>
      )}

      {/* Defect list */}
      <div className="space-y-2">
        {defects.map((defect) => {
          const severityConfig = SEVERITY_CONFIG[defect.severity];
          return (
            <div
              key={defect.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 p-3"
            >
              <button
                type="button"
                onClick={() => openEditDialog(defect)}
                className="flex flex-1 items-center gap-3 text-left"
                disabled={disabled}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-500">{defect.code}</span>
                    <Badge variant={severityConfig.badgeVariant} className="text-[10px] px-1.5 py-0">
                      {severityConfig.label}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-zinc-900">{defect.name}</p>
                  {defect.description && (
                    <p className="text-xs text-zinc-500 line-clamp-1">{defect.description}</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </button>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-lg font-semibold text-zinc-900">×{defect.count}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(defect.id)}
                  className="p-1 text-zinc-400 hover:text-red-500"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add button */}
      <Button
        type="button"
        variant="outline"
        onClick={openAddDialog}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Defect
      </Button>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDefect ? "Edit Defect" : "Add Defect"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Defect Code */}
            <div>
              <Label>Defect Type</Label>
              {!showCustomForm ? (
                <Select
                  value={formData.code || undefined}
                  onValueChange={handleCodeChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select defect type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Standard defects */}
                    {DEFECT_CODES_LIST.map((code) => {
                      const data = DEFECT_CODE_DATA[code];
                      return (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-zinc-500">{code}</span>
                            <span>{data.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}

                    {/* Custom defects from org */}
                    {customDefects.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-emerald-600 border-t mt-1 pt-2">
                          Your Custom Defects
                        </div>
                        {customDefects.map((defect) => (
                          <SelectItem key={defect.code} value={defect.code}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-emerald-600">{defect.code}</span>
                              <span>{defect.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}

                    {/* Add custom option */}
                    {onAddCustomDefect && (
                      <SelectItem value="__custom__" className="border-t mt-1 pt-2">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Sparkles className="h-3 w-3" />
                          <span>+ Add Custom Defect</span>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1 space-y-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                    <Sparkles className="h-4 w-4" />
                    Create Custom Defect
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Code</Label>
                      <Input
                        placeholder="e.g., CLR-01"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="mt-1 font-mono text-sm"
                        maxLength={10}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="e.g., Color Bleeding"
                        value={formData.customName}
                        onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Select
                      value={formData.customCategory}
                      onValueChange={(value) => setFormData({ ...formData, customCategory: value as DefectCategory })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomForm(false);
                      setFormData({ ...formData, code: "", isCustom: false });
                    }}
                    className="text-xs"
                  >
                    ← Back to standard defects
                  </Button>
                </div>
              )}
            </div>

            {/* Severity */}
            <div>
              <Label>Severity</Label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {(["critical", "major", "minor"] as DefectSeverity[]).map((sev) => {
                  const config = SEVERITY_CONFIG[sev];
                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: sev })}
                      className={cn(
                        "rounded-lg border-2 p-2 text-sm font-medium transition-colors",
                        formData.severity === sev
                          ? "border-zinc-900 bg-zinc-50"
                          : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Count */}
            <div>
              <Label>Quantity</Label>
              <div className="mt-1 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setFormData({ ...formData, count: Math.max(1, formData.count - 1) })
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={formData.count}
                  onChange={(e) =>
                    setFormData({ ...formData, count: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  className="w-20 text-center"
                  min={1}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFormData({ ...formData, count: formData.count + 1 })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the defect..."
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Photos */}
            <div>
              <Label>Photos</Label>
              <div className="mt-1">
                <PhotoCapture
                  photos={formData.photos}
                  onPhotosChange={handlePhotosChange}
                  onUpload={onUploadPhoto}
                  maxPhotos={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={showCustomForm ? (!formData.code || !formData.customName) : !formData.code}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              {editingDefect ? "Update" : "Add"} Defect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
