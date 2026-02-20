"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Package,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { InspectorHeader } from "@/components/layout/InspectorHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxWithAdd } from "@/components/ui/combobox-with-add";
import {
  createInspection,
  batchCreateChecklistItems,
  getDropdownOptions,
  addBuyer,
  addArticleCode,
  addLocation,
  type DropdownOptions,
} from "@/lib/firebase";
import { calculateAQLResult, generateInspectionId } from "@/lib/utils";
import type {
  InspectionType,
  AqlLevel,
  ChecklistItem,
  DEFAULT_CHECKLIST_ITEMS,
} from "@/types";

// ==========================================
// Types
// ==========================================

type WizardStep = "type" | "details" | "confirm";

interface FormData {
  type: InspectionType;
  buyerName: string;
  buyerCode: string;
  articleCode: string;
  articleDescription: string;
  poNumber: string;
  lotSize: number;
  location: string;
  aqlLevel: AqlLevel;
}

// ==========================================
// Default Checklist Items
// ==========================================

const CHECKLIST_BY_TYPE: Record<InspectionType, { category: string; checkpoint: string; order: number }[]> = {
  final: [
    { category: "Dimensions", checkpoint: "Length within tolerance (±2%)", order: 1 },
    { category: "Dimensions", checkpoint: "Width within tolerance (±2%)", order: 2 },
    { category: "Dimensions", checkpoint: "Corners straight and square (90°)", order: 3 },
    { category: "Dimensions", checkpoint: "Pile height as per spec", order: 4 },
    { category: "Construction", checkpoint: "Warp count per 6 inches verified", order: 5 },
    { category: "Construction", checkpoint: "Weft count per 6 inches verified", order: 6 },
    { category: "Construction", checkpoint: "GSM within tolerance", order: 7 },
    { category: "Construction", checkpoint: "Knot density as per specification", order: 8 },
    { category: "Construction", checkpoint: "Number of ply in weaving correct", order: 9 },
    { category: "Visual", checkpoint: "Rug matches approved CAD design", order: 10 },
    { category: "Visual", checkpoint: "Color matches approved sample/swatch", order: 11 },
    { category: "Visual", checkpoint: "No color bleeding or migration", order: 12 },
    { category: "Visual", checkpoint: "No visible stains or marks", order: 13 },
    { category: "Finishing", checkpoint: "Binding count per 4 inches verified", order: 14 },
    { category: "Finishing", checkpoint: "Fringe length uniform and even", order: 15 },
    { category: "Finishing", checkpoint: "Back finish quality acceptable", order: 16 },
    { category: "Packaging", checkpoint: "Correct SKU/article label attached", order: 17 },
    { category: "Packaging", checkpoint: "Care instructions included", order: 18 },
    { category: "Packaging", checkpoint: "Packaging clean and undamaged", order: 19 },
  ],
  inline: [
    { category: "Raw Material", checkpoint: "Yarn lot number verified", order: 1 },
    { category: "Raw Material", checkpoint: "Color lot consistency checked", order: 2 },
    { category: "Raw Material", checkpoint: "Fiber composition as per spec", order: 3 },
    { category: "Raw Material", checkpoint: "Yarn ply count correct", order: 4 },
    { category: "Raw Material", checkpoint: "No contamination in yarn", order: 5 },
    { category: "Weaving Progress", checkpoint: "Warp tension uniform across loom", order: 6 },
    { category: "Weaving Progress", checkpoint: "Weft beat consistent", order: 7 },
    { category: "Weaving Progress", checkpoint: "Warp count on track (per 6 inches)", order: 8 },
    { category: "Weaving Progress", checkpoint: "Weft count on track (per 6 inches)", order: 9 },
    { category: "Weaving Progress", checkpoint: "Pattern following approved CAD", order: 10 },
    { category: "In-Process Quality", checkpoint: "No weaving defects visible", order: 11 },
    { category: "In-Process Quality", checkpoint: "Color sequence as per design", order: 12 },
    { category: "In-Process Quality", checkpoint: "Edge formation straight", order: 13 },
    { category: "In-Process Quality", checkpoint: "Pile height uniform (if applicable)", order: 14 },
    { category: "In-Process Quality", checkpoint: "GSM spot check within range", order: 15 },
  ],
  on_loom: [
    { category: "Loom Setup", checkpoint: "Loom properly tensioned", order: 1 },
    { category: "Loom Setup", checkpoint: "Warp beam aligned correctly", order: 2 },
    { category: "Loom Setup", checkpoint: "Reed spacing as per spec", order: 3 },
    { category: "Loom Setup", checkpoint: "Heddle frames in good condition", order: 4 },
    { category: "Loom Setup", checkpoint: "Take-up roller functioning", order: 5 },
    { category: "Weaving Quality", checkpoint: "Warp count per 6 inches correct", order: 6 },
    { category: "Weaving Quality", checkpoint: "Weft count per 6 inches correct", order: 7 },
    { category: "Weaving Quality", checkpoint: "Selvedge edges forming properly", order: 8 },
    { category: "Weaving Quality", checkpoint: "Pattern matching CAD design", order: 9 },
    { category: "Weaving Quality", checkpoint: "Color placement as per design", order: 10 },
    { category: "Material Check", checkpoint: "Yarn quality consistent", order: 11 },
    { category: "Material Check", checkpoint: "Correct ply being used", order: 12 },
    { category: "Material Check", checkpoint: "No yarn breakage issues", order: 13 },
    { category: "Material Check", checkpoint: "Color lot consistency", order: 14 },
    { category: "Material Check", checkpoint: "Pile insertion uniform (if applicable)", order: 15 },
    { category: "Progress", checkpoint: "Weaving progress on schedule", order: 16 },
    { category: "Progress", checkpoint: "Estimated completion date realistic", order: 17 },
    { category: "Progress", checkpoint: "Weaver skill level adequate", order: 18 },
  ],
  bazar: [
    { category: "Initial Assessment", checkpoint: "Overall appearance acceptable", order: 1 },
    { category: "Initial Assessment", checkpoint: "No major visible defects", order: 2 },
    { category: "Initial Assessment", checkpoint: "Colors as per requirement", order: 3 },
    { category: "Initial Assessment", checkpoint: "Size approximately correct", order: 4 },
    { category: "Initial Assessment", checkpoint: "Construction type verified", order: 5 },
    { category: "Construction Check", checkpoint: "Warp count per 6 inches acceptable", order: 6 },
    { category: "Construction Check", checkpoint: "Weft count per 6 inches acceptable", order: 7 },
    { category: "Construction Check", checkpoint: "Knot density satisfactory", order: 8 },
    { category: "Construction Check", checkpoint: "Pile height uniform", order: 9 },
    { category: "Construction Check", checkpoint: "GSM spot check acceptable", order: 10 },
    { category: "Quality Parameters", checkpoint: "No color bleeding when rubbed", order: 11 },
    { category: "Quality Parameters", checkpoint: "No loose threads visible", order: 12 },
    { category: "Quality Parameters", checkpoint: "Backing quality acceptable", order: 13 },
    { category: "Quality Parameters", checkpoint: "Edges and binding intact", order: 14 },
    { category: "Quality Parameters", checkpoint: "Fringe condition (if applicable)", order: 15 },
    { category: "Condition", checkpoint: "No stains or marks", order: 16 },
    { category: "Condition", checkpoint: "No moth damage or holes", order: 17 },
    { category: "Condition", checkpoint: "No odor issues", order: 18 },
    { category: "Condition", checkpoint: "Ready for purchase/shipment", order: 19 },
  ],
};

// Default items for backward compatibility
const DEFAULT_ITEMS = CHECKLIST_BY_TYPE.final;

// ==========================================
// Step 1: Select Inspection Type
// ==========================================

interface TypeStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext: () => void;
}

function TypeStep({ formData, setFormData, onNext }: TypeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">
          What type of inspection?
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Choose the inspection type based on production stage.
        </p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => {
            setFormData({ ...formData, type: "final" });
            onNext();
          }}
          className={`rounded-2xl border-2 p-5 text-left transition-all ${
            formData.type === "final"
              ? "border-emerald-500 bg-emerald-50"
              : "border-zinc-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100">
              <Package className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Final Inspection</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Pre-shipment QC for finished goods ready to ship. Uses AQL sampling.
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setFormData({ ...formData, type: "inline" });
            onNext();
          }}
          className={`rounded-2xl border-2 p-5 text-left transition-all ${
            formData.type === "inline"
              ? "border-emerald-500 bg-emerald-50"
              : "border-zinc-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-emerald-100">
              <ClipboardList className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Inline Inspection</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Production floor spot checks during manufacturing. Quick assessments.
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setFormData({ ...formData, type: "on_loom" });
            onNext();
          }}
          className={`rounded-2xl border-2 p-5 text-left transition-all ${
            formData.type === "on_loom"
              ? "border-emerald-500 bg-emerald-50"
              : "border-zinc-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
              <Layers className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">On Loom Inspection</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Quality check while rug is still on the loom. Catch issues early.
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setFormData({ ...formData, type: "bazar" });
            onNext();
          }}
          className={`rounded-2xl border-2 p-5 text-left transition-all ${
            formData.type === "bazar"
              ? "border-emerald-500 bg-emerald-50"
              : "border-zinc-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Bazar Inspection</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Quality assessment for rugs sourced from bazar/market. Pre-purchase check.
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// Step 2: Enter Details
// ==========================================

interface DetailsStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext: () => void;
  onBack: () => void;
  dropdownOptions: DropdownOptions;
  onAddBuyer: (name: string) => Promise<void>;
  onAddArticleCode: (code: string) => Promise<void>;
  onAddLocation: (location: string) => Promise<void>;
}

function DetailsStep({
  formData,
  setFormData,
  onNext,
  onBack,
  dropdownOptions,
  onAddBuyer,
  onAddArticleCode,
  onAddLocation,
}: DetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.buyerName.trim()) {
      newErrors.buyerName = "Buyer name is required";
    }
    if (!formData.articleCode.trim()) {
      newErrors.articleCode = "Article code is required";
    }
    if (!formData.lotSize || formData.lotSize <= 0) {
      newErrors.lotSize = "Lot size must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  // Auto-fill buyer code when buyer is selected
  const handleBuyerChange = (name: string) => {
    const buyer = dropdownOptions.buyers.find(b => b.name === name);
    setFormData({
      ...formData,
      buyerName: name,
      buyerCode: buyer?.code || formData.buyerCode
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">
          Product Details
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Enter the product and order information.
        </p>
      </div>

      {/* Buyer */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <Label>Buyer Name *</Label>
          <ComboboxWithAdd
            value={formData.buyerName}
            onChange={handleBuyerChange}
            options={dropdownOptions.buyers.map(b => b.name)}
            onAddOption={onAddBuyer}
            placeholder="Select or add buyer..."
            searchPlaceholder="Search buyers..."
            emptyText="No buyers yet. Type to add one."
            className={errors.buyerName ? "border-red-500" : ""}
          />
          {errors.buyerName && (
            <p className="mt-1 text-xs text-red-600">{errors.buyerName}</p>
          )}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="buyerCode">Buyer Code</Label>
          <Input
            id="buyerCode"
            placeholder="e.g., PB"
            value={formData.buyerCode}
            onChange={(e) =>
              setFormData({ ...formData, buyerCode: e.target.value })
            }
          />
        </div>
      </div>

      {/* Article */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <Label>Article Code *</Label>
          <ComboboxWithAdd
            value={formData.articleCode}
            onChange={(value) => setFormData({ ...formData, articleCode: value })}
            options={dropdownOptions.articleCodes}
            onAddOption={onAddArticleCode}
            placeholder="Select or add article..."
            searchPlaceholder="Search articles..."
            emptyText="No articles yet. Type to add one."
            className={errors.articleCode ? "border-red-500" : ""}
          />
          {errors.articleCode && (
            <p className="mt-1 text-xs text-red-600">{errors.articleCode}</p>
          )}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="poNumber">PO Number</Label>
          <Input
            id="poNumber"
            placeholder="e.g., PO-2025-001"
            value={formData.poNumber}
            onChange={(e) =>
              setFormData({ ...formData, poNumber: e.target.value })
            }
          />
        </div>
      </div>

      {/* Lot Size and AQL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lotSize">Lot Size (pcs) *</Label>
          <Input
            id="lotSize"
            type="number"
            placeholder="e.g., 500"
            value={formData.lotSize || ""}
            onChange={(e) =>
              setFormData({ ...formData, lotSize: parseInt(e.target.value) || 0 })
            }
            className={errors.lotSize ? "border-red-500" : ""}
          />
          {errors.lotSize && (
            <p className="mt-1 text-xs text-red-600">{errors.lotSize}</p>
          )}
        </div>
        <div>
          <Label htmlFor="aqlLevel">AQL Level</Label>
          <Select
            value={formData.aqlLevel}
            onValueChange={(value) =>
              setFormData({ ...formData, aqlLevel: value as AqlLevel })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="I">Level I (Tighter)</SelectItem>
              <SelectItem value="II">Level II (Standard)</SelectItem>
              <SelectItem value="III">Level III (Reduced)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location */}
      <div>
        <Label>Inspection Location</Label>
        <ComboboxWithAdd
          value={formData.location}
          onChange={(value) => setFormData({ ...formData, location: value })}
          options={dropdownOptions.locations}
          onAddOption={onAddLocation}
          placeholder="Select or add location..."
          searchPlaceholder="Search locations..."
          emptyText="No locations yet. Type to add one."
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// ==========================================
// Step 3: Confirm and Create
// ==========================================

interface ConfirmStepProps {
  formData: FormData;
  onBack: () => void;
  onCreate: () => void;
  isLoading: boolean;
}

function ConfirmStep({ formData, onBack, onCreate, isLoading }: ConfirmStepProps) {
  const aqlResult = calculateAQLResult(formData.lotSize, formData.aqlLevel || "II");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">
          Confirm & Start
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Review the inspection details before starting.
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Type</span>
            <span className="text-sm font-medium capitalize">
              {formData.type} Inspection
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Buyer</span>
            <span className="text-sm font-medium">{formData.buyerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Article</span>
            <span className="text-sm font-medium">{formData.articleCode}</span>
          </div>
          {formData.poNumber && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">PO Number</span>
              <span className="text-sm font-medium">{formData.poNumber}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Lot Size</span>
            <span className="text-sm font-medium">{formData.lotSize} pcs</span>
          </div>
        </CardContent>
      </Card>

      {/* AQL Info */}
      {formData.type === "final" && (
        <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-emerald-800">AQL Sampling Plan</h3>
            <div className="mt-2 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-700">{aqlResult.sampleSize}</p>
                <p className="text-xs text-emerald-600">Sample Size</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{aqlResult.majorLimit}</p>
                <p className="text-xs text-emerald-600">Major Limit</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{aqlResult.minorLimit}</p>
                <p className="text-xs text-emerald-600">Minor Limit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist preview */}
      <div className="rounded-xl border border-zinc-200 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-medium text-zinc-900">
            {DEFAULT_ITEMS.length} checklist items ready
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Standard QC checklist will be loaded. You can add custom items later.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onCreate} className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Start Inspection
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// Main Wizard Component
// ==========================================

export default function NewInspectionPage() {
  const router = useRouter();
  const { orgId, user } = useAuth();
  const [step, setStep] = useState<WizardStep>("type");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    buyers: [],
    articleCodes: [],
    locations: [],
  });

  const [formData, setFormData] = useState<FormData>({
    type: "final",
    buyerName: "",
    buyerCode: "",
    articleCode: "",
    articleDescription: "",
    poNumber: "",
    lotSize: 0,
    location: "",
    aqlLevel: "II",
  });

  // Load dropdown options
  useEffect(() => {
    if (!orgId) return;

    const loadOptions = async () => {
      try {
        const options = await getDropdownOptions(orgId);
        setDropdownOptions(options);
      } catch (error) {
        console.error("Error loading dropdown options:", error);
      }
    };

    loadOptions();
  }, [orgId]);

  // Handlers for adding new options
  const handleAddBuyer = async (name: string) => {
    if (!orgId) return;
    await addBuyer(orgId, { name, code: "" });
    setDropdownOptions(prev => ({
      ...prev,
      buyers: [...prev.buyers, { name, code: "" }]
    }));
  };

  const handleAddArticleCode = async (code: string) => {
    if (!orgId) return;
    await addArticleCode(orgId, code);
    setDropdownOptions(prev => ({
      ...prev,
      articleCodes: [...prev.articleCodes, code]
    }));
  };

  const handleAddLocation = async (location: string) => {
    if (!orgId) return;
    await addLocation(orgId, location);
    setDropdownOptions(prev => ({
      ...prev,
      locations: [...prev.locations, location]
    }));
  };

  const handleCreate = async () => {
    if (!orgId || !user) {
      setError("Not authenticated");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Calculate AQL
      const aqlResult = calculateAQLResult(formData.lotSize, formData.aqlLevel || "II");

      // Create inspection
      const inspectionId = await createInspection(orgId, {
        orgId,
        inspectorId: user.id,
        inspectorName: user.name,
        type: formData.type,
        status: "draft",
        result: "pending",
        buyerName: formData.buyerName,
        buyerCode: formData.buyerCode || undefined,
        articleCode: formData.articleCode,
        articleDescription: formData.articleDescription || undefined,
        poNumber: formData.poNumber || undefined,
        lotSize: formData.lotSize,
        sampleSize: aqlResult.sampleSize,
        criticalDefectsFound: 0,
        majorDefectsFound: 0,
        minorDefectsFound: 0,
        totalDefectsFound: 0,
        aqlLevel: formData.aqlLevel,
        majorAqlLimit: aqlResult.majorLimit,
        minorAqlLimit: aqlResult.minorLimit,
        riskScore: "green",
        photos: [],
        location: formData.location || undefined,
      });

      // Create checklist items based on inspection type
      const typeChecklist = CHECKLIST_BY_TYPE[formData.type] || DEFAULT_ITEMS;
      const checklistItems = typeChecklist.map((item) => ({
        inspectionId,
        category: item.category,
        checkpoint: item.checkpoint,
        status: "pending" as const,
        photos: [],
        defects: [],
        order: item.order,
      }));

      await batchCreateChecklistItems(orgId, inspectionId, checklistItems);

      // Navigate to inspection
      router.push(`/inspector/inspection/${inspectionId}`);
    } catch (err) {
      console.error("Error creating inspection:", err);
      setError("Failed to create inspection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <InspectorHeader
        title="New Inspection"
        showBack
        onBack={() => router.push("/inspector")}
      />

      <div className="p-4">
        {/* Progress */}
        <div className="mb-6 flex gap-2">
          <div
            className={`h-1.5 flex-1 rounded-full ${
              step === "type" || step === "details" || step === "confirm"
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                : "bg-zinc-200"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full ${
              step === "details" || step === "confirm"
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                : "bg-zinc-200"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full ${
              step === "confirm" ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-zinc-200"
            }`}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step content */}
        {step === "type" && (
          <TypeStep
            formData={formData}
            setFormData={setFormData}
            onNext={() => setStep("details")}
          />
        )}
        {step === "details" && (
          <DetailsStep
            formData={formData}
            setFormData={setFormData}
            onNext={() => setStep("confirm")}
            onBack={() => setStep("type")}
            dropdownOptions={dropdownOptions}
            onAddBuyer={handleAddBuyer}
            onAddArticleCode={handleAddArticleCode}
            onAddLocation={handleAddLocation}
          />
        )}
        {step === "confirm" && (
          <ConfirmStep
            formData={formData}
            onBack={() => setStep("details")}
            onCreate={handleCreate}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
