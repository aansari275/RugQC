import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, fromUnixTime } from "date-fns";

// ---------------------------------------------------------------------------
// cn — className merge utility
// ---------------------------------------------------------------------------
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// formatDate — handles Date | ISO string | Firestore {_seconds} | undefined
// ---------------------------------------------------------------------------
export function formatDate(
  date: Date | string | { _seconds: number } | undefined,
  fmt: string = "dd MMM yyyy"
): string {
  if (!date) return "N/A";

  try {
    if (typeof date === "object" && "_seconds" in date) {
      return format(fromUnixTime(date._seconds), fmt);
    }

    if (typeof date === "string") {
      return format(parseISO(date), fmt);
    }

    if (date instanceof Date) {
      return format(date, fmt);
    }

    return "N/A";
  } catch {
    return "N/A";
  }
}

// ---------------------------------------------------------------------------
// formatTime — format a date to time string (HH:mm)
// ---------------------------------------------------------------------------
export function formatTime(
  date: Date | string | { _seconds: number } | undefined,
  fmt: string = "HH:mm"
): string {
  return formatDate(date, fmt);
}

// ---------------------------------------------------------------------------
// generateInspectionId — creates a unique inspection reference like INS-20260220-A3K9
// ---------------------------------------------------------------------------
export function generateInspectionId(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `INS-${dateStr}-${suffix}`;
}

// ---------------------------------------------------------------------------
// calculateRiskScore — Red / Amber / Green based on AQL defect thresholds
// ---------------------------------------------------------------------------
export type RiskScore = "green" | "amber" | "red";

export function calculateRiskScore(
  criticalDefects: number,
  majorDefects: number,
  minorDefects: number,
  majorAqlLimit: number,
  minorAqlLimit: number
): RiskScore {
  // Red: any critical defect OR major defects exceed the limit
  if (criticalDefects > 0 || majorDefects > majorAqlLimit) {
    return "red";
  }

  // Amber: major defects are exactly at the limit OR minor defects exceed the limit
  if (majorDefects === majorAqlLimit || minorDefects > minorAqlLimit) {
    return "amber";
  }

  return "green";
}

// ---------------------------------------------------------------------------
// calculateAQLResult — ANSI Z1.4-2008 sampling tables
// Inspection Level I, II, III
// Returns sample size, major accept limit (Ac), minor accept limit (Ac)
// Major AQL = 1.0, Minor AQL = 2.5 (standard textile industry defaults)
// ---------------------------------------------------------------------------

interface AQLResult {
  sampleSize: number;
  majorLimit: number;
  minorLimit: number;
}

// ANSI Z1.4-2008 — Table 1: Sample size code letters by lot size and inspection level
// Format: [minLotSize, maxLotSize, codeI, codeII, codeIII]
const LOT_SIZE_TABLE: [number, number, string, string, string][] = [
  [2, 8, "A", "A", "B"],
  [9, 15, "A", "B", "C"],
  [16, 25, "B", "C", "D"],
  [26, 50, "C", "D", "E"],
  [51, 90, "C", "E", "F"],
  [91, 150, "D", "F", "G"],
  [151, 280, "E", "G", "H"],
  [281, 500, "F", "H", "J"],
  [501, 1200, "G", "J", "K"],
  [1201, 3200, "H", "K", "L"],
  [3201, 10000, "J", "L", "M"],
  [10001, 35000, "K", "M", "N"],
  [35001, 150000, "L", "N", "P"],
  [150001, 500000, "M", "P", "Q"],
  [500001, Infinity, "N", "Q", "R"],
];

// ANSI Z1.4-2008 — Table 2A: Single sampling plans for normal inspection
// Code letter → [sampleSize, Ac at AQL 1.0 (major), Ac at AQL 2.5 (minor)]
// Ac = Accept Number (max defects allowed to accept lot)
const SAMPLE_PLAN: Record<string, [number, number, number]> = {
  A: [2, 0, 0],
  B: [3, 0, 0],
  C: [5, 0, 0],
  D: [8, 0, 0],
  E: [13, 0, 1],
  F: [20, 0, 1],
  G: [32, 1, 2],
  H: [50, 1, 3],
  J: [80, 2, 5],
  K: [125, 3, 7],
  L: [200, 5, 10],
  M: [315, 7, 14],
  N: [500, 10, 21],
  P: [800, 14, 21],
  Q: [1250, 21, 21],
  R: [2000, 21, 21],
};

export function calculateAQLResult(
  lotSize: number,
  aqlLevel: "I" | "II" | "III"
): AQLResult {
  // Find the code letter for this lot size and inspection level
  let codeLetterEntry = LOT_SIZE_TABLE.find(
    ([min, max]) => lotSize >= min && lotSize <= max
  );

  // Default to largest category if somehow out of range
  if (!codeLetterEntry) {
    codeLetterEntry = LOT_SIZE_TABLE[LOT_SIZE_TABLE.length - 1];
  }

  const levelIndex = aqlLevel === "I" ? 2 : aqlLevel === "II" ? 3 : 4;
  const codeLetter = codeLetterEntry[levelIndex];

  const plan = SAMPLE_PLAN[codeLetter];
  if (!plan) {
    // Fallback — should not happen
    return { sampleSize: 32, majorLimit: 1, minorLimit: 2 };
  }

  const [sampleSize, majorLimit, minorLimit] = plan;

  return { sampleSize, majorLimit, minorLimit };
}

// ---------------------------------------------------------------------------
// compressImage — compress a File or Blob via canvas, targeting 500KB-1MB
// ---------------------------------------------------------------------------
export async function compressImage(
  file: File | Blob,
  maxWidth: number = 1400,
  quality: number = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate dimensions preserving aspect ratio
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // First attempt at requested quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob returned null"));
            return;
          }

          // If still over 1MB, do a second pass at lower quality
          if (blob.size > 1_000_000) {
            const reducedQuality = Math.max(0.55, quality - 0.15);
            canvas.toBlob(
              (blob2) => {
                if (!blob2) {
                  reject(new Error("Canvas toBlob (second pass) returned null"));
                  return;
                }
                resolve(blob2);
              },
              "image/jpeg",
              reducedQuality
            );
          } else {
            resolve(blob);
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}

// ---------------------------------------------------------------------------
// getGreeting — time-based greeting string
// ---------------------------------------------------------------------------
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}
