/**
 * POST /api/razorpay-webhook
 *
 * Handles Razorpay webhook events for subscription lifecycle management.
 *
 * Verifies the HMAC-SHA256 signature using RAZORPAY_WEBHOOK_SECRET.
 *
 * Handled events:
 *   subscription.activated  → update tier + limits in Firestore
 *   subscription.charged    → update tier + reset monthly usage
 *   subscription.cancelled  → downgrade to starter
 *   subscription.halted     → downgrade to starter (payment failed)
 *   subscription.completed  → downgrade to starter
 *   subscription.pending    → mark status pending
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ==========================================
// Tier limits mapping
// ==========================================

const ALL_FEATURES = {
  aiSummary: true,
  brandedPdfs: true,
  buyerPortal: true,
  apiAccess: true,
  customWorkflows: true,
  dedicatedSupport: true,
  multiLanguage: true,
};

const TIER_LIMITS: Record<
  string,
  {
    inspectionsLimit: number;
    usersLimit: number;
    features: Record<string, boolean>;
  }
> = {
  free: {
    inspectionsLimit: 15,
    usersLimit: 999999,
    features: ALL_FEATURES,
  },
  starter: {
    inspectionsLimit: 30,
    usersLimit: 999999,
    features: ALL_FEATURES,
  },
  growth: {
    inspectionsLimit: 50,
    usersLimit: 999999,
    features: ALL_FEATURES,
  },
};

// ==========================================
// Signature verification
// ==========================================

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not set");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8")
    );
  } catch {
    return false;
  }
}

// ==========================================
// Firestore helpers
// ==========================================

async function upgradeTier(
  orgId: string,
  tier: string,
  subscriptionId: string,
  razorpayStatus: string,
  resetUsage: boolean
) {
  const db = getAdminDb();
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

  const update: Record<string, unknown> = {
    tier,
    status: "active",
    razorpayStatus,
    razorpaySubscriptionId: subscriptionId,
    inspectionsLimit: limits.inspectionsLimit,
    usersLimit: limits.usersLimit,
    features: limits.features,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (resetUsage) {
    update.inspectionsUsed = 0;
  }

  const ref = db.collection("subscriptions").doc(orgId);
  const doc = await ref.get();

  if (doc.exists) {
    await ref.update(update);
  } else {
    await ref.set({
      ...update,
      orgId,
      inspectionsUsed: 0,
      usersCount: 1,
      billingCycle: "monthly",
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  // Also update the organization's tier field
  const orgRef = db.collection("orgs").doc(orgId);
  const orgDoc = await orgRef.get();
  if (orgDoc.exists) {
    await orgRef.update({ tier, updatedAt: FieldValue.serverTimestamp() });
  }
}

async function downgradeTier(
  orgId: string,
  subscriptionId: string,
  razorpayStatus: string
) {
  const db = getAdminDb();
  const limits = TIER_LIMITS.free;

  await db.collection("subscriptions").doc(orgId).set(
    {
      tier: "free",
      status: "cancelled",
      razorpayStatus,
      razorpaySubscriptionId: subscriptionId,
      inspectionsLimit: limits.inspectionsLimit,
      usersLimit: limits.usersLimit,
      features: limits.features,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Also downgrade the organization's tier
  const orgRef = db.collection("orgs").doc(orgId);
  const orgDoc = await orgRef.get();
  if (orgDoc.exists) {
    await orgRef.update({ tier: "free", updatedAt: FieldValue.serverTimestamp() });
  }
}

// ==========================================
// Route handler
// ==========================================

export async function POST(request: NextRequest) {
  // 1. Read raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  // 2. Verify webhook signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[razorpay-webhook] Invalid signature — rejecting request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Parse the event payload
  let payload: {
    event: string;
    payload?: {
      subscription?: {
        entity?: {
          id?: string;
          status?: string;
          notes?: Record<string, string>;
          current_start?: number;
          current_end?: number;
          plan_id?: string;
        };
      };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { event } = payload;
  const entity = payload?.payload?.subscription?.entity;

  if (!entity) {
    // Not a subscription event we care about — acknowledge and move on
    return NextResponse.json({ received: true });
  }

  const subscriptionId = entity.id || "";
  const notes = entity.notes || {};
  const orgId = notes.orgId;
  const tier = notes.tier || "free";
  const razorpayStatus = entity.status || "";

  if (!orgId) {
    console.warn(`[razorpay-webhook] Event "${event}" has no orgId in notes. Sub ID: ${subscriptionId}`);
    return NextResponse.json({ received: true });
  }

  console.log(`[razorpay-webhook] Event: ${event}, OrgId: ${orgId}, Tier: ${tier}`);

  try {
    switch (event) {
      case "subscription.activated":
        // Subscription is active for the first time
        await upgradeTier(orgId, tier, subscriptionId, razorpayStatus, false);
        break;

      case "subscription.charged":
        // Successfully charged — reset monthly usage counter
        await upgradeTier(orgId, tier, subscriptionId, razorpayStatus, true);
        break;

      case "subscription.cancelled":
      case "subscription.halted":
      case "subscription.completed":
        // Downgrade to starter on cancellation or payment failure
        await downgradeTier(orgId, subscriptionId, razorpayStatus);
        break;

      case "subscription.pending":
        // Payment pending — mark status but don't change tier yet
        await getAdminDb()
          .collection("subscriptions")
          .doc(orgId)
          .set(
            {
              razorpayStatus: "pending",
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        break;

      default:
        // Unknown event — log and acknowledge
        console.log(`[razorpay-webhook] Unhandled event: ${event}`);
    }
  } catch (err) {
    console.error(`[razorpay-webhook] Error handling event "${event}":`, err);
    // Return 500 so Razorpay retries
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// Disable Next.js body parsing — we need the raw body for HMAC verification
export const dynamic = "force-dynamic";
