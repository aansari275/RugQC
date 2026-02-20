/**
 * geo.ts — Currency detection via IP geolocation
 *
 * Returns "INR" if user is in India, "USD" otherwise.
 * Uses ipapi.co (free, no API key needed for low traffic).
 * Falls back to "USD" on any network error.
 */

export type Currency = "INR" | "USD";

let _cachedCurrency: Currency | null = null;

/**
 * Detect user currency based on their IP geolocation.
 * Result is cached in-memory for the lifetime of the page.
 */
export async function detectCurrency(): Promise<Currency> {
  if (_cachedCurrency) return _cachedCurrency;

  try {
    const res = await fetch("https://ipapi.co/json/", {
      // Short timeout so we don't block the UI
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      _cachedCurrency = "USD";
      return "USD";
    }

    const data = (await res.json()) as { country_code?: string };
    _cachedCurrency = data.country_code === "IN" ? "INR" : "USD";
    return _cachedCurrency;
  } catch {
    // Network error, timeout, or AbortSignal — default to USD
    _cachedCurrency = "USD";
    return "USD";
  }
}

/**
 * Format a price for display based on currency.
 */
export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

/**
 * Plan prices per currency.
 */
export const PLAN_PRICES: Record<
  "growth" | "professional" | "enterprise",
  Record<Currency, number>
> = {
  growth: { INR: 6499, USD: 79 },
  professional: { INR: 16499, USD: 199 },
  enterprise: { INR: 41499, USD: 499 },
};
