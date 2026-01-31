const inspections = [
  {
    id: "1052",
    risk: "red",
    buyer: "Pottery Barn",
    article: "KP‑220",
    summary:
      "4 major defects found. Color variation exceeds tolerance. Recommend sorting by shade.",
  },
  {
    id: "1051",
    risk: "amber",
    buyer: "West Elm",
    article: "RG‑445",
    summary:
      "Passed AQL but minor binding issue flagged. Review before shipment.",
  },
];

export default function OwnerDashboard() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">Good morning</p>
            <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
          </div>
          <button className="rounded-full border border-zinc-200 px-4 py-2 text-sm">
            View all
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {["Critical", "Review", "Clear", "Total"].map((label, i) => (
            <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-xs text-zinc-500">{label}</div>
              <div className="mt-2 text-2xl font-semibold">{[1, 1, 12, 14][i]}</div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="mb-3 text-sm font-semibold text-zinc-500">
            Needs your decision
          </div>
          <div className="space-y-4">
            {inspections.map((i) => (
              <div key={i.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      i.risk === "red" ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {i.risk === "red" ? "🔴 FAILED AQL" : "🟡 REVIEW"}
                  </span>
                  <span className="text-xs text-zinc-500">Final • Today</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold">
                  #{i.id} • {i.article} • {i.buyer}
                </h3>
                <p className="mt-2 text-sm text-zinc-600">{i.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <button className="rounded-full border border-zinc-200 px-3 py-1">
                    View
                  </button>
                  <button className="rounded-full bg-zinc-900 px-3 py-1 text-white">
                    Ship
                  </button>
                  <button className="rounded-full border border-zinc-200 px-3 py-1">
                    Hold
                  </button>
                  <button className="rounded-full border border-zinc-200 px-3 py-1">
                    Rework
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
