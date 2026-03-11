import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

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

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Full-width banner, ~1/3 viewport height */}
      <section className="relative flex h-[33vh] min-h-[260px] w-full items-center bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-pink-700 sm:text-4xl md:text-5xl">
            Photobooth Blog
          </h1>
          <p className="max-w-2xl text-sm text-pink-900/70 sm:text-base md:text-lg">
            Tutorials, feature updates, and creative ideas to get more out of
            your online photobooth.
          </p>
        </div>
      </section>

      {/* Posts grid, Ahrefs-like layout (no color copying) */}
      <section className="mt-7 pb-12 pt-6">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-pink-100 bg-white p-6 text-pink-900/70">
              No posts yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="flex flex-col rounded-2xl border border-pink-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md"
                >
                  <h2 className="text-xl font-semibold leading-snug text-pink-700 sm:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm text-neutral-700 sm:text-base">
                    {post.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-pink-900/60">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="whitespace-nowrap">
                      {formatDate(post.date)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
