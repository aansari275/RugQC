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

async function getOrgIdForUser(uid: string, email: string): Promise<string | null> {
  const db = getAdminDb();
  const orgsSnap = await db.collection("orgs").get();

  for (const orgDoc of orgsSnap.docs) {
    // Try 1: doc ID = UID
    const byId = await db
      .collection("orgs")
      .doc(orgDoc.id)
      .collection("users")
      .doc(uid)
      .get();
    if (byId.exists) return orgDoc.id;

    // Try 2: uid field
    const byUidField = await db
      .collection("orgs")
      .doc(orgDoc.id)
      .collection("users")
      .where("uid", "==", uid)
      .limit(1)
      .get();
    if (!byUidField.empty) return orgDoc.id;

    // Try 3: email field
    if (email) {
      const byEmail = await db
        .collection("orgs")
        .doc(orgDoc.id)
        .collection("users")
        .where("email", "==", email.toLowerCase())
        .limit(1)
        .get();
      if (!byEmail.empty) return orgDoc.id;
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
    const email = decoded.email || "";

    // 2. Get orgId for this user
    const orgId = await getOrgIdForUser(uid, email);
    if (!orgId) {
      // Not yet onboarded — return starter defaults
      return NextResponse.json({
        tier: "free",
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
        tier: "free",
        status: "active",
        subscriptionId: null,
        razorpayStatus: null,
      });
    }

    const data = subDoc.data()!;

    return NextResponse.json({
      tier: data.tier || "free",
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
