"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify?email=${encodeURIComponent(email)}`;
      await sendSignInLinkToEmail(auth, email, {
        url,
        handleCodeInApp: true,
      });
      window.localStorage.setItem("inspectra_email", email);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send link");
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <div className="w-full rounded-3xl border border-zinc-200 p-8">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Enter your email. We will send a secure login link.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSend}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
            >
              Send login link
            </button>
          </form>
          {sent && (
            <p className="mt-4 text-sm text-emerald-600">
              Link sent. Check your inbox.
            </p>
          )}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <p className="mt-6 text-xs text-zinc-500">
            By continuing, you agree to Inspectra’s Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
