export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-xl font-semibold tracking-tight">Inspectra</div>
        <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
          <a className="hover:text-zinc-900" href="#solution">Solution</a>
          <a className="hover:text-zinc-900" href="#how">How it works</a>
          <a className="hover:text-zinc-900" href="#features">Features</a>
          <a className="hover:text-zinc-900" href="#pricing">Pricing</a>
        </nav>
        <a
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          href="#cta"
        >
          Start free
        </a>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Quality inspection SaaS for exporters
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Stop reviewing 50 reports to find 3 problems.
              </h1>
              <p className="mt-4 text-lg text-zinc-600">
                Inspectra shows owners only what needs attention — with AI summaries,
                risk scores, and buyer‑ready PDFs.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white"
                  href="#cta"
                >
                  Start free
                </a>
                <a
                  className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-700"
                  href="#pricing"
                >
                  See pricing
                </a>
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                Trusted by exporter teams in Bhadohi, Jaipur, Panipat.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-4 text-sm font-medium text-zinc-500">Owner Dashboard</div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-600">🔴 Needs decision</span>
                    <span className="text-xs text-zinc-500">Final • Today</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold">KP‑220 • Pottery Barn</h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    4 major defects found. Recommend sorting by shade before shipment.
                  </p>
                  <div className="mt-3 flex gap-2 text-xs">
                    <button className="rounded-full border border-zinc-200 px-3 py-1">
                      View
                    </button>
                    <button className="rounded-full bg-zinc-900 px-3 py-1 text-white">
                      Ship
                    </button>
                    <button className="rounded-full border border-zinc-200 px-3 py-1">
                      Hold
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-600">🟡 Review</span>
                    <span className="text-xs text-zinc-500">Inline • Today</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold">RG‑445 • West Elm</h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Passed AQL, minor binding issue flagged for caution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="solution" className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold">You manage exceptions, not checklists.</h2>
              <p className="mt-3 text-zinc-600">
                Owners only see red and amber inspections. AI summarizes every report in
                3–6 lines so decisions take seconds, not hours.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm font-semibold">Exception‑only dashboard</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Green inspections are hidden by default.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm font-semibold">Buyer‑ready PDFs</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Clean, branded reports in one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              "Inspector fills checklist",
              "Photos uploaded on phone",
              "AI summarizes & scores",
              "Owner decides in seconds",
            ].map((step, i) => (
              <div key={step} className="rounded-2xl border border-zinc-200 p-4">
                <div className="text-xs font-semibold text-zinc-500">Step {i + 1}</div>
                <p className="mt-2 text-sm font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-semibold">Features owners actually value</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["AI Inspection Summary", "5–6 lines. Intervention: Yes/No."],
              ["AI Risk Score", "Green / Amber / Red. Default exceptions view."],
              ["AI Auto‑Remarks", "Buyer‑safe language for NOT OK items."],
              ["Branded PDFs", "Professional reports with your logo."],
              ["History & Search", "Find any inspection in seconds."],
              ["Owner Actions", "Ship / Hold / Rework with notes."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-zinc-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-12">
          <h2 className="text-2xl font-semibold">Simple pricing</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              {
                name: "Starter",
                price: "Free",
                desc: "15 inspections / month",
                points: ["Owner dashboard", "Watermarked PDFs", "No AI"],
              },
              {
                name: "Growth",
                price: "$79",
                desc: "100 inspections / month",
                points: ["AI summaries", "AI auto‑remarks", "Branded PDFs"],
              },
              {
                name: "Professional",
                price: "$199",
                desc: "500 inspections / month",
                points: ["Advanced analytics", "Buyer portal", "All AI"],
              },
              {
                name: "Enterprise",
                price: "$499",
                desc: "Unlimited inspections",
                points: ["Multi‑factory", "Custom workflows", "SLA"],
              },
            ].map((tier) => (
              <div key={tier.name} className="rounded-2xl border border-zinc-200 p-4">
                <div className="text-sm font-semibold">{tier.name}</div>
                <div className="mt-2 text-3xl font-semibold">{tier.price}</div>
                <div className="mt-1 text-sm text-zinc-500">{tier.desc}</div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                  {tier.points.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="cta" className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-10 text-center">
            <h2 className="text-2xl font-semibold">Start with 15 free inspections</h2>
            <p className="mt-2 text-zinc-600">
              See only what matters. Decide in 10 seconds.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <input
                className="w-full max-w-xs rounded-full border border-zinc-200 px-4 py-2 text-sm"
                placeholder="you@company.com"
              />
              <button className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white">
                Start free
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-zinc-500 md:flex-row">
          <div>© {new Date().getFullYear()} Inspectra</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-900">Privacy</a>
            <a href="#" className="hover:text-zinc-900">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
