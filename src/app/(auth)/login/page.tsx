export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <div className="w-full rounded-3xl border border-zinc-200 p-8">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Enter your email. We will send a 6‑digit OTP.
          </p>
          <form className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
            >
              Send OTP
            </button>
          </form>
          <p className="mt-6 text-xs text-zinc-500">
            By continuing, you agree to Inspectra’s Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
