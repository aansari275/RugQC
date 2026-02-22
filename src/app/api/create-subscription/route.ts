/**
 * POST /api/create-subscription
 *
 * Creates a Razorpay subscription for the authenticated user's organization.
 *
 * Request headers:
 *   Authorization: Bearer <Firebase ID token>
 *
 * Request body:
 *   { planKey: "growth_inr" | "growth_usd" | "professional_inr" | ... }
 *
 * Response:
 *   { subscriptionId: string, shortUrl?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { verifyBearerToken, getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ==========================================
// Razorpay plan key → env var mapping
// ==========================================

const PLAN_ENV_MAP: Record<string, string> = {
  test_inr: "NEXT_PUBLIC_RAZORPAY_PLAN_TEST_INR",
  starter_inr: "NEXT_PUBLIC_RAZORPAY_PLAN_STARTER_INR",
  starter_usd: "NEXT_PUBLIC_RAZORPAY_PLAN_STARTER_USD",
  growth_inr: "NEXT_PUBLIC_RAZORPAY_PLAN_GROWTH_INR",
  growth_usd: "NEXT_PUBLIC_RAZORPAY_PLAN_GROWTH_USD",
};

// ==========================================
// Tier labels derived from plan key
// ==========================================

function tierFromPlanKey(planKey: string): string {
  if (planKey.startsWith("test")) return "starter";
  if (planKey.startsWith("starter")) return "starter";
  if (planKey.startsWith("growth")) return "growth";
  return "free";
}

// ==========================================
// Initialize Razorpay client
// ==========================================

function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables"
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// ==========================================
// GET orgId for a Firebase UID
// ==========================================

async function getOrgIdForUid(uid: string): Promise<string | null> {
  const db = getAdminDb();

  // Search across all orgs for the user with this UID
  const orgsSnap = await db.collection("orgs").get();

  for (const orgDoc of orgsSnap.docs) {
    const userDoc = await db
      .collection("orgs")
      .doc(orgDoc.id)
      .collection("users")
      .doc(uid)
      .get();

    if (userDoc.exists) {
      return orgDoc.id;
    }
  }

  // Fallback: check if user document has orgId field
  return null;
}

// ==========================================
// Route handler
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Firebase token
    const authHeader = request.headers.get("authorization");
    let decoded: Awaited<ReturnType<typeof verifyBearerToken>>;
    try {
      decoded = await verifyBearerToken(authHeader);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Unauthorized" },
        { status: 401 }
      );
    }

    const uid = decoded.uid;
    const email = decoded.email || "";
    const name = decoded.name || email.split("@")[0];

    // 2. Parse request body
    let planKey: string;
    try {
      const body = await request.json();
      planKey = body?.planKey;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!planKey || !PLAN_ENV_MAP[planKey]) {
      return NextResponse.json(
        {
          error: `Invalid planKey: "${planKey}". Valid values: ${Object.keys(PLAN_ENV_MAP).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 3. Get plan ID from environment
    const planId = process.env[PLAN_ENV_MAP[planKey]];
    if (!planId) {
      return NextResponse.json(
        {
          error: `Plan ID not configured. Set the ${PLAN_ENV_MAP[planKey]} environment variable.`,
        },
        { status: 500 }
      );
    }

    // 4. Get orgId for this user
    const orgId = await getOrgIdForUid(uid);
    if (!orgId) {
      return NextResponse.json(
        { error: "User organization not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    const db = getAdminDb();
    const razorpay = getRazorpayClient();

    // 5. Get or create Razorpay customer
    const subscriptionDoc = await db.collection("subscriptions").doc(orgId).get();
    let razorpayCustomerId: string | undefined =
      subscriptionDoc.exists ? subscriptionDoc.data()?.razorpayCustomerId : undefined;

    if (!razorpayCustomerId) {
      const customer = await razorpay.customers.create({
        name,
        email,
        notes: { orgId, uid },
      });
      razorpayCustomerId = customer.id;
    }

    // 6. Create Razorpay subscription
    const tier = tierFromPlanKey(planKey);
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 120, // 10 years max (monthly billing)
      notes: {
        orgId,
        uid,
        tier,
        planKey,
      },
    });

    // 7. Store pending subscription in Firestore
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscriptionData = {
      orgId,
      uid,
      tier,
      status: "created",
      razorpaySubscriptionId: subscription.id,
      razorpayCustomerId,
      planKey,
      planId,
      billingCycle: "monthly",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!subscriptionDoc.exists) {
      // First subscription — initialize with starter limits
      await db
        .collection("subscriptions")
        .doc(orgId)
        .set({
          ...subscriptionData,
          inspectionsUsed: 0,
          inspectionsLimit: 15,
          usersLimit: 999999,
          usersCount: 1,
          createdAt: FieldValue.serverTimestamp(),
          features: {
            aiSummary: true,
            brandedPdfs: true,
            buyerPortal: true,
            apiAccess: true,
            customWorkflows: true,
            dedicatedSupport: true,
            multiLanguage: true,
          },
        });
    } else {
      await db.collection("subscriptions").doc(orgId).update(subscriptionData);
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      shortUrl: (subscription as unknown as Record<string, unknown>).short_url as string | undefined,
    });
  } catch (err) {
    console.error("[create-subscription] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
