"use client";

import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function VerifyPage() {
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const [message, setMessage] = useState<string>("Verifying link...");

  useEffect(() => {
    const run = async () => {
      try {
        if (!auth) {
          setStatus("error");
          setMessage("Firebase is not configured. Please contact support.");
          return;
        }

        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setStatus("error");
          setMessage("Invalid or expired link.");
          return;
        }
        const storedEmail = window.localStorage.getItem("rugqc_email");
        const params = new URLSearchParams(window.location.search);
        const paramEmail = params.get("email");
        const email = storedEmail || paramEmail || window.prompt("Confirm your email") || "";
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem("rugqc_email");
        setStatus("success");
        setMessage("Logged in. Redirecting...");
      } catch (err: unknown) {
        setStatus("error");
        const message = err instanceof Error ? err.message : "Verification failed";
        setMessage(message);
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <div className="w-full rounded-3xl border border-zinc-200 bg-white/80 backdrop-blur-sm p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-zinc-900">Verify</h1>
          <p
            className={`mt-3 text-sm ${
              status === "success" ? "text-emerald-600" : status === "error" ? "text-red-600" : "text-zinc-600"
            }`}
          >
            {message}
          </p>
          <a href="/owner" className="mt-6 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
