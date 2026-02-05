"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, ClipboardCheck, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  createOrganization,
  createUser,
  db,
} from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { UserRole, SubscriptionTier, OrgSettings, TIER_LIMITS } from "@/types";

// ==========================================
// Types
// ==========================================

type OnboardingStep = "welcome" | "company" | "profile" | "complete";

interface FormData {
  companyName: string;
  role: UserRole;
  userName: string;
  phone: string;
}

// ==========================================
// Step Components
// ==========================================

interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext: () => void;
  isLoading: boolean;
}

function WelcomeStep({ onNext }: Omit<StepProps, "formData" | "setFormData" | "isLoading">) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
        <ClipboardCheck className="h-8 w-8 text-white" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-zinc-900">Welcome to Inspectra</h1>
      <p className="mt-2 text-zinc-500">
        Let&apos;s set up your account in just a few steps.
      </p>
      <div className="mt-8 space-y-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
            1
          </div>
          <span className="text-sm text-zinc-600">Tell us about your company</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
            2
          </div>
          <span className="text-sm text-zinc-600">Set up your profile</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
            3
          </div>
          <span className="text-sm text-zinc-600">Start inspecting!</span>
        </div>
      </div>
      <Button className="mt-8 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600" onClick={onNext}>
        Get Started
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function CompanyStep({ formData, setFormData, onNext, isLoading }: StepProps) {
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setError("Company name is required");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100">
        <Building2 className="h-6 w-6 text-emerald-600" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-zinc-900">Your Company</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Enter your company or factory name.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            placeholder="e.g., Rajasthan Rugs Pvt Ltd"
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            className="mt-1"
            autoFocus
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div>
          <Label>Your Role</Label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "owner" })}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${
                formData.role === "owner"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-zinc-200 hover:border-emerald-300"
              }`}
            >
              <p className="font-medium text-zinc-900">Owner / Manager</p>
              <p className="mt-1 text-xs text-zinc-500">
                Review inspections, take decisions
              </p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "inspector" })}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${
                formData.role === "inspector"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-zinc-200 hover:border-emerald-300"
              }`}
            >
              <p className="font-medium text-zinc-900">Inspector</p>
              <p className="mt-1 text-xs text-zinc-500">
                Conduct QC inspections
              </p>
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600" disabled={isLoading}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function ProfileStep({ formData, setFormData, onNext, isLoading }: StepProps) {
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100">
        <User className="h-6 w-6 text-emerald-600" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-zinc-900">Your Profile</h2>
      <p className="mt-1 text-sm text-zinc-500">
        How should we address you?
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="userName">Your Name</Label>
          <Input
            id="userName"
            placeholder="e.g., Rajesh Kumar"
            value={formData.userName}
            onChange={(e) =>
              setFormData({ ...formData, userName: e.target.value })
            }
            className="mt-1"
            autoFocus
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g., +91 98765 43210"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Complete Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

// ==========================================
// Main Onboarding Component
// ==========================================

export default function OnboardingPage() {
  const router = useRouter();
  const { firebaseUser, refreshUser } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    role: "owner",
    userName: "",
    phone: "",
  });

  const handleComplete = async () => {
    if (!firebaseUser?.email) {
      setError("No authenticated user found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create organization
      const slug = formData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const defaultSettings: OrgSettings = {
        defaultInspectionType: "final",
        emailDistribution: [firebaseUser.email],
        autoAiSummary: true,
        defaultAqlLevel: "II",
      };

      const orgId = await createOrganization({
        name: formData.companyName,
        slug,
        tier: "starter" as SubscriptionTier,
        email: firebaseUser.email,
        settings: defaultSettings,
      });

      // Create user in organization
      await createUser(orgId, {
        email: firebaseUser.email,
        name: formData.userName,
        role: formData.role,
        orgId,
        phone: formData.phone || undefined,
      });

      // Create subscription record
      const now = new Date();
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      if (!db) {
        throw new Error("Database not initialized");
      }

      await setDoc(doc(db, "subscriptions", orgId), {
        orgId,
        tier: "starter",
        inspectionsLimit: 15,
        inspectionsUsed: 0,
        usersLimit: 1,
        usersCount: 1,
        features: {
          aiSummary: false,
          brandedPdfs: false,
          buyerPortal: false,
          apiAccess: false,
          customWorkflows: false,
          dedicatedSupport: false,
          multiLanguage: false,
        },
        billingCycle: "monthly",
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
        status: "active",
      });

      // Refresh user context
      await refreshUser();

      // Navigate to appropriate dashboard
      if (formData.role === "owner" || formData.role === "admin") {
        router.push("/owner");
      } else {
        router.push("/inspector");
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      let errorMessage = "Failed to create account. Please try again.";
      if (err instanceof Error) {
        if (err.message.includes("permission-denied") || err.message.includes("PERMISSION_DENIED")) {
          errorMessage = "Firestore security rules are blocking access. Please check Firebase Console.";
        } else if (err.message.includes("not-found") || err.message.includes("NOT_FOUND")) {
          errorMessage = "Firestore database not found. Please enable Firestore in Firebase Console.";
        } else if (err.message.includes("unavailable") || err.message.includes("UNAVAILABLE")) {
          errorMessage = "Database unavailable. Please enable Firestore in Firebase Console.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step === "welcome") {
      setStep("company");
    } else if (step === "company") {
      setStep("profile");
    } else if (step === "profile") {
      handleComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      <Card className="relative w-full max-w-md border-zinc-200 bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl">
        <CardContent className="p-6">
          {/* Progress indicator */}
          {step !== "welcome" && (
            <div className="mb-6 flex gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  step === "company" || step === "profile"
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                    : "bg-zinc-200"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  step === "profile" ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-zinc-200"
                }`}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Step content */}
          {step === "welcome" && <WelcomeStep onNext={handleNext} />}
          {step === "company" && (
            <CompanyStep
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              isLoading={isLoading}
            />
          )}
          {step === "profile" && (
            <ProfileStep
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
