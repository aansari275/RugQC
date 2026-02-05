# RugQC - QC Inspection SaaS for Rug & Carpet Manufacturers

## Overview
QC inspection SaaS targeting Indian textile mills, rug/carpet manufacturers, and exporters. Enables factory inspections with automated reports, AI-powered summaries, and exception-based owner dashboards.

## Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **UI Components:** shadcn/ui, Radix UI primitives
- **Auth:** Firebase (Google OAuth + Email/Password)
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage (images)
- **Deployment:** Netlify

## Firebase Project
- **Project ID:** inspectra-app (legacy name)
- **Console:** https://console.firebase.google.com/project/inspectra-app

## GitHub Repo
- **URL:** https://github.com/aansari275/RugQC.git

## Key Routes

### Owner Dashboard (`/owner`)
- Exception-only view (Red/Amber inspections)
- AI-generated summaries
- Quick actions: Ship / Hold / Rework
- Stats: Critical, Review, Clear, Total

### Inspector (`/inspector`)
- New inspection wizard
- Draft inspections
- Submission history

### Inspection Types
1. **Final** - Pre-shipment QC for finished goods
2. **Inline** - Production floor spot checks
3. **On Loom** - Quality check while rug is on loom
4. **Bazar** - Pre-purchase inspection from market

## Industry-Specific Defect Codes

| Code | Name | Category |
|------|------|----------|
| WRP-6IN | Warp Count (per 6 inches) | Construction |
| WFT-6IN | Weft Count (per 6 inches) | Construction |
| PIL-HGT | Pile Height Variation | Construction |
| GSM-VAR | GSM Out of Tolerance | Construction |
| CLR-VAR | Color Variation | Visual |
| CRN-STR | Corners Not Straight/Square | Dimension |
| BND-4IN | Binding (per 4 inches) | Finishing |
| PLY-CNT | Ply Count in Weaving | Construction |
| CAD-MIS | Not as per Approved CAD | Design |
| KNT-DNS | Knot Density Variation | Construction |

## Firestore Schema

```
/orgs/{orgId}/
├── users/{userId}
├── inspections/{inspectionId}
│   └── items/{itemId}          # Checklist items
├── templates/{templateId}
└── settings/
    ├── dropdownOptions         # Buyers, article codes, locations
    └── customDefects           # Org-specific defect types

/subscriptions/{orgId}          # Tier, limits, usage
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Firebase init + all Firestore functions |
| `src/contexts/AuthContext.tsx` | Auth state, role protection |
| `src/types/index.ts` | TypeScript interfaces, defect codes |
| `src/lib/utils.ts` | Helpers (AQL calc, risk score, formatting) |
| `src/app/api/seed/route.ts` | Demo data seeding endpoint |

## Demo Data

Go to **Settings** → **Load Demo Data** to populate:
- 16 sample inspections (all types/statuses)
- 8 buyers (IKEA, West Elm, Pottery Barn, etc.)
- 10 article codes (rug types)
- 8 inspection locations (Indian manufacturing hubs)

## Pricing Tiers

| Tier | Price | Inspections/mo | Users |
|------|-------|----------------|-------|
| Starter | Free | 15 | 1 |
| Growth | ₹6,499/mo | 100 | 5 |
| Professional | ₹16,499/mo | 500 | 20 |
| Enterprise | ₹41,499/mo | Unlimited | Unlimited |

## Running Locally

```bash
npm install
npm run dev
```

Requires `.env.local` with Firebase config:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Firestore Indexes

Required composite indexes are defined in `firestore.indexes.json`. Deploy with:
```bash
firebase deploy --only firestore:indexes --project inspectra-app
```
