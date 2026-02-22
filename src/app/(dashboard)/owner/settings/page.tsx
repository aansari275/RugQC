"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Loader2,
  Database,
  CheckCircle,
  AlertCircle,
  Check,
  Zap,
  TrendingUp,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { detectCurrency, formatPrice, PLAN_PRICES, type Currency } from "@/lib/geo";
import { createSubscription, openCheckout } from "@/lib/razorpay";

// ==========================================
// Types
// ==========================================

type PlanKey = "starter" | "growth";

interface PlanConfig {
  key: PlanKey;
  name: string;
  icon: React.ReactNode;
  inspections: string;
  users: string;
  features: string[];
  highlight?: boolean;
}

// ==========================================
// Plan definitions
// ==========================================

const PLANS: PlanConfig[] = [
  {
    key: "starter",
    name: "Starter",
    icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
    inspections: "30/month",
    users: "Unlimited",
    features: [
      "30 inspections per month",
      "Unlimited team members",
      "All inspection types (AQL + 100%)",
      "Branded PDF reports with logo",
      "Email reports on submit",
      "Analytics dashboard",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    icon: <Zap className="h-5 w-5 text-emerald-600" />,
    inspections: "50/month",
    users: "Unlimited",
    highlight: true,
    features: [
      "50 inspections per month",
      "Unlimited team members",
      "All inspection types (AQL + 100%)",
      "Branded PDF reports with logo",
      "Email reports on submit",
      "Analytics dashboard",
    ],
  },
];

// ==========================================
// Plan Card Component
// ==========================================

interface PlanCardProps {
  plan: PlanConfig;
  price: number;
  currency: Currency;
  currentTier: string;
  isLoading: boolean;
  onUpgrade: (planKey: PlanKey, currency: Currency) => void;
}

function PlanCard({ plan, price, currency, currentTier, isLoading, onUpgrade }: PlanCardProps) {
  const isCurrentPlan = currentTier === plan.key;

  return (
    <div
      className={`relative rounded-xl border p-5 flex flex-col gap-4 transition-all ${
        plan.highlight
          ? "border-violet-300 bg-gradient-to-br from-violet-50 to-purple-50 shadow-md"
          : isCurrentPlan
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-cyan-50 shadow-sm"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
      }`}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-violet-600 text-white border-none text-xs px-3">
            <Sparkles className="h-3 w-3 mr-1 inline" />
            Most Popular
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-emerald-600 text-white border-none text-xs px-3">
            Current Plan
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-2">
        {plan.icon}
        <h3 className="font-semibold text-zinc-900">{plan.name}</h3>
      </div>

      <div>
        <div className="text-2xl font-bold text-zinc-900">
          {formatPrice(price, currency)}
          <span className="text-sm font-normal text-zinc-500">/month</span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">
          {plan.inspections} inspections, {plan.users} users
        </p>
      </div>

      <ul className="space-y-1.5 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-zinc-700">
            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onUpgrade(plan.key, currency)}
        disabled={isCurrentPlan || isLoading}
        className={
          isCurrentPlan
            ? "bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200"
            : plan.highlight
            ? "bg-violet-600 hover:bg-violet-700 text-white"
            : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
        }
        variant={isCurrentPlan ? "outline" : "default"}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCurrentPlan ? (
          "Active"
        ) : (
          `Upgrade to ${plan.name}`
        )}
      </Button>
    </div>
  );
}

// ==========================================
// Main Settings Page
// ==========================================

export default function SettingsPage() {
  const { organization, subscription, user, orgId, refreshOrganization } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  const [currency, setCurrency] = useState<Currency>("USD");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

  // Detect currency on mount
  useEffect(() => {
    detectCurrency().then(setCurrency);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleSeedData = async () => {
    if (!orgId || !user?.id) {
      setSeedResult({ success: false, message: "Not authenticated" });
      return;
    }

    setIsSeeding(true);
    setSeedResult(null);

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          userId: user.id,
          userName: user?.name || user?.email?.split("@")[0] || "Demo Inspector",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSeedResult({
          success: true,
          message: `Created ${data.inspectionsCreated} demo inspections with ${data.buyers} buyers, ${data.articleCodes} article codes, and ${data.locations} locations.`,
        });
      } else {
        setSeedResult({
          success: false,
          message: data.error || "Failed to seed data",
        });
      }
    } catch {
      setSeedResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleUpgrade = useCallback(
    async (planKey: PlanKey, selectedCurrency: Currency) => {
      if (!user) {
        setUpgradeError("Please sign in to upgrade your plan.");
        return;
      }

      setIsUpgrading(true);
      setUpgradeError(null);
      setUpgradeSuccess(null);

      try {
        // Build the full plan key, e.g. "growth_inr"
        const fullPlanKey = `${planKey}_${selectedCurrency.toLowerCase()}`;

        // Create subscription on server
        const { subscriptionId } = await createSubscription(fullPlanKey);

        // Open Razorpay checkout modal
        await openCheckout({
          subscriptionId,
          user: {
            name: user.name,
            email: user.email,
          },
          planLabel: PLANS.find((p) => p.key === planKey)?.name || planKey,
          onSuccess: async () => {
            setUpgradeSuccess(
              `Successfully upgraded to ${PLANS.find((p) => p.key === planKey)?.name} plan! Your account will be updated shortly.`
            );
            // Refresh subscription from Firestore
            await refreshOrganization();
            setIsUpgrading(false);
          },
          onDismiss: () => {
            setIsUpgrading(false);
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start checkout";
        setUpgradeError(message);
        setIsUpgrading(false);
      }
    },
    [user, refreshOrganization]
  );

  const currentTier = subscription?.tier || "free";

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <div className="p-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
          <p className="text-sm text-zinc-500">Manage your organization and preferences</p>
        </div>

        {/* Organization Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization
            </CardTitle>
            <CardDescription>Your company information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                defaultValue={organization?.name || ""}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={organization?.email || user?.email || ""}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Current Subscription Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Your current plan and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 capitalize">
                    {currentTier} Plan
                  </h3>
                  <Badge variant={subscription?.status === "active" ? "success" : "warning"}>
                    {subscription?.status || "Active"}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-600 mt-1">
                  {subscription?.inspectionsUsed || 0} /{" "}
                  {subscription?.inspectionsLimit === 999999
                    ? "Unlimited"
                    : subscription?.inspectionsLimit || 15}{" "}
                  inspections used this month
                </p>
              </div>
              {currentTier !== "growth" && (
                <p className="text-xs text-zinc-500">
                  Scroll down to upgrade
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Team Members</p>
                <p className="font-medium">
                  {subscription?.usersCount || 1} /{" "}
                  {subscription?.usersLimit === 999999
                    ? "Unlimited"
                    : subscription?.usersLimit || 1}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Billing Cycle</p>
                <p className="font-medium capitalize">
                  {subscription?.billingCycle || "Monthly"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Plans */}
        {currentTier !== "growth" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" />
                Upgrade Your Plan
              </CardTitle>
              <CardDescription>
                Choose a plan that fits your inspection volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Currency toggle */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-zinc-600">Pricing in:</span>
                <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
                  <button
                    onClick={() => setCurrency("INR")}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      currency === "INR"
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    INR
                  </button>
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      currency === "USD"
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>

              {/* Alert messages */}
              {upgradeError && (
                <div className="mb-4 p-3 rounded-lg flex items-start gap-2 bg-red-50 text-red-800 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">{upgradeError}</div>
                  <button onClick={() => setUpgradeError(null)}>
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              )}

              {upgradeSuccess && (
                <div className="mb-4 p-3 rounded-lg flex items-start gap-2 bg-green-50 text-green-800 border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">{upgradeSuccess}</div>
                  <button onClick={() => setUpgradeSuccess(null)}>
                    <X className="h-4 w-4 text-green-500" />
                  </button>
                </div>
              )}

              {/* Plan cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {PLANS.map((plan) => (
                  <PlanCard
                    key={plan.key}
                    plan={plan}
                    price={PLAN_PRICES[plan.key][currency]}
                    currency={currency}
                    currentTier={currentTier}
                    isLoading={isUpgrading}
                    onUpgrade={handleUpgrade}
                  />
                ))}
              </div>

              <p className="text-xs text-zinc-500 text-center mt-4">
                All plans are billed monthly. Cancel anytime. Secure payments via Razorpay.
              </p>

              {/* Test transaction button */}
              <div className="mt-4 pt-4 border-t border-dashed border-zinc-200">
                <button
                  onClick={async () => {
                    if (!user) return;
                    setIsUpgrading(true);
                    setUpgradeError(null);
                    try {
                      const { subscriptionId } = await createSubscription("test_inr");
                      await openCheckout({
                        subscriptionId,
                        user: { name: user.name, email: user.email },
                        planLabel: "Test",
                        onSuccess: async () => {
                          setUpgradeSuccess("Test payment successful! Check your email for confirmation.");
                          await refreshOrganization();
                          setIsUpgrading(false);
                        },
                        onDismiss: () => setIsUpgrading(false),
                      });
                    } catch (err) {
                      setUpgradeError(err instanceof Error ? err.message : "Test checkout failed");
                      setIsUpgrading(false);
                    }
                  }}
                  disabled={isUpgrading}
                  className="w-full text-xs py-2 px-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  {isUpgrading ? "Processing..." : "Test Transaction (₹5)"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure email notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900">Failed Inspections</p>
                  <p className="text-sm text-zinc-500">Get notified when an inspection fails AQL</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900">Daily Summary</p>
                  <p className="text-sm text-zinc-500">Receive a daily summary of all inspections</p>
                </div>
                <input type="checkbox" className="h-4 w-4 accent-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900">Weekly Report</p>
                  <p className="text-sm text-zinc-500">Receive weekly analytics report</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Account security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>

        {/* Demo Data */}
        <Card className="border-dashed border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-600" />
              Demo Data
            </CardTitle>
            <CardDescription>
              Load sample data to explore and showcase the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 mb-4">
              This will create 16 sample inspections with various statuses, 8 sample buyers,
              10 article codes, and 8 inspection locations. Perfect for demos and testing.
            </p>

            {seedResult && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                  seedResult.success
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {seedResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{seedResult.message}</span>
              </div>
            )}

            <Button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Demo Data...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Load Demo Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
