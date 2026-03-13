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
      const isExternal = href?.startsWith("http");
      const className =
        "font-medium text-pink-600 underline underline-offset-2 decoration-pink-400 transition hover:text-pink-700 hover:decoration-pink-600 cursor-pointer";
      if (isExternal) {
        return (
          <a
            href={href}
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
        <Link href={href ?? "/"} className={className} {...props}>
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
    <main className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* 桌面端：Back to blog + 目录 固定在同一左侧栏，不随页面滚动 */}
        <aside className="hidden lg:flex lg:flex-col fixed left-[max(1rem,calc((100vw-72rem)/2))] top-[80px] z-10 w-56 max-h-[calc(100vh-80px)]">
          <Link
            href="/blog"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-pink-600 transition hover:text-pink-700"
          >
            ← Back to blog
          </Link>
          <div className="mt-16 min-h-0 flex-1 overflow-hidden">
            <TOC />
          </div>
        </aside>

        {/* 移动端：Back to blog 在流式布局中 */}
        <Link
          href="/blog"
          className="mb-4 inline-flex lg:hidden items-center gap-1 text-sm font-medium text-pink-600 transition hover:text-pink-700"
        >
          ← Back to blog
        </Link>

        <div className="flex gap-12">
          <div className="hidden lg:block w-56 shrink-0" aria-hidden="true" />

          <article className="min-w-0 flex-1 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm sm:p-8">
            <header className="border-b border-pink-100 pb-6">
              <h1 className="text-3xl font-bold tracking-tight text-pink-700 sm:text-4xl">
                {post.h1 ?? post.title}
              </h1>
              <p className="mt-3 text-base text-neutral-500">
                {post.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                {post.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span />
                )}
                <time
                  className="shrink-0 text-sm text-neutral-500"
                  dateTime={post.date}
                >
                  {formatDate(post.date)}
                </time>
              </div>
            </header>

            <div className="lg:hidden">
              <TOC />
            </div>

            <div
              data-blog-article
              className="blog-article-prose prose prose-lg mt-8 max-w-none text-black prose-headings:text-pink-700 prose-p:!text-black prose-li:!text-black prose-a:font-medium prose-a:text-pink-600 prose-a:underline prose-a:underline-offset-2 prose-a:decoration-pink-400 prose-p:leading-relaxed prose-p:mb-3 prose-ul:my-5 prose-ol:my-5 prose-li:my-1 prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-bold prose-h3:!text-black prose-h3:leading-snug prose-th:!text-black prose-td:!text-black prose-strong:!text-black prose-blockquote:!text-black [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-pink-200 [&_th]:px-4 [&_th]:py-2 [&_th]:bg-pink-50 [&_th]:text-left [&_td]:border [&_td]:border-pink-200 [&_td]:px-4 [&_td]:py-2 [&_a:hover]:text-pink-700 [&_a:hover]:decoration-pink-600"
            >
              <MDXRemote
                source={post.content}
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
      </div>
    </main>
  );
}

