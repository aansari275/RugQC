"use client";

import { useState, useRef } from "react";
import { Camera, X, Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, compressImage } from "@/lib/utils";

// ==========================================
// Types
// ==========================================

interface Photo {
  id: string;
  url: string;
  isUploading?: boolean;
}

interface PhotoCaptureProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  onUpload: (file: Blob) => Promise<string>;
  maxPhotos?: number;
  disabled?: boolean;
  className?: string;
}

// ==========================================
// Photo Capture Component
// ==========================================

export function PhotoCapture({
  photos,
  onPhotosChange,
  onUpload,
  maxPhotos = 5,
  disabled = false,
  className,
}: PhotoCaptureProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = photos.length < maxPhotos;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const tempId = `temp-${Date.now()}`;
    const localUrl = URL.createObjectURL(file);

    // Add placeholder with local URL
    const newPhoto: Photo = {
      id: tempId,
      url: localUrl,
      isUploading: true,
    };
    onPhotosChange([...photos, newPhoto]);

    try {
      // Compress and upload
      const compressed = await compressImage(file);
      const uploadedUrl = await onUpload(compressed);

      // Replace placeholder with uploaded URL
      onPhotosChange(
        photos
          .filter((p) => p.id !== tempId)
          .concat({ id: uploadedUrl, url: uploadedUrl, isUploading: false })
      );
    } catch (error) {
      console.error("Error uploading photo:", error);
      // Remove failed upload
      onPhotosChange(photos.filter((p) => p.id !== tempId));
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemove = (photoId: string) => {
    onPhotosChange(photos.filter((p) => p.id !== photoId));
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || !canAddMore}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || !canAddMore}
      />

      {/* Photo grid */}
      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100"
          >
            {photo.isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              </div>
            ) : (
              <>
                <img
                  src={photo.url}
                  alt="Inspection photo"
                  className="h-full w-full object-cover cursor-pointer"
                  onClick={() => handlePreview(photo.url)}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(photo.id)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        ))}

        {/* Add photo button */}
        {canAddMore && !disabled && (
          <button
            type="button"
            onClick={openCamera}
            className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-400 hover:text-zinc-500 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[10px] mt-1">Add</span>
          </button>
        )}
      </div>

      {/* Action buttons */}
      {photos.length === 0 && !disabled && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCamera}
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openGallery}
            className="flex-1"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Gallery
          </Button>
        </div>
      )}

      {/* Photo count */}
      {photos.length > 0 && (
        <p className="text-xs text-zinc-500">
          {photos.length}/{maxPhotos} photos
        </p>
      )}

      {/* Preview dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="p-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==========================================
// Simple Photo Thumbnail Component
// ==========================================

interface PhotoThumbnailProps {
  url: string;
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function PhotoThumbnail({
  url,
  onRemove,
  onClick,
  size = "md",
}: PhotoThumbnailProps) {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  return (
    <div className={cn("relative rounded-lg overflow-hidden", sizeClasses[size])}>
      <img
        src={url}
        alt="Photo"
        className="h-full w-full object-cover cursor-pointer"
        onClick={onClick}
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
