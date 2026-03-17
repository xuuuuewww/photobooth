import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { TOC } from "@/components/mdx/TOC";
import { ProTip } from "@/components/mdx/ProTip";
import { StepByStep, Step } from "@/components/mdx/StepByStep";
import { ProsCons } from "@/components/mdx/ProsCons";
import { NextJSImage } from "@/components/mdx/NextJSImage";
import { BlogImg } from "@/components/mdx/BlogImg";
import { FAQAccordion } from "@/components/mdx/FAQAccordion";
import { ComparisonTable } from "@/components/mdx/ComparisonTable";
import { PhotoBoothInlineFlow } from "@/components/blog/PhotoBoothInlineFlow";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

function slugify(text: string): string {
  return text
    .replace(/\*\*?|\[]\([^)]*\)|`/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/gi, "")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

function formatDate(date: string): string {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} | Photobooth Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const mdxComponents = {
    TOC: () => null,
    ProTip,
    StepByStep,
    Step,
    ProsCons,
    NextJSImage,
    img: BlogImg,
    FAQAccordion,
    ComparisonTable,
    a: ({ href, children, ...props }: React.ComponentProps<"a">) => {
      const className =
        "font-medium text-pink-600 underline underline-offset-2 decoration-pink-400 transition hover:text-pink-700 hover:decoration-pink-600 cursor-pointer";

      const rawHref = href ?? "/";
      const isAbsolute = rawHref.startsWith("http");

      let isExternal = false;
      let normalizedHref = rawHref;

      if (isAbsolute) {
        try {
          const url = new URL(rawHref);
          const host = url.hostname.replace(/^www\./, "");
          const isSameDomain = host === "photobooth-online.com";
          if (isSameDomain) {
            // Treat same-domain absolute URLs as internal links
            normalizedHref = `${url.pathname}${url.search}${url.hash || ""}` || "/";
            isExternal = false;
          } else {
            isExternal = true;
          }
        } catch {
          // If URL parsing fails, fall back to treating as external
          isExternal = true;
        }
      }

      if (isExternal) {
        return (
          <a
            href={rawHref}
            className={className}
            target="_blank"
            rel="nofollow noopener"
            {...props}
          >
            {children}
          </a>
        );
      }

      return (
        <Link href={normalizedHref} className={className} {...props}>
          {children}
        </Link>
      );
    },
    h3: ({ children, ...props }: React.ComponentProps<"h3">) => (
      <h3
        className="mt-8 mb-3 font-bold text-black leading-snug"
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }: React.ComponentProps<"p">) => (
      <p
        className="text-black leading-relaxed"
        style={{ marginBottom: "12px" }}
        {...props}
      >
        {children}
      </p>
    ),
    h2: ({ children, ...props }: React.ComponentProps<"h2">) => {
      let raw = "section";
      if (typeof children === "string") raw = children;
      else if (children != null && Array.isArray(children))
        raw =
          (children as unknown[])
            .map((c) => (typeof c === "string" ? c : ""))
            .join("") || raw;
      const id = slugify(raw);
      return (
        <h2
          id={id}
          className="mt-12 mb-4 scroll-mt-24 text-[20px] font-semibold tracking-tight text-pink-700 first:mt-8 sm:text-[26px]"
          {...props}
        >
          {children}
        </h2>
      );
    },
  };

  return (
    <main className="bg-neutral-50">
      {/* 首屏：标题 + 功能区（PhotoBoothInlineFlow） */}
      <section className="h-[66svh] overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-pink-700 md:text-4xl mt-[10px] mb-[10px] md:mt-[20px] md:mb-[20px]">
            {post!.h1 ?? post!.title}
          </h1>
          <div className="mt-4 min-h-0 flex-1 overflow-hidden">
            <PhotoBoothInlineFlow />
          </div>
        </div>
      </section>

      {/* 第二屏：Back to blog + TOC + 正文 */}
      <section className="min-h-screen px-4 pt-[10px] pb-10 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl gap-12">
          {/* 左侧栏仅在第二部分文档流中，不 fixed，首屏不显示 */}
          <aside className="hidden w-56 shrink-0 lg:flex lg:flex-col lg:self-start lg:sticky lg:top-24">
            <Link
              href="/blog"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-pink-600 transition hover:text-pink-700"
            >
              ← Back to blog
            </Link>
            <div className="mt-4 min-h-0 flex-1 overflow-hidden">
              <TOC />
            </div>
          </aside>

          <article className="min-w-0 flex-1 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="lg:hidden mb-4">
              <Link
                href="/blog"
                className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-pink-600 transition hover:text-pink-700"
              >
                ← Back to blog
              </Link>
              <TOC />
            </div>

            <div
              data-blog-article
              className="blog-article-prose prose prose-lg mt-2 max-w-none text-black prose-headings:text-pink-700 prose-p:!text-black prose-li:!text-black prose-a:font-medium prose-a:text-pink-600 prose-a:underline prose-a:underline-offset-2 prose-a:decoration-pink-400 prose-p:leading-relaxed prose-p:mb-3 prose-ul:my-5 prose-ol:my-5 prose-li:my-1 prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-bold prose-h3:!text-black prose-h3:leading-snug prose-th:!text-black prose-td:!text-black prose-strong:!text-black prose-blockquote:!text-black [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-pink-200 [&_th]:px-4 [&_th]:py-2 [&_th]:bg-pink-50 [&_th]:text-left [&_td]:border [&_td]:border-pink-200 [&_td]:px-4 [&_td]:py-2 [&_a:hover]:text-pink-700 [&_a:hover]:decoration-pink-600"
            >
              <MDXRemote
                source={post!.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeHighlight],
                  },
                }}
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

