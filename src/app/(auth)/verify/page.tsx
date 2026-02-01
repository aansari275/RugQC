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
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setStatus("error");
          setMessage("Invalid or expired link.");
          return;
        }
        const storedEmail = window.localStorage.getItem("inspectra_email");
        const params = new URLSearchParams(window.location.search);
        const paramEmail = params.get("email");
        const email = storedEmail || paramEmail || window.prompt("Confirm your email") || "";
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem("inspectra_email");
        setStatus("success");
        setMessage("Logged in. You can close this page.");
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Verification failed");
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <div className="w-full rounded-3xl border border-zinc-200 p-8">
          <h1 className="text-2xl font-semibold">Verify</h1>
          <p
            className={`mt-3 text-sm ${
              status === "success" ? "text-emerald-600" : status === "error" ? "text-red-600" : "text-zinc-600"
            }`}
          >
            {message}
          </p>
          <a href="/owner" className="mt-6 inline-block text-sm text-zinc-600 underline">
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
