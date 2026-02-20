/**
 * razorpay.ts — Client-side Razorpay helpers
 *
 * Dynamically loads the Razorpay checkout script, creates subscriptions
 * via the API, and opens the payment modal.
 */

import { auth } from "@/lib/firebase";

// ==========================================
// Script Loader
// ==========================================

let _scriptLoaded = false;

/**
 * Dynamically loads checkout.razorpay.com/v1/checkout.js.
 * Safe to call multiple times — loads only once.
 */
export function loadRazorpayScript(): Promise<void> {
  if (_scriptLoaded && typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay checkout is not available in a server environment"));
      return;
    }

    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      _scriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      _scriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error("Failed to load Razorpay checkout script. Check your internet connection."));
    };

    document.head.appendChild(script);
  });
}

// ==========================================
// Helper: get Firebase ID token
// ==========================================

async function getIdToken(): Promise<string> {
  const user = auth?.currentUser;
  if (!user) throw new Error("Not authenticated. Please sign in first.");
  return user.getIdToken();
}

// ==========================================
// API Calls
// ==========================================

export interface CreateSubscriptionResult {
  subscriptionId: string;
  shortUrl?: string;
}

/**
 * Calls POST /api/create-subscription and returns the Razorpay subscription ID.
 *
 * @param planKey - e.g. "growth_inr", "growth_usd", "professional_inr", etc.
 */
export async function createSubscription(
  planKey: string
): Promise<CreateSubscriptionResult> {
  const token = await getIdToken();

  const res = await fetch("/api/create-subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planKey }),
  });

  const data = (await res.json()) as {
    error?: string;
    subscriptionId?: string;
    shortUrl?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || `Server error: ${res.status}`);
  }

  if (!data.subscriptionId) {
    throw new Error("No subscription ID returned from server");
  }

  return {
    subscriptionId: data.subscriptionId,
    shortUrl: data.shortUrl,
  };
}

export interface SubscriptionStatus {
  tier: string;
  status: string;
  subscriptionId?: string;
  razorpayStatus?: string;
}

/**
 * Calls GET /api/get-subscription and returns current subscription status.
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const token = await getIdToken();

  const res = await fetch("/api/get-subscription", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await res.json()) as SubscriptionStatus & { error?: string };

  if (!res.ok) {
    throw new Error(data.error || `Server error: ${res.status}`);
  }

  return data;
}

// ==========================================
// Checkout Modal
// ==========================================

export interface CheckoutUser {
  name?: string;
  email?: string;
  phone?: string;
}

export interface OpenCheckoutOptions {
  subscriptionId: string;
  user: CheckoutUser;
  planLabel: string;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_subscription_id?: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
}

/**
 * Opens the Razorpay checkout modal for a subscription.
 * Loads the script if not already loaded.
 */
export async function openCheckout(options: OpenCheckoutOptions): Promise<void> {
  await loadRazorpayScript();

  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_RAZORPAY_KEY_ID is not set. Add it to your .env.local file."
    );
  }

  const rzp = new window.Razorpay({
    key,
    subscription_id: options.subscriptionId,
    name: "RugQC",
    description: `${options.planLabel} Plan — Monthly Subscription`,
    image: "/logo.png",
    prefill: {
      name: options.user.name,
      email: options.user.email,
      contact: options.user.phone,
    },
    theme: {
      color: "#10b981",
    },
    recurring: true,
    handler: options.onSuccess,
    modal: {
      ondismiss: options.onDismiss,
      confirm_close: true,
      animation: true,
    },
  });

  rzp.open();
}
