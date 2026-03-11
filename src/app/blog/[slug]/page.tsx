import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

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

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto w-full max-w-3xl rounded-3xl border border-pink-100 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/blog"
          className="text-sm font-medium text-pink-600 transition hover:text-pink-700"
        >
          ← Back to blog
        </Link>

        <header className="mt-4 border-b border-pink-100 pb-6">
          <p className="text-sm text-pink-800/70">{formatDate(post.date)}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-pink-700 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-base text-neutral-700">{post.description}</p>
          {post.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="prose prose-lg mt-8 max-w-none prose-headings:text-pink-700 prose-a:text-pink-600">
          <MDXRemote
            source={post.content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHighlight],
              },
            }}
          />
        </div>
      </article>
    </main>
  );
}
