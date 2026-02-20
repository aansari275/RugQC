import Link from "next/link";
import Image from "next/image";
import { ClipboardCheck, ArrowRight, Camera, Mail, Share2, TrendingUp, Download, FileText } from "lucide-react";

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
            <span className="text-xl font-bold">RugQC</span>
          </Link>
          <div className="flex items-center gap-3">
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
                  Professional QC reports from your shop floor, delivered to your inbox.
                  Share with buyers in one click.
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
                  Your QC inspector walks the floor, opens the app, and photographs defects as they go.
                  Simple checklist, no complexity.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <Mail className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Get your report</h3>
                <p className="mt-3 text-zinc-500 leading-relaxed">
                  A clean, standardized PDF lands in your inbox. Every photo, every defect,
                  every measurement. Professional enough for any buyer.
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
                  Every inspection becomes a branded, professional document. Photos, measurements,
                  pass/fail results, all in one place. No more WhatsApp photos and Excel sheets.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Photos of every defect, right in the report",
                    "Standardized format across all inspections",
                    "Your company branding on every page",
                    "AQL compliance built in",
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

        {/* Craftsmanship / emotional section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/craftsman-hands.jpg"
              alt="Craftsman hands weaving a rug on a traditional loom"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl leading-tight">
              Every rug carries someone's skill.
              <br />
              <span className="text-emerald-400">Your QC should honor that.</span>
            </h2>
            <p className="mt-6 text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              Behind every order is months of handwork. When issues arise, you need to find the root cause fast,
              not bury it in paperwork. RugQC gives you the data to protect both quality and the people behind it.
            </p>
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

        {/* Simple pricing */}
        <section className="bg-zinc-50 py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Simple pricing</h2>
            <p className="mt-4 text-lg text-zinc-500">
              Start free. Upgrade when you need more.
            </p>

            <div className="mt-12 rounded-2xl border border-zinc-200 bg-white p-8 text-left shadow-sm">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-medium text-emerald-600">Free to start</div>
                  <div className="mt-2 text-4xl font-bold">15 inspections/mo</div>
                  <p className="mt-2 text-zinc-500">
                    Full features. No credit card. No time limit.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 py-4 text-base font-semibold text-white hover:bg-zinc-800 transition-all shrink-0"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 border-t border-zinc-100 pt-6">
                <p className="text-sm text-zinc-400">
                  Need more? Plans start at ₹6,499/mo for 100 inspections.{" "}
                  <Link href="/login" className="text-emerald-600 hover:underline">
                    See all plans
                  </Link>
                </p>
              </div>
            </div>
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
