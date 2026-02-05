// ==========================================
// User & Organization Types
// ==========================================

export type UserRole = "owner" | "inspector" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string;
  photoUrl?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  tier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
  settings: OrgSettings;
}

export interface OrgSettings {
  defaultInspectionType: InspectionType;
  emailDistribution: string[];
  brandColor?: string;
  reportFooter?: string;
  autoAiSummary: boolean;
  defaultAqlLevel: AqlLevel;
}

// ==========================================
// Subscription Types
// ==========================================

export type SubscriptionTier = "starter" | "growth" | "professional" | "enterprise";

export interface Subscription {
  orgId: string;
  tier: SubscriptionTier;
  inspectionsLimit: number;
  inspectionsUsed: number;
  usersLimit: number;
  usersCount: number;
  features: SubscriptionFeatures;
  billingCycle: "monthly" | "yearly";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  status: "active" | "cancelled" | "past_due" | "trialing";
}

export interface SubscriptionFeatures {
  aiSummary: boolean;
  brandedPdfs: boolean;
  buyerPortal: boolean;
  apiAccess: boolean;
  customWorkflows: boolean;
  dedicatedSupport: boolean;
  multiLanguage: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, {
  inspections: number;
  users: number;
  price: number;
  features: SubscriptionFeatures;
}> = {
  starter: {
    inspections: 15,
    users: 1,
    price: 0,
    features: {
      aiSummary: false,
      brandedPdfs: false,
      buyerPortal: false,
      apiAccess: false,
      customWorkflows: false,
      dedicatedSupport: false,
      multiLanguage: false,
    },
  },
  growth: {
    inspections: 100,
    users: 5,
    price: 6499,
    features: {
      aiSummary: true,
      brandedPdfs: true,
      buyerPortal: false,
      apiAccess: false,
      customWorkflows: false,
      dedicatedSupport: false,
      multiLanguage: false,
    },
  },
  professional: {
    inspections: 500,
    users: 20,
    price: 16499,
    features: {
      aiSummary: true,
      brandedPdfs: true,
      buyerPortal: true,
      apiAccess: true,
      customWorkflows: false,
      dedicatedSupport: false,
      multiLanguage: true,
    },
  },
  enterprise: {
    inspections: Infinity,
    users: Infinity,
    price: 41499,
    features: {
      aiSummary: true,
      brandedPdfs: true,
      buyerPortal: true,
      apiAccess: true,
      customWorkflows: true,
      dedicatedSupport: true,
      multiLanguage: true,
    },
  },
};

// ==========================================
// Inspection Types
// ==========================================

export type InspectionType = "final" | "inline" | "on_loom" | "bazar";
export type InspectionStatus = "draft" | "submitted" | "reviewed";
export type InspectionResult = "pass" | "fail" | "pending";
export type RiskScore = "green" | "amber" | "red";
export type OwnerAction = "ship" | "hold" | "rework";
export type AqlLevel = "I" | "II" | "III";

export interface Inspection {
  id: string;
  orgId: string;
  inspectorId: string;
  inspectorName: string;
  type: InspectionType;
  status: InspectionStatus;
  result: InspectionResult;

  // Product details
  buyerName: string;
  buyerCode?: string;
  articleCode: string;
  articleDescription?: string;
  poNumber?: string;
  lotSize: number;
  sampleSize: number;

  // Defects
  criticalDefectsFound: number;
  majorDefectsFound: number;
  minorDefectsFound: number;
  totalDefectsFound: number;

  // AQL
  aqlLevel: AqlLevel;
  majorAqlLimit: number;
  minorAqlLimit: number;

  // AI & Risk
  riskScore: RiskScore;
  aiSummary?: string;

  // Owner action
  ownerAction?: OwnerAction;
  ownerActionAt?: Date;
  ownerActionBy?: string;
  ownerNotes?: string;

  // Report
  reportUrl?: string;
  reportGeneratedAt?: Date;

  // Media
  photos: string[];

  // Location
  location?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
}

// ==========================================
// Checklist Types
// ==========================================

export type ChecklistStatus = "ok" | "not_ok" | "na" | "pending";

export interface ChecklistItem {
  id: string;
  inspectionId: string;
  category: string;
  checkpoint: string;
  status: ChecklistStatus;
  remarks?: string;
  autoRemarks?: string;
  photos: string[];
  defects: Defect[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistTemplate {
  id: string;
  orgId: string;
  name: string;
  type: InspectionType;
  items: ChecklistTemplateItem[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistTemplateItem {
  category: string;
  checkpoint: string;
  order: number;
}

// ==========================================
// Defect Types
// ==========================================

export type DefectSeverity = "critical" | "major" | "minor";
export type DefectCategory = "visual" | "construction" | "design" | "dimension" | "finishing" | "contamination" | "other";

export interface Defect {
  id: string;
  code: DefectCode;
  name: string;
  category: DefectCategory;
  severity: DefectSeverity;
  description?: string;
  photos: string[];
  count: number;
}

export type DefectCode =
  | "WRP-6IN"    // Warp Count (per 6 inches)
  | "WFT-6IN"    // Weft Count (per 6 inches)
  | "PIL-HGT"    // Pile Height Variation
  | "GSM-VAR"    // GSM Out of Tolerance
  | "CLR-VAR"    // Color Variation
  | "CRN-STR"    // Corners Not Straight/Square
  | "BND-4IN"    // Binding (per 4 inches)
  | "PLY-CNT"    // Ply Count in Weaving
  | "CAD-MIS"    // Not as per Approved CAD
  | "DIM-LEN"    // Length Out of Tolerance
  | "DIM-WID"    // Width Out of Tolerance
  | "FRG-DEF"    // Fringe Defect/Uneven
  | "STN-OIL"    // Oil/Grease Stain
  | "KNT-DNS"    // Knot Density Variation
  | "BCK-FIN";   // Backing Finish Issue

export const DEFECT_CODES: Record<DefectCode, {
  name: string;
  category: DefectCategory;
  defaultSeverity: DefectSeverity;
}> = {
  "WRP-6IN": { name: "Warp Count (per 6 inches)", category: "construction", defaultSeverity: "major" },
  "WFT-6IN": { name: "Weft Count (per 6 inches)", category: "construction", defaultSeverity: "major" },
  "PIL-HGT": { name: "Pile Height Variation", category: "construction", defaultSeverity: "major" },
  "GSM-VAR": { name: "GSM Out of Tolerance", category: "construction", defaultSeverity: "major" },
  "CLR-VAR": { name: "Color Variation", category: "visual", defaultSeverity: "major" },
  "CRN-STR": { name: "Corners Not Straight/Square", category: "dimension", defaultSeverity: "major" },
  "BND-4IN": { name: "Binding (per 4 inches)", category: "finishing", defaultSeverity: "minor" },
  "PLY-CNT": { name: "Ply Count in Weaving", category: "construction", defaultSeverity: "major" },
  "CAD-MIS": { name: "Not as per Approved CAD", category: "design", defaultSeverity: "critical" },
  "DIM-LEN": { name: "Length Out of Tolerance", category: "dimension", defaultSeverity: "major" },
  "DIM-WID": { name: "Width Out of Tolerance", category: "dimension", defaultSeverity: "major" },
  "FRG-DEF": { name: "Fringe Defect/Uneven", category: "finishing", defaultSeverity: "minor" },
  "STN-OIL": { name: "Oil/Grease Stain", category: "contamination", defaultSeverity: "critical" },
  "KNT-DNS": { name: "Knot Density Variation", category: "construction", defaultSeverity: "major" },
  "BCK-FIN": { name: "Backing Finish Issue", category: "finishing", defaultSeverity: "minor" },
};

// ==========================================
// Default Checklist Items
// ==========================================

export const DEFAULT_CHECKLIST_ITEMS: ChecklistTemplateItem[] = [
  // Dimensions & Measurements
  { category: "Dimensions", checkpoint: "Length within tolerance (±2%)", order: 1 },
  { category: "Dimensions", checkpoint: "Width within tolerance (±2%)", order: 2 },
  { category: "Dimensions", checkpoint: "Corners straight and square (90°)", order: 3 },
  { category: "Dimensions", checkpoint: "Pile height as per spec", order: 4 },

  // Construction Parameters
  { category: "Construction", checkpoint: "Warp count per 6 inches verified", order: 5 },
  { category: "Construction", checkpoint: "Weft count per 6 inches verified", order: 6 },
  { category: "Construction", checkpoint: "GSM within tolerance", order: 7 },
  { category: "Construction", checkpoint: "Knot density as per specification", order: 8 },
  { category: "Construction", checkpoint: "Number of ply in weaving correct", order: 9 },

  // Visual & Design
  { category: "Visual", checkpoint: "Rug matches approved CAD design", order: 10 },
  { category: "Visual", checkpoint: "Color matches approved sample/swatch", order: 11 },
  { category: "Visual", checkpoint: "No color bleeding or migration", order: 12 },
  { category: "Visual", checkpoint: "No visible stains or marks", order: 13 },

  // Finishing Quality
  { category: "Finishing", checkpoint: "Binding count per 4 inches verified", order: 14 },
  { category: "Finishing", checkpoint: "Fringe length uniform and even", order: 15 },
  { category: "Finishing", checkpoint: "Back finish quality acceptable", order: 16 },

  // Packaging & Labels
  { category: "Packaging", checkpoint: "Correct SKU/article label attached", order: 17 },
  { category: "Packaging", checkpoint: "Care instructions included", order: 18 },
  { category: "Packaging", checkpoint: "Packaging clean and undamaged", order: 19 },
];

// ==========================================
// Draft Types (for offline storage)
// ==========================================

export interface InspectionDraft {
  id: string;
  orgId: string;
  inspectorId: string;
  data: Partial<Inspection>;
  items: Partial<ChecklistItem>[];
  photosToUpload: { itemId?: string; file: Blob; localUrl: string }[];
  completedItems: number;
  totalItems: number;
  lastSavedAt: Date;
  createdAt: Date;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==========================================
// Filter Types
// ==========================================

export interface InspectionFilters {
  status?: InspectionStatus[];
  riskScore?: RiskScore[];
  type?: InspectionType[];
  result?: InspectionResult[];
  buyerName?: string;
  articleCode?: string;
  dateFrom?: Date;
  dateTo?: Date;
  inspectorId?: string;
}

// ==========================================
// Stats Types
// ==========================================

export interface DashboardStats {
  critical: number;
  review: number;
  clear: number;
  total: number;
}

export interface InspectorStats {
  drafts: number;
  todaySubmissions: number;
}
