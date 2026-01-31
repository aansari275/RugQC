export default function InspectorHome() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Inspector</h1>
        <div className="mt-6 space-y-4">
          <button className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-left text-sm font-medium">
            + New inspection
          </button>
          <div className="rounded-2xl border border-zinc-200 p-4">
            <div className="text-xs text-zinc-500">Drafts (2)</div>
            <div className="mt-2 space-y-2 text-sm">
              <div className="rounded-xl border border-zinc-200 px-3 py-2">
                KP‑220 • Pottery Barn — 8/12 items
              </div>
              <div className="rounded-xl border border-zinc-200 px-3 py-2">
                RG‑445 • West Elm — 3/12 items
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-4">
            <div className="text-xs text-zinc-500">Today’s submissions</div>
            <div className="mt-2 text-sm text-zinc-600">#1050 ✅ • #1049 ✅ • #1048 ✅</div>
          </div>
        </div>
      </div>
    </div>
  );
}
