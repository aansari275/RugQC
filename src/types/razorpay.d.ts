/**
 * Razorpay.js type declarations
 * Razorpay Checkout v1 — subscription + order modes
 */

interface RazorpayCheckoutOptions {
  key: string;
  subscription_id?: string;
  amount?: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  handler?: (response: RazorpayCheckoutResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    animation?: boolean;
    confirm_close?: boolean;
  };
  recurring?: boolean;
  subscription_card_change?: boolean;
  remember_customer?: boolean;
}

interface RazorpayCheckoutResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
  razorpay_order_id?: string;
}

interface RazorpayCheckoutInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

export {};
