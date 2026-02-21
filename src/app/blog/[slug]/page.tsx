import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardCheck, ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { getPostBySlug, getAllSlugs } from "../posts";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://rugqc.netlify.app/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let listItems: string[] = [];
  let listKey = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${listKey++}`}
          className="my-4 space-y-2 pl-6 list-disc text-zinc-600 leading-relaxed"
        >
          {listItems.map((item, idx) => (
            <li key={idx}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  function renderInline(text: string): React.ReactNode {
    // Handle bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-zinc-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  }

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === "") {
      flushList();
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={`h2-${i}`}
          className="mt-10 mb-4 text-2xl font-bold text-zinc-900"
        >
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mt-8 mb-3 text-xl font-semibold text-zinc-900"
        >
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // Bullet list item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2));
      i++;
      continue;
    }

    // Numbered list item
    if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, "");
      listItems.push(text);
      i++;
      continue;
    }

    // Paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="my-4 text-zinc-600 leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  flushList();
  return elements;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "RugQC",
      url: "https://rugqc.netlify.app",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://rugqc.netlify.app/blog/${post.slug}`,
    },
  };

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
          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors"
            >
              Blog
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

      <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        {/* Article header */}
        <article className="mt-8">
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

          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            {post.title}
          </h1>

          <p className="mt-4 text-lg text-zinc-500 leading-relaxed">
            {post.description}
          </p>

          {/* Gradient banner */}
          <div
            className={`mt-8 aspect-[16/7] rounded-2xl bg-gradient-to-br ${post.gradient} flex items-center justify-center`}
          >
            <ClipboardCheck className="h-16 w-16 text-white/20" />
          </div>

          {/* Article content */}
          <div className="mt-10">{renderMarkdown(post.content)}</div>
        </article>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-zinc-950 p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Ready to digitize your QC inspections?
          </h2>
          <p className="mt-3 text-zinc-400 max-w-lg mx-auto">
            Set up in 2 minutes. Your first inspection report is one submission
            away. Free plan includes 15 inspections per month.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white hover:bg-emerald-400 transition-all"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
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
