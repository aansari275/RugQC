import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts } from "./posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical guides on quality control, AQL inspection, defect reduction, and digital QC for rug and carpet manufacturers.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "RugQC Blog - Quality Control Guides for Rug Manufacturers",
    description:
      "Practical guides on quality control, AQL inspection, defect reduction, and digital QC for rug and carpet manufacturers.",
    url: "https://rugqc.netlify.app/blog",
    type: "website",
  },
};

export default function BlogPage() {
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-600">Blog</span>
            <Link
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-all"
              href="/login"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Page header */}
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold md:text-5xl">Blog</h1>
          <p className="mt-4 text-lg text-zinc-500 leading-relaxed">
            Practical guides on quality control, inspection methods, and
            building better QC systems for rug and carpet manufacturing.
          </p>
        </div>

        {/* Blog grid */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-zinc-300"
            >
              {/* Gradient image placeholder */}
              <div
                className={`aspect-[16/9] bg-gradient-to-br ${post.gradient} relative`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <ClipboardCheck className="h-12 w-12 text-white/30" />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-semibold leading-snug group-hover:text-emerald-600 transition-colors">
                  {post.title}
                </h2>

                <p className="mt-2 flex-1 text-sm text-zinc-500 leading-relaxed">
                  {post.description}
                </p>

                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
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
              &copy; {new Date().getFullYear()} RugQC. Built for the textile
              industry.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
