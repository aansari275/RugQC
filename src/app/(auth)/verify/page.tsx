export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <div className="w-full rounded-3xl border border-zinc-200 p-8">
          <h1 className="text-2xl font-semibold">Enter OTP</h1>
          <p className="mt-2 text-sm text-zinc-600">
            We sent a 6‑digit code to your email.
          </p>
          <form className="mt-6 space-y-4">
            <input
              type="text"
              inputMode="numeric"
              placeholder="123456"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm tracking-[0.3em]"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
            >
              Verify
            </button>
          </form>
          <button className="mt-4 text-xs text-zinc-500">Resend code</button>
        </div>
      </div>
    </div>
  );
}
