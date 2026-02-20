"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  FileText,
  Check,
  Zap,
  Star,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganization, createUser, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { UserRole, SubscriptionTier, OrgSettings } from "@/types";
import { TIER_LIMITS } from "@/types";

// ==========================================
// Types
// ==========================================

type Step = "org" | "plan" | "submitting";

interface OrgFormData {
  companyName: string;
  phone: string;
  email: string;
  gstNumber: string;
  userName: string;
}

// ==========================================
// Plan data
// ==========================================

const PLAN_DISPLAY: {
  tier: SubscriptionTier;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  popular?: boolean;
}[] = [
  {
    tier: "starter",
    label: "Starter",
    icon: <ClipboardCheck className="h-5 w-5" />,
    color: "text-zinc-600",
    bgColor: "bg-zinc-50",
    borderColor: "border-zinc-200",
  },
  {
    tier: "growth",
    label: "Growth",
    icon: <Zap className="h-5 w-5" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    popular: true,
  },
  {
    tier: "professional",
    label: "Professional",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
  {
    tier: "enterprise",
    label: "Enterprise",
    icon: <Star className="h-5 w-5" />,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
];

// ==========================================
// Step 1: Organisation Details
// ==========================================

interface OrgStepProps {
  formData: OrgFormData;
  setFormData: (data: OrgFormData) => void;
  onNext: () => void;
  firebaseEmail: string;
}

function OrgStep({ formData, setFormData, onNext, firebaseEmail }: OrgStepProps) {
  const [errors, setErrors] = useState<Partial<OrgFormData>>({});

  const validate = () => {
    const newErrors: Partial<OrgFormData> = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.userName.trim()) {
      newErrors.userName = "Your name is required";
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onNext();
  };

  return (
    <div>
      {/* Step header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100">
          <Building2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Organisation Details</h2>
          <p className="text-sm text-zinc-500">Tell us about your business</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name */}
        <div>
          <Label htmlFor="companyName" className="text-sm font-medium text-zinc-700">
            Company / Factory Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            placeholder="e.g., Rajasthan Rugs Pvt Ltd"
            value={formData.companyName}
            onChange={(e) => {
              setFormData({ ...formData, companyName: e.target.value });
              if (errors.companyName) setErrors({ ...errors, companyName: undefined });
            }}
            className={`mt-1.5 h-11 ${errors.companyName ? "border-red-400 focus-visible:ring-red-400" : "border-zinc-200 focus-visible:ring-emerald-500"}`}
            autoFocus
          />
          {errors.companyName && (
            <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
          )}
        </div>

        {/* Your Name */}
        <div>
          <Label htmlFor="userName" className="text-sm font-medium text-zinc-700">
            Your Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              id="userName"
              placeholder="e.g., Rajesh Kumar"
              value={formData.userName}
              onChange={(e) => {
                setFormData({ ...formData, userName: e.target.value });
                if (errors.userName) setErrors({ ...errors, userName: undefined });
              }}
              className={`pl-9 h-11 ${errors.userName ? "border-red-400 focus-visible:ring-red-400" : "border-zinc-200 focus-visible:ring-emerald-500"}`}
            />
          </div>
          {errors.userName && (
            <p className="mt-1 text-xs text-red-600">{errors.userName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-zinc-700">
            Phone Number <span className="text-zinc-400 font-normal">(optional)</span>
          </Label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="pl-9 h-11 border-zinc-200 focus-visible:ring-emerald-500"
            />
          </div>
        </div>

        {/* Business Email */}
        <div>
          <Label htmlFor="bizEmail" className="text-sm font-medium text-zinc-700">
            Business Email <span className="text-zinc-400 font-normal">(optional)</span>
          </Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              id="bizEmail"
              type="email"
              placeholder={firebaseEmail || "business@company.com"}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-9 h-11 border-zinc-200 focus-visible:ring-emerald-500"
            />
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Leave blank to use your sign-in email: {firebaseEmail}
          </p>
        </div>

        {/* GST Number */}
        <div>
          <Label htmlFor="gstNumber" className="text-sm font-medium text-zinc-700">
            GST Number <span className="text-zinc-400 font-normal">(optional)</span>
          </Label>
          <div className="relative mt-1.5">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              id="gstNumber"
              placeholder="e.g., 08AAAAA0000A1Z5"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              className="pl-9 h-11 border-zinc-200 focus-visible:ring-emerald-500 font-mono text-sm"
              maxLength={15}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-200/50 mt-2"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

// ==========================================
// Step 2: Plan Selection
// ==========================================

interface PlanStepProps {
  selectedTier: SubscriptionTier;
  onSelect: (tier: SubscriptionTier) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

function PlanStep({ selectedTier, onSelect, onNext, onBack, isLoading }: PlanStepProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const formatLimit = (n: number) => {
    if (n === Infinity) return "Unlimited";
    return n.toString();
  };

  const getFeatureList = (tier: SubscriptionTier): string[] => {
    const limits = TIER_LIMITS[tier];
    const features: string[] = [
      `${formatLimit(limits.inspections)} inspections/month`,
      `${formatLimit(limits.users)} user${limits.users === 1 ? "" : "s"}`,
    ];
    if (limits.features.aiSummary) features.push("AI summaries");
    if (limits.features.brandedPdfs) features.push("Branded PDF reports");
    if (limits.features.buyerPortal) features.push("Buyer portal");
    if (limits.features.apiAccess) features.push("API access");
    if (limits.features.customWorkflows) features.push("Custom workflows");
    if (limits.features.dedicatedSupport) features.push("Dedicated support");
    return features;
  };

  return (
    <div>
      {/* Step header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100">
          <Star className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Choose Your Plan</h2>
          <p className="text-sm text-zinc-500">Start free, upgrade anytime</p>
        </div>
      </div>

      <div className="space-y-3">
        {PLAN_DISPLAY.map(({ tier, label, icon, color, bgColor, borderColor, popular }) => {
          const limits = TIER_LIMITS[tier];
          const features = getFeatureList(tier);
          const isSelected = selectedTier === tier;

          return (
            <button
              key={tier}
              type="button"
              onClick={() => onSelect(tier)}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/70 shadow-md shadow-emerald-100/50"
                  : `${borderColor} bg-white hover:border-emerald-300 hover:bg-emerald-50/30`
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Plan icon */}
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${bgColor} ${color}`}>
                  {icon}
                </div>

                {/* Plan info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-zinc-900 text-sm">{label}</span>
                    {popular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <Zap className="h-2.5 w-2.5" />
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold text-zinc-900">
                      {formatPrice(limits.price)}
                    </span>
                    {limits.price > 0 && (
                      <span className="text-xs text-zinc-500">/month</span>
                    )}
                  </div>
                  {/* Key features */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {features.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600"
                      >
                        <Check className="h-2.5 w-2.5 text-emerald-500 flex-shrink-0" />
                        {f}
                      </span>
                    ))}
                    {features.length > 3 && (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
                        +{features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Selection indicator */}
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-zinc-400">
        You can change your plan at any time from Settings.
      </p>

      <div className="mt-5 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="h-11 px-4 border-zinc-200 text-zinc-600 hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className="flex-1 h-11 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-200/50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up your workspace...
            </>
          ) : (
            <>
              Launch RugQC
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// Main Onboarding Component
// ==========================================

export default function OnboardingPage() {
  const router = useRouter();
  const { firebaseUser, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>("org");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("starter");

  const [formData, setFormData] = useState<OrgFormData>({
    companyName: "",
    phone: "",
    email: "",
    gstNumber: "",
    userName: firebaseUser?.displayName || "",
  });

  const handleComplete = async () => {
    if (!firebaseUser?.email) {
      setError("No authenticated user found. Please sign in again.");
      return;
    }

    setIsLoading(true);
    setStep("submitting");
    setError("");

    try {
      const slug = formData.companyName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const orgEmail = formData.email.trim() || firebaseUser.email;

      const defaultSettings: OrgSettings = {
        defaultInspectionType: "final",
        emailDistribution: [orgEmail],
        autoAiSummary: selectedTier !== "starter",
        defaultAqlLevel: "II",
      };

      // Step 1: Create organization
      const orgId = await createOrganization({
        name: formData.companyName.trim(),
        slug,
        tier: selectedTier,
        email: orgEmail,
        phone: formData.phone.trim() || undefined,
        gstNumber: formData.gstNumber.trim() || undefined,
        settings: defaultSettings,
      });

      // Step 2: Create user with "owner" role
      await createUser(orgId, {
        email: firebaseUser.email,
        name: formData.userName.trim() || firebaseUser.displayName || firebaseUser.email,
        role: "owner" as UserRole,
        orgId,
        phone: formData.phone.trim() || undefined,
        photoUrl: firebaseUser.photoURL || undefined,
      });

      // Step 3: Create subscription document
      if (!db) {
        throw new Error("Database not initialized. Check Firebase configuration.");
      }

      const tierLimits = TIER_LIMITS[selectedTier];
      const now = new Date();
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      await setDoc(doc(db, "subscriptions", orgId), {
        orgId,
        tier: selectedTier,
        inspectionsLimit: tierLimits.inspections === Infinity ? 999999 : tierLimits.inspections,
        inspectionsUsed: 0,
        usersLimit: tierLimits.users === Infinity ? 999999 : tierLimits.users,
        usersCount: 1,
        features: tierLimits.features,
        billingCycle: "monthly",
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
        status: selectedTier === "starter" ? "active" : "trialing",
      });

      // Step 4: Refresh auth context so user is loaded
      await refreshUser();

      // Redirect to owner dashboard (all onboarding users get owner role)
      router.push("/owner");
    } catch (err) {
      console.error("Onboarding error:", err);
      let errorMessage = "Failed to set up your workspace. Please try again.";
      if (err instanceof Error) {
        if (err.message.includes("permission-denied") || err.message.includes("PERMISSION_DENIED")) {
          errorMessage = "Permission denied. Please check Firestore security rules in Firebase Console.";
        } else if (err.message.includes("not-found") || err.message.includes("NOT_FOUND")) {
          errorMessage = "Firestore database not found. Please enable Firestore in Firebase Console.";
        } else if (err.message.includes("unavailable") || err.message.includes("UNAVAILABLE")) {
          errorMessage = "Service unavailable. Please check your connection and try again.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      setStep("plan");
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = step === "org" ? 0 : 1;
  const totalSteps = 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
              <ClipboardCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900">RugQC</span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">Set up your quality control workspace</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white/90 backdrop-blur-md p-6 shadow-2xl shadow-zinc-200/50">
          {/* Progress bar */}
          {step !== "submitting" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-500">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
                <span className="text-xs text-zinc-400">
                  {step === "org" ? "Organisation" : "Plan"}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Submitting state */}
          {step === "submitting" && (
            <div className="py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-xl mx-auto">
                <ClipboardCheck className="h-8 w-8 text-white" />
              </div>
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto mt-6" />
              <h3 className="mt-4 font-semibold text-zinc-900">Setting up your workspace</h3>
              <p className="mt-1 text-sm text-zinc-500">Creating your organisation and account...</p>
            </div>
          )}

          {/* Step content */}
          {step === "org" && (
            <OrgStep
              formData={formData}
              setFormData={setFormData}
              onNext={() => setStep("plan")}
              firebaseEmail={firebaseUser?.email || ""}
            />
          )}

          {step === "plan" && (
            <PlanStep
              selectedTier={selectedTier}
              onSelect={setSelectedTier}
              onNext={handleComplete}
              onBack={() => setStep("org")}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Step dots */}
        {step !== "submitting" && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= currentStepIndex
                    ? "w-6 bg-gradient-to-r from-emerald-500 to-cyan-500"
                    : "w-1.5 bg-zinc-200"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
