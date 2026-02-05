"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Camera, MessageSquare, Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PhotoCapture } from "./PhotoCapture";
import { DefectPicker } from "./DefectPicker";
import { cn } from "@/lib/utils";
import type { ChecklistItem as ChecklistItemType, ChecklistStatus, Defect } from "@/types";

// ==========================================
// Types
// ==========================================

interface ChecklistItemProps {
  item: ChecklistItemType;
  onUpdate: (updates: Partial<ChecklistItemType>) => void;
  onUploadPhoto: (file: Blob) => Promise<string>;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  disabled?: boolean;
}

// ==========================================
// Status Button Component
// ==========================================

interface StatusButtonProps {
  status: ChecklistStatus;
  currentStatus: ChecklistStatus;
  onClick: () => void;
  disabled?: boolean;
}

function StatusButton({ status, currentStatus, onClick, disabled }: StatusButtonProps) {
  const isActive = status === currentStatus;

  const configs: Record<ChecklistStatus, {
    label: string;
    icon: React.ReactNode;
    activeClass: string;
    inactiveClass: string;
  }> = {
    ok: {
      label: "OK",
      icon: <Check className="h-4 w-4" />,
      activeClass: "bg-green-500 text-white border-green-500",
      inactiveClass: "border-green-200 text-green-600 hover:bg-green-50",
    },
    not_ok: {
      label: "NOT OK",
      icon: <X className="h-4 w-4" />,
      activeClass: "bg-red-500 text-white border-red-500",
      inactiveClass: "border-red-200 text-red-600 hover:bg-red-50",
    },
    na: {
      label: "N/A",
      icon: <Minus className="h-4 w-4" />,
      activeClass: "bg-zinc-400 text-white border-zinc-400",
      inactiveClass: "border-zinc-200 text-zinc-500 hover:bg-zinc-50",
    },
    pending: {
      label: "Pending",
      icon: null,
      activeClass: "",
      inactiveClass: "",
    },
  };

  const config = configs[status];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-1 rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all",
        isActive ? config.activeClass : config.inactiveClass,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {config.icon}
      {config.label}
    </button>
  );
}

// ==========================================
// Checklist Item Component
// ==========================================

export function ChecklistItemComponent({
  item,
  onUpdate,
  onUploadPhoto,
  isExpanded = false,
  onToggleExpand,
  disabled = false,
}: ChecklistItemProps) {
  const [showRemarks, setShowRemarks] = useState(false);

  const handleStatusChange = (status: ChecklistStatus) => {
    onUpdate({ status });

    // Auto-expand if NOT OK is selected
    if (status === "not_ok" && onToggleExpand && !isExpanded) {
      onToggleExpand();
    }
  };

  const handleRemarksChange = (remarks: string) => {
    onUpdate({ remarks });
  };

  const handlePhotosChange = (photos: { id: string; url: string }[]) => {
    onUpdate({ photos: photos.map((p) => p.url) });
  };

  const handleDefectsChange = (defects: Defect[]) => {
    onUpdate({ defects });
  };

  const hasContent = item.photos.length > 0 || item.defects.length > 0 || item.remarks;
  const defectCount = item.defects.reduce((sum, d) => sum + d.count, 0);

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all",
        item.status === "not_ok"
          ? "border-red-200 bg-red-50/50"
          : item.status === "ok"
          ? "border-green-200 bg-green-50/30"
          : "border-zinc-200 bg-white"
      )}
    >
      {/* Header */}
      <div className="p-4">
        {/* Category badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            {item.category}
          </Badge>
          {hasContent && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1 text-zinc-400 hover:text-zinc-600"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Checkpoint text */}
        <p className="mt-2 text-sm font-medium text-zinc-900">{item.checkpoint}</p>

        {/* Status buttons */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatusButton
            status="ok"
            currentStatus={item.status}
            onClick={() => handleStatusChange("ok")}
            disabled={disabled}
          />
          <StatusButton
            status="not_ok"
            currentStatus={item.status}
            onClick={() => handleStatusChange("not_ok")}
            disabled={disabled}
          />
          <StatusButton
            status="na"
            currentStatus={item.status}
            onClick={() => handleStatusChange("na")}
            disabled={disabled}
          />
        </div>

        {/* Quick action buttons (when collapsed) */}
        {!isExpanded && item.status !== "pending" && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowRemarks(true);
                onToggleExpand?.();
              }}
              disabled={disabled}
              className="text-xs"
            >
              <MessageSquare className="mr-1 h-3 w-3" />
              {item.remarks ? "Edit note" : "Add note"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand?.()}
              disabled={disabled}
              className="text-xs"
            >
              <Camera className="mr-1 h-3 w-3" />
              {item.photos.length > 0 ? `${item.photos.length} photos` : "Add photo"}
            </Button>
            {item.status === "not_ok" && defectCount > 0 && (
              <Badge variant="red" className="text-[10px]">
                {defectCount} defect{defectCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-zinc-200/50 p-4 space-y-4">
          {/* Remarks */}
          <div>
            <label className="text-xs font-medium text-zinc-500">Notes</label>
            <Textarea
              value={item.remarks || ""}
              onChange={(e) => handleRemarksChange(e.target.value)}
              placeholder="Add any observations or notes..."
              disabled={disabled}
              className="mt-1"
              rows={2}
            />
            {item.autoRemarks && (
              <p className="mt-1 text-xs text-zinc-400 italic">
                AI suggestion: {item.autoRemarks}
              </p>
            )}
          </div>

          {/* Photos */}
          <div>
            <label className="text-xs font-medium text-zinc-500">Photos</label>
            <div className="mt-1">
              <PhotoCapture
                photos={item.photos.map((url) => ({ id: url, url }))}
                onPhotosChange={handlePhotosChange}
                onUpload={onUploadPhoto}
                maxPhotos={5}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Defects (only for NOT OK items) */}
          {item.status === "not_ok" && (
            <div>
              <label className="text-xs font-medium text-zinc-500">Defects Found</label>
              <div className="mt-1">
                <DefectPicker
                  defects={item.defects}
                  onDefectsChange={handleDefectsChange}
                  onUploadPhoto={onUploadPhoto}
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// Checklist Group Component
// ==========================================

interface ChecklistGroupProps {
  category: string;
  items: ChecklistItemType[];
  onUpdateItem: (itemId: string, updates: Partial<ChecklistItemType>) => void;
  onUploadPhoto: (file: Blob) => Promise<string>;
  disabled?: boolean;
}

export function ChecklistGroup({
  category,
  items,
  onUpdateItem,
  onUploadPhoto,
  disabled = false,
}: ChecklistGroupProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const completedCount = items.filter((i) => i.status !== "pending").length;
  const notOkCount = items.filter((i) => i.status === "not_ok").length;

  return (
    <div className="space-y-3">
      {/* Category header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">{category}</h3>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{completedCount}/{items.length}</span>
          {notOkCount > 0 && (
            <Badge variant="red" className="text-[10px]">
              {notOkCount} issue{notOkCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <ChecklistItemComponent
            key={item.id}
            item={item}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onUploadPhoto={onUploadPhoto}
            isExpanded={expandedItems.has(item.id)}
            onToggleExpand={() => toggleExpand(item.id)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
