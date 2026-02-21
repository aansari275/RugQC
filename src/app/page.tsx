import Link from "next/link";
import Image from "next/image";
import { ClipboardCheck, ArrowRight, Camera, Mail, Share2, TrendingUp, Download, FileText, Zap, Tags, Eye, ShieldCheck, ImagePlus, Calculator, Check } from "lucide-react";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RugQC",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Digital QC inspection platform for rug and carpet manufacturers. Replace paper checklists with photo-based inspections, automated PDF reports, and real-time analytics.",
  url: "https://rugqc.netlify.app",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "INR",
      description: "15 inspections per month, all features included",
    },
    {
      "@type": "Offer",
      name: "Starter",
      price: "2999",
      priceCurrency: "INR",
      description: "30 inspections per month, all features included",
    },
    {
      "@type": "Offer",
      name: "Growth",
      price: "6999",
      priceCurrency: "INR",
      description: "50 inspections per month, all features included",
    },
  ],
  featureList: [
    "AQL Sampling Inspection",
    "100% Inspection Mode",
    "Branded PDF Reports",
    "Photo Documentation",
    "Custom Defect Codes",
    "Email Reports on Submit",
    "Analytics Dashboard",
    "Unlimited Team Members",
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <ClipboardCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">RugQC</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              className="hidden text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors md:block"
              href="/blog"
            >
              Blog
            </Link>
            <a
              className="hidden items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors md:flex"
              href="/sample-report.pdf"
              target="_blank"
            >
              <FileText className="h-4 w-4" />
              Sample Report
            </a>
            <Link
              className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 md:block"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-all"
              href="/login"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section — Manager reviewing report */}
        <section className="relative overflow-hidden bg-zinc-950">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-[3.5rem]">
                  Your inspector snaps.
                  <br />
                  <span className="text-emerald-400">You get the report.</span>
                </h1>
                <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-md">
                  No more going home to paste photos into Excel.
                  Inspector submits on the shop floor, report lands in your inbox. Done.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white hover:bg-emerald-400 transition-all"
                    href="/login"
                  >
                    Try it free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 px-7 py-3.5 text-base font-semibold text-zinc-300 hover:bg-zinc-800 transition-all"
                    href="/sample-report.pdf"
                    target="_blank"
                  >
                    <Download className="h-4 w-4" />
                    Download sample report
                  </a>
                </div>
                <p className="mt-4 text-sm text-zinc-500">
                  15 inspections free. No credit card needed.
                </p>
              </div>

              {/* Manager on laptop */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <Image
                  src="/images/manager-laptop.jpg"
                  alt="Manager reviewing quality inspection report on laptop"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it works — 3 simple steps */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                Three steps. That's it.
              </h2>
              <p className="mt-4 text-lg text-zinc-500">
                No training needed. If your team can use a phone camera, they can use RugQC.
              </p>
            </div>

            <div className="mt-16 grid gap-12 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <Camera className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Snap photos</h3>
                <p className="mt-3 text-zinc-500 leading-relaxed">
                  Your QC inspector opens the app on the shop floor, follows a standardized checklist,
                  and photographs every check. No missed steps, more output per inspector.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <Mail className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Report in your inbox</h3>
                <p className="mt-3 text-zinc-500 leading-relaxed">
                  The moment they submit, a branded PDF hits your inbox. Every photo, every defect,
                  every measurement. No Excel, no WhatsApp photos, no delays.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <Share2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Share with confidence</h3>
                <p className="mt-3 text-zinc-500 leading-relaxed">
                  Forward to your buyer, brand, or internal team.
                  One consistent format that builds trust, every single time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pain point callout */}
        <section className="bg-zinc-950 py-14 md:py-16">
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <div className="text-sm font-medium text-red-400 mb-3">Before RugQC</div>
                <ul className="space-y-3 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    QC goes home, pastes photos into Excel, emails at midnight
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    Every inspector checks different things, different way
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    3 inspections a day, most time spent on paperwork
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    No record of what was checked, when, or by whom
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-medium text-emerald-400 mb-3">With RugQC</div>
                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    Report sent the moment inspection is done, from the floor
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    Standardized checklist, every inspector follows the same parameters
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    5+ inspections a day, zero paperwork
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    Every check timestamped, photo-documented, traceable
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                Built for how factories actually work
              </h2>
              <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
                No complicated setup, no training manuals. Features that solve real problems on the shop floor.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Instant email */}
              <div className="rounded-2xl bg-white p-7 border border-zinc-200 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <Zap className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Instant report on submit</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  The moment your inspector hits submit on the shop floor, the full PDF report lands in your inbox.
                  No delays, no follow-ups needed.
                </p>
              </div>

              {/* Custom defects */}
              <div className="rounded-2xl bg-white p-7 border border-zinc-200 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <Tags className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Custom defect names + photos</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Define your own defect categories, names, and severity levels. Attach photos to every defect found.
                  Your terminology, your standards.
                </p>
              </div>

              {/* Company logo */}
              <div className="rounded-2xl bg-white p-7 border border-zinc-200 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <ImagePlus className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Your logo on every report</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Upload your company logo once. It appears on every inspection report automatically.
                  Professional, branded documents your buyers expect.
                </p>
              </div>

              {/* Transparent system */}
              <div className="rounded-2xl bg-white p-7 border border-zinc-200 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <Eye className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Clear, transparent system</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Every inspection is timestamped, photo-documented, and tied to the inspector who submitted it.
                  No shortcuts, no hiding. Full accountability.
                </p>
              </div>

              {/* AQL or 100% inspection */}
              <div className="rounded-2xl bg-white p-7 border border-zinc-200 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <Calculator className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">AQL or 100% inspection</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Choose AQL sampling with auto-calculated limits, or go full 100% inspection for zero-tolerance orders.
                  Both modes built in. You pick what fits the shipment.
                </p>
              </div>

              {/* Tamper-proof */}
              <div className="rounded-2xl bg-white p-7 border border-zinc-200 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Tamper-proof records</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Once submitted, reports cannot be edited or deleted. Every photo is original, every timestamp is real.
                  Trust the data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sample report preview + download */}
        <section className="bg-zinc-50 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* PDF preview mockup */}
              <div className="relative">
                <div className="rounded-2xl bg-white p-3 shadow-2xl shadow-zinc-200/60 border border-zinc-200">
                  <div className="flex items-center gap-2 px-2 pb-3">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs text-zinc-400">sample-report.pdf</span>
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100">
                    <iframe
                      src="/sample-report.pdf#toolbar=0&navpanes=0"
                      className="h-full w-full border-0"
                      title="Sample QC Inspection Report"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Reports your buyers
                  <br />
                  actually trust
                </h2>
                <p className="mt-6 text-lg text-zinc-500 leading-relaxed">
                  Every inspection becomes a branded, professional document with your company logo. Photos, measurements,
                  pass/fail results, all in one place. No more WhatsApp photos and Excel sheets.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Your company logo on every report",
                    "Photos of every defect with your custom defect names",
                    "Standardized checking parameters across all inspectors",
                    "AQL sampling or 100% inspection, your choice",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-zinc-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-all"
                  href="/sample-report.pdf"
                  target="_blank"
                >
                  <Download className="h-4 w-4" />
                  Download sample report
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* On-the-go section with mobile image */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Review inspections
                  <br />
                  from anywhere
                </h2>
                <p className="mt-6 text-lg text-zinc-500 leading-relaxed">
                  In a meeting, at the airport, on the factory floor. Open your phone, see the result,
                  make the call. Ship, hold, or rework. Done in seconds.
                </p>
                <p className="mt-4 text-lg text-zinc-500 leading-relaxed">
                  Your inspectors submit. You decide. No one waits.
                </p>
              </div>
              <div className="relative order-1 aspect-[16/10] overflow-hidden rounded-2xl lg:order-2">
                <Image
                  src="/images/manager-mobile.jpg"
                  alt="Manager checking inspection results on phone while walking through factory"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Analytics teaser */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
                  <TrendingUp className="h-4 w-4" />
                  Over time
                </div>
                <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                  Patterns emerge.
                  <br />
                  Problems get solved.
                </h2>
                <p className="mt-6 text-lg text-zinc-500 leading-relaxed">
                  After a few weeks of inspections, you start seeing trends. Which defects keep coming back.
                  Which lines or shifts have issues. Which buyers have tighter standards.
                </p>
                <p className="mt-4 text-lg text-zinc-500 leading-relaxed">
                  That is when RugQC becomes more than a reporting tool. It becomes your quality intelligence.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="text-sm font-medium text-zinc-400 mb-6">Last 30 days</div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-600">Color Variation</span>
                      <span className="font-semibold text-red-500">23 occurrences</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div className="h-2 rounded-full bg-red-400" style={{ width: "78%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-600">Pile Height</span>
                      <span className="font-semibold text-amber-500">14 occurrences</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div className="h-2 rounded-full bg-amber-400" style={{ width: "48%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-600">Binding Issues</span>
                      <span className="font-semibold text-emerald-500">6 occurrences</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div className="h-2 rounded-full bg-emerald-400" style={{ width: "20%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-600">Corner Squareness</span>
                      <span className="font-semibold text-emerald-500">3 occurrences</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div className="h-2 rounded-full bg-emerald-400" style={{ width: "10%" }} />
                    </div>
                  </div>
                </div>
                <div className="mt-6 rounded-xl bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">
                    Color variation is your #1 issue this month.
                    18 of 23 cases came from Loom Section B.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-zinc-50 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
              <p className="mt-4 text-lg text-zinc-500">
                Every plan includes all features. Only inspection volume differs.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {/* Free */}
              <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Free</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">₹0</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">15 inspections/mo</p>
                </div>
                <ul className="mb-8 flex-1 space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> All inspection types (AQL + 100%)</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Branded PDF reports with your logo</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Email reports on submit</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Custom defect codes</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Analytics dashboard</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Unlimited users</li>
                </ul>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-all"
                >
                  Get started free
                </Link>
                <p className="mt-3 text-center text-xs text-zinc-400">No credit card needed</p>
              </div>

              {/* Starter */}
              <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Starter</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">₹2,999</span>
                    <span className="text-sm text-zinc-500">/mo</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">30 inspections/mo</p>
                </div>
                <ul className="mb-8 flex-1 space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> All inspection types (AQL + 100%)</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Branded PDF reports with your logo</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Email reports on submit</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Custom defect codes</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Analytics dashboard</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Unlimited users</li>
                </ul>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-all"
                >
                  Start trial
                </Link>
              </div>

              {/* Growth — Most Popular */}
              <div className="relative flex flex-col rounded-2xl border-2 border-emerald-500 bg-white p-6 shadow-md">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">Most popular</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Growth</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">₹6,999</span>
                    <span className="text-sm text-zinc-500">/mo</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">50 inspections/mo</p>
                </div>
                <ul className="mb-8 flex-1 space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> All inspection types (AQL + 100%)</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Branded PDF reports with your logo</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Email reports on submit</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Custom defect codes</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Analytics dashboard</li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> Unlimited users</li>
                </ul>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-all"
                >
                  Start trial
                </Link>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-zinc-400">
              Every plan includes all features and unlimited users. Only inspection volume differs.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Your next inspection could look like this.
            </h2>
            <p className="mt-4 text-lg text-zinc-500">
              Set up takes 2 minutes. Your first report is one inspection away.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-400 transition-all"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 px-8 py-4 text-base font-semibold text-zinc-700 hover:bg-zinc-50 transition-all"
                href="/sample-report.pdf"
                target="_blank"
              >
                <Download className="h-4 w-4" />
                See sample report
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <ClipboardCheck className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">RugQC</span>
            </div>
            <div className="text-sm text-zinc-400">
              © {new Date().getFullYear()} RugQC. Built for the textile industry.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
