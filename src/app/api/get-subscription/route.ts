/**
 * GET /api/get-subscription
 *
 * Returns the current subscription status for the authenticated user's organization.
 *
 * Request headers:
 *   Authorization: Bearer <Firebase ID token>
 *
 * Response:
 *   { tier, status, subscriptionId?, razorpayStatus? }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken, getAdminDb } from "@/lib/firebase-admin";

// ==========================================
// GET orgId for a Firebase UID
// ==========================================

async function getOrgIdForUid(uid: string): Promise<string | null> {
  const db = getAdminDb();
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

  return null;
}

// ==========================================
// Route handler
// ==========================================

export async function GET(request: NextRequest) {
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

    // 2. Get orgId for this user
    const orgId = await getOrgIdForUid(uid);
    if (!orgId) {
      // Not yet onboarded — return starter defaults
      return NextResponse.json({
        tier: "starter",
        status: "active",
        subscriptionId: null,
        razorpayStatus: null,
      });
    }

    // 3. Read subscription document
    const db = getAdminDb();
    const subDoc = await db.collection("subscriptions").doc(orgId).get();

    if (!subDoc.exists) {
      return NextResponse.json({
        tier: "starter",
        status: "active",
        subscriptionId: null,
        razorpayStatus: null,
      });
    }

    const data = subDoc.data()!;

    return NextResponse.json({
      tier: data.tier || "starter",
      status: data.status || "active",
      subscriptionId: data.razorpaySubscriptionId || null,
      razorpayStatus: data.razorpayStatus || null,
      inspectionsUsed: data.inspectionsUsed || 0,
      inspectionsLimit: data.inspectionsLimit || 15,
      usersLimit: data.usersLimit || 1,
      usersCount: data.usersCount || 1,
      billingCycle: data.billingCycle || "monthly",
      currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString() || null,
    });
  } catch (err) {
    console.error("[get-subscription] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
