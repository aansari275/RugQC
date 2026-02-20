"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ClipboardCheck, Loader2, Mail, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, needsOnboarding, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle redirect after authentication
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      if (needsOnboarding) {
        router.push("/onboarding");
      } else if (user?.role === "owner" || user?.role === "admin") {
        router.push("/owner");
      } else {
        router.push("/inspector");
      }
    }
  }, [isAuthenticated, authLoading, needsOnboarding, user, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError("Firebase is not configured. Check environment variables.");
      return;
    }
    setIsGoogleLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // AuthContext will handle redirect
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === "auth/popup-closed-by-user") {
        setError(null); // User cancelled, not an error
      } else {
        setError(firebaseErr.message || "Google sign-in failed. Please try again.");
      }
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase is not configured. Check environment variables.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // AuthContext will handle redirect
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      let message = "Authentication failed. Please try again.";
      const code = firebaseErr.code || "";
      if (code.includes("user-not-found") || code.includes("invalid-credential")) {
        message = "No account found with this email or incorrect password.";
      } else if (code.includes("wrong-password")) {
        message = "Incorrect password. Please try again.";
      } else if (code.includes("email-already-in-use")) {
        message = "An account already exists with this email. Sign in instead.";
      } else if (code.includes("weak-password")) {
        message = "Password must be at least 6 characters.";
      } else if (code.includes("invalid-email")) {
        message = "Invalid email address. Please check and try again.";
      } else if (code.includes("too-many-requests")) {
        message = "Too many attempts. Please wait a moment and try again.";
      } else if (firebaseErr.message) {
        message = firebaseErr.message;
      }
      setError(message);
      setIsLoading(false);
    }
  };

  // Show full-page spinner while checking auth state or redirecting
  if (authLoading || (isAuthenticated && !error)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg mx-auto">
            <ClipboardCheck className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto mt-6" />
          <p className="mt-3 text-sm text-zinc-500">
            {isAuthenticated ? "Redirecting to your dashboard..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-xl shadow-emerald-200/60">
            <ClipboardCheck className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-zinc-900">RugQC</span>
            <p className="text-xs text-zinc-500 mt-0.5">Quality Control for Rug Manufacturers</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-3xl border border-zinc-200/80 bg-white/90 backdrop-blur-md p-8 shadow-2xl shadow-zinc-200/50">
          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-xl font-bold text-zinc-900">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              {isSignUp
                ? "Start your free trial with 15 inspections"
                : "Sign in to your RugQC workspace"}
            </p>
          </div>

          {/* Google Sign In (primary CTA) */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-sm font-semibold text-zinc-800 border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2.5 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2.5 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email address
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="you@company.com"
                  className="pl-9 h-11 border-zinc-200 focus-visible:ring-emerald-500"
                  disabled={isLoading || isGoogleLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder={isSignUp ? "Min. 6 characters" : "Enter your password"}
                  className="pl-9 pr-10 h-11 border-zinc-200 focus-visible:ring-emerald-500"
                  minLength={6}
                  disabled={isLoading || isGoogleLoading}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-200/50 transition-all"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <p className="mt-5 text-center text-sm text-zinc-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setPassword("");
              }}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up free"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-zinc-400 text-center leading-relaxed">
          By continuing, you agree to RugQC&apos;s{" "}
          <a href="#" className="underline underline-offset-2 hover:text-zinc-600 transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-zinc-600 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
