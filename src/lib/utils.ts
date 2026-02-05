import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatInspectionType(type: string): string {
  const labels: Record<string, string> = {
    final: "Final",
    inline: "Inline",
    on_loom: "On Loom",
    bazar: "Bazar",
  };
  return labels[type] || type;
}

export function calculateAQLResult(
  lotSize: number,
  majorDefects: number,
  minorDefects: number
): { result: "pass" | "fail"; sampleSize: number; majorLimit: number; minorLimit: number } {
  // ANSI Z1.4-2008 Level II sampling plan
  const aqlTable = [
    { maxLot: 50, sample: 8, majorLimit: 0, minorLimit: 1 },
    { maxLot: 90, sample: 13, majorLimit: 1, minorLimit: 2 },
    { maxLot: 150, sample: 20, majorLimit: 1, minorLimit: 3 },
    { maxLot: 280, sample: 32, majorLimit: 2, minorLimit: 5 },
    { maxLot: 500, sample: 50, majorLimit: 3, minorLimit: 7 },
    { maxLot: 1200, sample: 80, majorLimit: 5, minorLimit: 10 },
    { maxLot: 3200, sample: 125, majorLimit: 7, minorLimit: 14 },
    { maxLot: 10000, sample: 200, majorLimit: 10, minorLimit: 21 },
    { maxLot: Infinity, sample: 315, majorLimit: 14, minorLimit: 21 },
  ];

  const plan = aqlTable.find((p) => lotSize <= p.maxLot) || aqlTable[aqlTable.length - 1];
  const result = majorDefects <= plan.majorLimit && minorDefects <= plan.minorLimit ? "pass" : "fail";

  return {
    result,
    sampleSize: plan.sample,
    majorLimit: plan.majorLimit,
    minorLimit: plan.minorLimit,
  };
}

export function calculateRiskScore(
  majorDefects: number,
  minorDefects: number,
  criticalDefects: number = 0
): "green" | "amber" | "red" {
  if (criticalDefects > 0 || majorDefects >= 4) return "red";
  if (majorDefects >= 2 || minorDefects >= 6) return "amber";
  return "green";
}

export function generateInspectionId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `INS-${year}${month}-${random}`;
}

export function compressImage(file: File, maxWidth: number = 1920): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
