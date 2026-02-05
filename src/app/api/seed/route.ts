import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

// Initialize Firebase for API route
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// Seed Data for Demo
// ==========================================

const BUYERS = [
  { name: "IKEA Sweden", code: "IKEA" },
  { name: "West Elm USA", code: "WELM" },
  { name: "Pottery Barn", code: "PTBR" },
  { name: "Crate & Barrel", code: "CRBL" },
  { name: "Wayfair", code: "WYFR" },
  { name: "Target Home", code: "TRGT" },
  { name: "HomeGoods", code: "HMGD" },
  { name: "Pier 1 Imports", code: "PIR1" },
];

const ARTICLE_CODES = [
  "RUG-KASH-001",
  "RUG-JUTE-002",
  "RUG-WOOL-003",
  "RUG-SILK-004",
  "MAT-DHURR-005",
  "RUG-KILIM-006",
  "RUG-TUFTED-007",
  "RUG-HAND-008",
  "MAT-BRAIDED-009",
  "RUG-SHAG-010",
];

const LOCATIONS = [
  "Bhadohi Unit 1",
  "Bhadohi Unit 2",
  "Mirzapur Factory",
  "Jaipur Artisan Hub",
  "Kashmir Workshop",
  "Panipat Weaving Center",
  "Agra Production Facility",
  "Varanasi Silk Mill",
];

const CHECKLIST_TEMPLATE = {
  final: [
    {
      category: "Dimensions & Measurements",
      items: [
        "Length within tolerance (±2%)",
        "Width within tolerance (±2%)",
        "Corners straight and square (90°)",
        "Diagonal measurements equal",
        "Pile height as per spec",
      ],
    },
    {
      category: "Construction Parameters",
      items: [
        "Warp count per 6 inches verified",
        "Weft count per 6 inches verified",
        "GSM within tolerance",
        "Knot density as per specification",
        "Number of ply in weaving correct",
      ],
    },
    {
      category: "Visual & Design",
      items: [
        "Rug matches approved CAD design",
        "Color matches approved sample/swatch",
        "No color bleeding or migration",
        "Pattern alignment correct",
        "No visible stains or marks",
      ],
    },
    {
      category: "Finishing Quality",
      items: [
        "Binding count per 4 inches verified",
        "Fringe length uniform and even",
        "Selvage edges intact and straight",
        "Back finish quality acceptable",
        "No loose threads or knots",
      ],
    },
    {
      category: "Packaging & Labeling",
      items: [
        "Correct SKU/article label attached",
        "Care instructions included",
        "Country of origin marked",
        "Packaging clean and undamaged",
        "Anti-slip pad included (if required)",
      ],
    },
  ],
  inline: [
    {
      category: "Raw Material Check",
      items: [
        "Yarn lot number verified",
        "Color lot consistency checked",
        "Fiber composition as per spec",
        "Yarn ply count correct",
        "No contamination in yarn",
      ],
    },
    {
      category: "Weaving Progress",
      items: [
        "Warp tension uniform across loom",
        "Weft beat consistent",
        "Warp count on track (per 6 inches)",
        "Weft count on track (per 6 inches)",
        "Pattern following approved CAD",
      ],
    },
    {
      category: "In-Process Quality",
      items: [
        "No weaving defects visible",
        "Color sequence as per design",
        "Edge formation straight",
        "Pile height uniform (if applicable)",
        "GSM spot check within range",
      ],
    },
  ],
  on_loom: [
    {
      category: "Loom Setup",
      items: [
        "Loom properly tensioned",
        "Warp beam aligned correctly",
        "Reed spacing as per spec",
        "Heddle frames in good condition",
        "Take-up roller functioning",
      ],
    },
    {
      category: "Weaving Quality (On Loom)",
      items: [
        "Warp count per 6 inches correct",
        "Weft count per 6 inches correct",
        "Selvedge edges forming properly",
        "Pattern matching CAD design",
        "Color placement as per design",
      ],
    },
    {
      category: "Material Check",
      items: [
        "Yarn quality consistent",
        "Correct ply being used",
        "No yarn breakage issues",
        "Color lot consistency",
        "Pile insertion uniform (if applicable)",
      ],
    },
    {
      category: "Progress & Timeline",
      items: [
        "Weaving progress on schedule",
        "Estimated completion date realistic",
        "No major rework required",
        "Weaver skill level adequate",
      ],
    },
  ],
  bazar: [
    {
      category: "Initial Assessment",
      items: [
        "Overall appearance acceptable",
        "No major visible defects",
        "Colors as per requirement",
        "Size approximately correct",
        "Construction type verified",
      ],
    },
    {
      category: "Construction Check",
      items: [
        "Warp count per 6 inches acceptable",
        "Weft count per 6 inches acceptable",
        "Knot density satisfactory",
        "Pile height uniform",
        "GSM spot check acceptable",
      ],
    },
    {
      category: "Quality Parameters",
      items: [
        "No color bleeding when rubbed",
        "No loose threads visible",
        "Backing quality acceptable",
        "Edges and binding intact",
        "Fringe condition (if applicable)",
      ],
    },
    {
      category: "Condition & Cleanliness",
      items: [
        "No stains or marks",
        "No moth damage or holes",
        "No odor issues",
        "No structural damage",
        "Ready for purchase/shipment",
      ],
    },
  ],
};

const SAMPLE_INSPECTIONS = [
  {
    type: "final" as const,
    status: "submitted" as const,
    buyerIndex: 0, // IKEA
    articleIndex: 0,
    locationIndex: 0,
    lotSize: 500,
    sampleSize: 50,
    aqlLevel: "2.5",
    majorDefectsFound: 12,
    minorDefectsFound: 8,
    criticalDefectsFound: 2,
    riskScore: "red" as const,
    result: "fail" as const,
    poNumber: "PO-IKEA-2026-001",
    aiSummary:
      "Critical inspection failure detected. 2 critical defects found including major color variation in lot center and structural weakness in binding. 12 major defects exceed AQL 2.5 limits. Recommend full lot rework before shipment.",
    daysAgo: 1,
  },
  {
    type: "final" as const,
    status: "submitted" as const,
    buyerIndex: 1, // West Elm
    articleIndex: 2,
    locationIndex: 1,
    lotSize: 200,
    sampleSize: 32,
    aqlLevel: "2.5",
    majorDefectsFound: 5,
    minorDefectsFound: 12,
    criticalDefectsFound: 0,
    riskScore: "amber" as const,
    result: "pass" as const,
    poNumber: "PO-WELM-2026-045",
    aiSummary:
      "Marginal pass with elevated minor defects. Minor staining found in 8 pieces, small weaving inconsistencies in 4 pieces. Within AQL limits but recommend quality discussion with production team.",
    daysAgo: 2,
  },
  {
    type: "final" as const,
    status: "submitted" as const,
    buyerIndex: 2, // Pottery Barn
    articleIndex: 3,
    locationIndex: 4,
    lotSize: 150,
    sampleSize: 20,
    aqlLevel: "1.5",
    majorDefectsFound: 0,
    minorDefectsFound: 2,
    criticalDefectsFound: 0,
    riskScore: "green" as const,
    result: "pass" as const,
    poNumber: "PO-PTBR-2026-089",
    aiSummary:
      "Excellent quality batch. Kashmir silk rugs meet all specifications. Only 2 minor thread pulls noted, within acceptable range. Ready for immediate shipment.",
    daysAgo: 3,
  },
  {
    type: "inline" as const,
    status: "submitted" as const,
    buyerIndex: 3, // Crate & Barrel
    articleIndex: 5,
    locationIndex: 2,
    lotSize: 300,
    sampleSize: 30,
    aqlLevel: "2.5",
    majorDefectsFound: 8,
    minorDefectsFound: 5,
    criticalDefectsFound: 1,
    riskScore: "red" as const,
    result: "fail" as const,
    poNumber: "PO-CRBL-2026-033",
    aiSummary:
      "Production line issue detected during inline check. Critical warp tension problem causing pattern distortion in 15% of pieces. Recommend immediate production halt and machine calibration.",
    daysAgo: 0,
  },
  {
    type: "final" as const,
    status: "submitted" as const,
    buyerIndex: 4, // Wayfair
    articleIndex: 1,
    locationIndex: 3,
    lotSize: 1000,
    sampleSize: 80,
    aqlLevel: "4.0",
    majorDefectsFound: 3,
    minorDefectsFound: 15,
    criticalDefectsFound: 0,
    riskScore: "green" as const,
    result: "pass" as const,
    poNumber: "PO-WYFR-2026-112",
    aiSummary:
      "Large jute rug order passes inspection. Minor natural fiber variations noted (expected for handmade products). Good overall quality for price point. Cleared for shipment.",
    daysAgo: 4,
  },
  {
    type: "final" as const,
    status: "draft" as const,
    buyerIndex: 5, // Target
    articleIndex: 6,
    locationIndex: 5,
    lotSize: 800,
    sampleSize: 80,
    aqlLevel: "2.5",
    majorDefectsFound: 0,
    minorDefectsFound: 0,
    criticalDefectsFound: 0,
    riskScore: "green" as const,
    result: "pending" as const,
    poNumber: "PO-TRGT-2026-078",
    daysAgo: 0,
  },
  {
    type: "inline" as const,
    status: "draft" as const,
    buyerIndex: 6, // HomeGoods
    articleIndex: 4,
    locationIndex: 6,
    lotSize: 250,
    sampleSize: 32,
    aqlLevel: "2.5",
    majorDefectsFound: 0,
    minorDefectsFound: 0,
    criticalDefectsFound: 0,
    riskScore: "green" as const,
    result: "pending" as const,
    poNumber: "PO-HMGD-2026-056",
    daysAgo: 1,
  },
  {
    type: "final" as const,
    status: "reviewed" as const,
    buyerIndex: 0, // IKEA
    articleIndex: 7,
    locationIndex: 0,
    lotSize: 400,
    sampleSize: 50,
    aqlLevel: "2.5",
    majorDefectsFound: 1,
    minorDefectsFound: 4,
    criticalDefectsFound: 0,
    riskScore: "green" as const,
    result: "pass" as const,
    poNumber: "PO-IKEA-2026-098",
    aiSummary:
      "Quality batch ready for shipment. 1 major defect (dimension variance) isolated to single piece - removed from lot. Minor defects within tolerance. Owner approved for shipment.",
    ownerAction: "ship" as const,
    daysAgo: 7,
  },
  {
    type: "final" as const,
    status: "reviewed" as const,
    buyerIndex: 2, // Pottery Barn
    articleIndex: 8,
    locationIndex: 1,
    lotSize: 100,
    sampleSize: 20,
    aqlLevel: "1.5",
    majorDefectsFound: 6,
    minorDefectsFound: 3,
    criticalDefectsFound: 0,
    riskScore: "amber" as const,
    result: "fail" as const,
    poNumber: "PO-PTBR-2026-067",
    aiSummary:
      "Braided mat batch requires rework. Binding inconsistencies found in 30% sample. Production team notified for correction. Owner decision: full lot rework required.",
    ownerAction: "rework" as const,
    daysAgo: 5,
  },
  {
    type: "final" as const,
    status: "reviewed" as const,
    buyerIndex: 7, // Pier 1
    articleIndex: 9,
    locationIndex: 7,
    lotSize: 75,
    sampleSize: 13,
    aqlLevel: "2.5",
    majorDefectsFound: 9,
    minorDefectsFound: 2,
    criticalDefectsFound: 1,
    riskScore: "red" as const,
    result: "fail" as const,
    poNumber: "PO-PIR1-2026-023",
    aiSummary:
      "Shag rug lot fails inspection. Critical pile shedding issue detected. Major defects include uneven pile height and backing delamination. Lot placed on hold pending supplier discussion.",
    ownerAction: "hold" as const,
    daysAgo: 6,
  },
  // On Loom Inspections
  {
    type: "on_loom" as const,
    status: "submitted" as const,
    buyerIndex: 0, // IKEA
    articleIndex: 3,
    locationIndex: 4, // Kashmir
    lotSize: 50,
    sampleSize: 10,
    aqlLevel: "2.5",
    majorDefectsFound: 2,
    minorDefectsFound: 3,
    criticalDefectsFound: 0,
    riskScore: "amber" as const,
    result: "pass" as const,
    poNumber: "PO-IKEA-2026-150",
    aiSummary:
      "On-loom inspection reveals minor tension issues in 2 looms. Warp count slightly low in sections - weaver notified for correction. Pattern alignment good. Recommend follow-up inspection in 3 days.",
    daysAgo: 1,
  },
  {
    type: "on_loom" as const,
    status: "submitted" as const,
    buyerIndex: 2, // Pottery Barn
    articleIndex: 0,
    locationIndex: 3, // Jaipur
    lotSize: 30,
    sampleSize: 8,
    aqlLevel: "1.5",
    majorDefectsFound: 0,
    minorDefectsFound: 1,
    criticalDefectsFound: 0,
    riskScore: "green" as const,
    result: "pass" as const,
    poNumber: "PO-PTBR-2026-112",
    aiSummary:
      "Excellent on-loom quality. Kashmir silk rugs progressing well. Warp and weft counts within spec. Color placement matches CAD perfectly. On track for delivery deadline.",
    daysAgo: 2,
  },
  {
    type: "on_loom" as const,
    status: "draft" as const,
    buyerIndex: 4, // Wayfair
    articleIndex: 5,
    locationIndex: 2, // Mirzapur
    lotSize: 100,
    sampleSize: 15,
    aqlLevel: "2.5",
    majorDefectsFound: 0,
    minorDefectsFound: 0,
    criticalDefectsFound: 0,
    riskScore: "green" as const,
    result: "pending" as const,
    poNumber: "PO-WYFR-2026-089",
    daysAgo: 0,
  },
  // Bazar Inspections
  {
    type: "bazar" as const,
    status: "submitted" as const,
    buyerIndex: 1, // West Elm
    articleIndex: 6,
    locationIndex: 3, // Jaipur
    lotSize: 25,
    sampleSize: 10,
    aqlLevel: "2.5",
    majorDefectsFound: 4,
    minorDefectsFound: 6,
    criticalDefectsFound: 0,
    riskScore: "amber" as const,
    result: "pass" as const,
    poNumber: "BZR-WELM-2026-034",
    aiSummary:
      "Bazar sourcing inspection completed. 4 pieces rejected due to color variation. Remaining lot acceptable quality for price point. Recommend negotiating 10% discount for minor defects.",
    daysAgo: 3,
  },
  {
    type: "bazar" as const,
    status: "submitted" as const,
    buyerIndex: 6, // HomeGoods
    articleIndex: 4,
    locationIndex: 0, // Bhadohi
    lotSize: 40,
    sampleSize: 12,
    aqlLevel: "4.0",
    majorDefectsFound: 1,
    minorDefectsFound: 4,
    criticalDefectsFound: 0,
    riskScore: "green" as const,
    result: "pass" as const,
    poNumber: "BZR-HMGD-2026-067",
    aiSummary:
      "Good quality bazar lot. Dhurrie flatweaves meet specifications. Minor fringe variations in 4 pieces - acceptable for price segment. Cleared for purchase.",
    daysAgo: 4,
  },
  {
    type: "bazar" as const,
    status: "reviewed" as const,
    buyerIndex: 3, // Crate & Barrel
    articleIndex: 2,
    locationIndex: 5, // Panipat
    lotSize: 60,
    sampleSize: 15,
    aqlLevel: "2.5",
    majorDefectsFound: 8,
    minorDefectsFound: 3,
    criticalDefectsFound: 1,
    riskScore: "red" as const,
    result: "fail" as const,
    poNumber: "BZR-CRBL-2026-045",
    aiSummary:
      "Bazar lot rejected. Critical moth damage found in 2 pieces. High color variation across lot indicates mixed batches. Not recommended for purchase - seek alternative supplier.",
    ownerAction: "hold" as const,
    daysAgo: 5,
  },
];

const STANDARD_DEFECTS = [
  { code: "WRP-6IN", name: "Warp Count (per 6 inches)", category: "Construction", severity: "major" },
  { code: "WFT-6IN", name: "Weft Count (per 6 inches)", category: "Construction", severity: "major" },
  { code: "PIL-HGT", name: "Pile Height Variation", category: "Construction", severity: "major" },
  { code: "GSM-VAR", name: "GSM Out of Tolerance", category: "Construction", severity: "major" },
  { code: "CLR-VAR", name: "Color Variation", category: "Visual", severity: "major" },
  { code: "CRN-STR", name: "Corners Not Straight/Square", category: "Dimension", severity: "major" },
  { code: "BND-4IN", name: "Binding (per 4 inches)", category: "Finishing", severity: "minor" },
  { code: "PLY-CNT", name: "Ply Count in Weaving", category: "Construction", severity: "major" },
  { code: "CAD-MIS", name: "Not as per Approved CAD", category: "Design", severity: "critical" },
  { code: "DIM-LEN", name: "Length Out of Tolerance", category: "Dimension", severity: "major" },
  { code: "DIM-WID", name: "Width Out of Tolerance", category: "Dimension", severity: "major" },
  { code: "FRG-DEF", name: "Fringe Defect/Uneven", category: "Finishing", severity: "minor" },
  { code: "STN-OIL", name: "Oil/Grease Stain", category: "Contamination", severity: "critical" },
  { code: "KNT-DNS", name: "Knot Density Variation", category: "Construction", severity: "major" },
  { code: "BCK-FIN", name: "Backing Finish Issue", category: "Finishing", severity: "minor" },
];

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId, userName } = await request.json();

    if (!orgId || !userId) {
      return NextResponse.json(
        { error: "orgId and userId are required" },
        { status: 400 }
      );
    }

    // 1. Seed dropdown options (buyers, article codes, locations)
    const dropdownOptionsRef = doc(db, "orgs", orgId, "settings", "dropdownOptions");
    await setDoc(dropdownOptionsRef, {
      buyers: BUYERS,
      articleCodes: ARTICLE_CODES,
      locations: LOCATIONS,
    });

    // 2. Create inspections with checklist items
    const inspectionIds: string[] = [];

    for (const insp of SAMPLE_INSPECTIONS) {
      const buyer = BUYERS[insp.buyerIndex];
      const articleCode = ARTICLE_CODES[insp.articleIndex];
      const location = LOCATIONS[insp.locationIndex];

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - insp.daysAgo);

      const submittedAt =
        insp.status !== "draft"
          ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) // 2 hours after creation
          : null;

      // Create inspection document
      const inspectionData: Record<string, unknown> = {
        type: insp.type,
        status: insp.status,
        buyerName: buyer.name,
        buyerCode: buyer.code,
        articleCode,
        location,
        lotSize: insp.lotSize,
        sampleSize: insp.sampleSize,
        aqlLevel: insp.aqlLevel,
        majorDefectsFound: insp.majorDefectsFound,
        minorDefectsFound: insp.minorDefectsFound,
        criticalDefectsFound: insp.criticalDefectsFound,
        totalDefectsFound:
          insp.majorDefectsFound + insp.minorDefectsFound + insp.criticalDefectsFound,
        riskScore: insp.riskScore,
        result: insp.result,
        poNumber: insp.poNumber,
        inspectorId: userId,
        inspectorName: userName || "Demo Inspector",
        createdAt: Timestamp.fromDate(createdAt),
        updatedAt: Timestamp.fromDate(new Date()),
        photos: [],
      };

      if (insp.aiSummary) {
        inspectionData.aiSummary = insp.aiSummary;
      }

      if (submittedAt) {
        inspectionData.submittedAt = Timestamp.fromDate(submittedAt);
      }

      if (insp.ownerAction) {
        inspectionData.ownerAction = insp.ownerAction;
        inspectionData.reviewedAt = Timestamp.fromDate(
          new Date(createdAt.getTime() + 4 * 60 * 60 * 1000)
        );
      }

      const inspectionRef = await addDoc(
        collection(db, "orgs", orgId, "inspections"),
        inspectionData
      );

      inspectionIds.push(inspectionRef.id);

      // Create checklist items for this inspection
      const template =
        insp.type === "final" ? CHECKLIST_TEMPLATE.final : CHECKLIST_TEMPLATE.inline;

      const batch = writeBatch(db);
      let itemOrder = 0;

      for (const category of template) {
        for (const checkpoint of category.items) {
          const itemRef = doc(
            collection(db, "orgs", orgId, "inspections", inspectionRef.id, "items")
          );

          // Determine status based on inspection status
          let status: "pending" | "ok" | "not_ok" | "na" = "pending";
          const defects: Array<{
            code: string;
            name: string;
            severity: string;
            count: number;
            notes: string;
            photos: string[];
          }> = [];

          if (insp.status !== "draft") {
            // Randomly assign statuses for completed inspections
            const rand = Math.random();
            if (rand < 0.7) {
              status = "ok";
            } else if (rand < 0.85) {
              status = "not_ok";
              // Add a random defect
              const randomDefect =
                STANDARD_DEFECTS[Math.floor(Math.random() * STANDARD_DEFECTS.length)];
              defects.push({
                code: randomDefect.code,
                name: randomDefect.name,
                severity: randomDefect.severity,
                count: Math.floor(Math.random() * 3) + 1,
                notes: "",
                photos: [],
              });
            } else {
              status = "na";
            }
          }

          batch.set(itemRef, {
            checkpoint,
            category: category.category,
            status,
            defects,
            notes: "",
            photos: [],
            order: itemOrder++,
            createdAt: Timestamp.fromDate(createdAt),
            updatedAt: Timestamp.fromDate(new Date()),
          });
        }
      }

      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: "Demo data seeded successfully",
      inspectionsCreated: inspectionIds.length,
      buyers: BUYERS.length,
      articleCodes: ARTICLE_CODES.length,
      locations: LOCATIONS.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data", details: String(error) },
      { status: 500 }
    );
  }
}
