import Link from "next/link";
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  FileText,
  Shield,
  BarChart3,
  Clock,
  Users,
  ArrowRight,
  Star,
  Play,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <ClipboardCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Inspectra</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex">
            <a className="hover:text-emerald-600 transition-colors" href="#features">Features</a>
            <a className="hover:text-emerald-600 transition-colors" href="#how">How it works</a>
            <a className="hover:text-emerald-600 transition-colors" href="#pricing">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 md:block"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
              href="/login"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-200/30 to-emerald-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-16 md:pt-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
                  <Zap className="h-4 w-4" />
                  AI-Powered Quality Control
                </div>
                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                  Stop reviewing{" "}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    50 reports
                  </span>{" "}
                  to find 3 problems.
                </h1>
                <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
                  Inspectra shows owners only the inspections that need attention — with AI summaries,
                  risk scores, and buyer-ready PDFs. Make decisions in seconds, not hours.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                    href="/login"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-zinc-200 bg-white px-8 py-4 text-base font-semibold text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                    href="#how"
                  >
                    <Play className="h-4 w-4" />
                    See How It Works
                  </a>
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">3-6x</div>
                    <div className="mt-1 text-sm text-zinc-500">Faster decisions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-teal-600">60%</div>
                    <div className="mt-1 text-sm text-zinc-500">Less review time</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-cyan-600">1-click</div>
                    <div className="mt-1 text-sm text-zinc-500">Buyer PDFs</div>
                  </div>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-20 scale-105" />
                <div className="relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl shadow-zinc-200/50">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-medium text-zinc-400">Owner Dashboard</span>
                  </div>

                  {/* Stats row */}
                  <div className="mb-4 grid grid-cols-4 gap-2">
                    <div className="rounded-xl bg-red-50 p-3 text-center">
                      <div className="text-lg font-bold text-red-600">2</div>
                      <div className="text-[10px] text-red-600/70">Critical</div>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3 text-center">
                      <div className="text-lg font-bold text-amber-600">3</div>
                      <div className="text-[10px] text-amber-600/70">Review</div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3 text-center">
                      <div className="text-lg font-bold text-emerald-600">45</div>
                      <div className="text-[10px] text-emerald-600/70">Clear</div>
                    </div>
                    <div className="rounded-xl bg-zinc-50 p-3 text-center">
                      <div className="text-lg font-bold text-zinc-700">50</div>
                      <div className="text-[10px] text-zinc-500">Total</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Red card */}
                    <div className="rounded-2xl border-l-4 border-l-red-500 bg-red-50/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                          <XCircle className="h-3 w-3" /> FAILED AQL
                        </span>
                        <span className="text-[10px] text-zinc-400">Final • Today</span>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold">KP-220 • Pottery Barn</h3>
                      <p className="mt-1 text-xs text-zinc-600">
                        4 major defects found. Color variation exceeds tolerance. Recommend shade sorting.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                          Ship
                        </button>
                        <button className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium">
                          Hold
                        </button>
                        <button className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium">
                          Rework
                        </button>
                      </div>
                    </div>

                    {/* Amber card */}
                    <div className="rounded-2xl border-l-4 border-l-amber-500 bg-amber-50/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                          <AlertTriangle className="h-3 w-3" /> REVIEW
                        </span>
                        <span className="text-[10px] text-zinc-400">Inline • Today</span>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold">RG-445 • West Elm</h3>
                      <p className="mt-1 text-xs text-zinc-600">
                        Passed AQL. Minor binding issue flagged for caution.
                      </p>
                    </div>

                    {/* Green card */}
                    <div className="rounded-2xl border-l-4 border-l-emerald-500 bg-emerald-50/30 p-4 opacity-60">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle className="h-3 w-3" /> PASSED
                        </span>
                        <span className="text-[10px] text-zinc-400">Final • Yesterday</span>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold">EM-119 • IKEA</h3>
                      <p className="mt-1 text-xs text-zinc-600">
                        All checks passed. Ready to ship.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="border-y border-zinc-100 bg-zinc-50/50 py-8">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-center text-sm font-medium text-zinc-400">
              Trusted by quality teams across India
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-zinc-300">
              {["Bhadohi", "Jaipur", "Panipat", "Mirzapur", "Varanasi"].map((city) => (
                <span key={city} className="text-lg font-semibold">{city}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
                Features
              </span>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                Everything owners need,{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  nothing they don't
                </span>
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                Designed for busy factory owners who need quick, confident decisions.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  color: "from-emerald-500 to-emerald-600",
                  title: "AI Summary",
                  desc: "Every inspection summarized in 3-6 lines. Know immediately if action is needed.",
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  color: "from-teal-500 to-teal-600",
                  title: "Risk Scoring",
                  desc: "Automatic Green/Amber/Red scoring. See only exceptions by default.",
                },
                {
                  icon: <FileText className="h-6 w-6" />,
                  color: "from-cyan-500 to-cyan-600",
                  title: "Branded PDFs",
                  desc: "Professional, buyer-ready reports with your logo. One-click generation.",
                },
                {
                  icon: <BarChart3 className="h-6 w-6" />,
                  color: "from-blue-500 to-blue-600",
                  title: "AQL Compliance",
                  desc: "Built-in ANSI Z1.4-2008 sampling plans. Automatic pass/fail calculation.",
                },
                {
                  icon: <Clock className="h-6 w-6" />,
                  color: "from-violet-500 to-violet-600",
                  title: "Quick Actions",
                  desc: "Ship, Hold, or Rework with one tap. Add notes for your team instantly.",
                },
                {
                  icon: <Users className="h-6 w-6" />,
                  color: "from-pink-500 to-pink-600",
                  title: "Role-Based Views",
                  desc: "Inspectors see checklists. Owners see decisions. Everyone sees what matters.",
                },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-zinc-200 bg-white p-6 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-zinc-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
                How It Works
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
                From inspection to decision in{" "}
                <span className="text-emerald-400">4 simple steps</span>
              </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-4">
              {[
                { step: "01", title: "Inspector fills checklist", desc: "Mobile-first app. Works offline." },
                { step: "02", title: "Photos & defects logged", desc: "Camera-first. Auto-compressed." },
                { step: "03", title: "AI scores & summarizes", desc: "Risk assessed automatically." },
                { step: "04", title: "Owner decides in seconds", desc: "Ship, Hold, or Rework." },
              ].map((item, i) => (
                <div key={item.step} className="relative">
                  {i < 3 && (
                    <div className="absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent hidden md:block" />
                  )}
                  <div className="rounded-2xl border border-zinc-700 bg-zinc-800/50 p-6 backdrop-blur">
                    <div className="text-4xl font-bold text-emerald-500/30">{item.step}</div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
                Pricing
              </span>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                Start free, scale as you grow
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                No hidden fees. Cancel anytime.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  name: "Starter",
                  price: "Free",
                  period: "forever",
                  desc: "15 inspections/month",
                  features: ["Owner dashboard", "Basic reports", "1 user", "Email support"],
                  cta: "Get Started",
                  popular: false,
                },
                {
                  name: "Growth",
                  price: "₹6,499",
                  period: "/month",
                  desc: "100 inspections/month",
                  features: ["AI summaries", "AI auto-remarks", "Branded PDFs", "5 users", "Priority support"],
                  cta: "Start Trial",
                  popular: true,
                },
                {
                  name: "Professional",
                  price: "₹16,499",
                  period: "/month",
                  desc: "500 inspections/month",
                  features: ["Everything in Growth", "Buyer portal", "API access", "20 users", "Phone support"],
                  cta: "Start Trial",
                  popular: false,
                },
                {
                  name: "Enterprise",
                  price: "₹41,499",
                  period: "/month",
                  desc: "Unlimited inspections",
                  features: ["Everything in Pro", "Multi-factory", "Custom workflows", "Unlimited users", "Dedicated CSM"],
                  cta: "Contact Sales",
                  popular: false,
                },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`relative rounded-2xl border ${
                    tier.popular
                      ? "border-emerald-500 bg-gradient-to-b from-emerald-50 to-white shadow-xl shadow-emerald-100/50"
                      : "border-zinc-200 bg-white"
                  } p-6`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-xs font-semibold text-white">
                        <Star className="h-3 w-3" /> Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-sm font-semibold text-zinc-500">{tier.name}</div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-zinc-500">{tier.period}</span>
                  </div>
                  <div className="mt-2 text-sm text-zinc-500">{tier.desc}</div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`mt-6 block rounded-full py-3 text-center text-sm font-semibold transition-all ${
                      tier.popular
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                        : "border border-zinc-200 text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-12 md:p-16">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative text-center">
                <h2 className="text-3xl font-bold text-white md:text-4xl">
                  Ready to see only what matters?
                </h2>
                <p className="mt-4 text-lg text-emerald-100">
                  Start with 15 free inspections. No credit card required.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-emerald-600 shadow-xl hover:bg-emerald-50 transition-all"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="mailto:hello@inspectra.app?subject=Demo%20Request"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all"
                  >
                    Request Demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <ClipboardCheck className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">Inspectra</span>
            </div>
            <div className="flex gap-8 text-sm text-zinc-500">
              <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
            </div>
            <div className="text-sm text-zinc-400">
              © {new Date().getFullYear()} Inspectra. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
