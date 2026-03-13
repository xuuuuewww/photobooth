"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Renders Markdown images `![alt](path)` as Next.js Image.
 * Use in MDX components as the `img` override so that local images
 * under public/ are served with next/image (optimization, consistent styling).
 *
 * Path rules:
 * - Paths starting with "/" are used as-is (e.g. /blog-image/photo.png).
 * - Paths without leading "/" get "/" prepended so "blog-image/photo.png" → "/blog-image/photo.png".
 * - External URLs (http/https) are passed through for next/image to handle.
 */
export function BlogImg({
  src,
  alt = "",
  width,
  height,
  className,
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;

  const normalizedSrc =
    src.startsWith("http") || src.startsWith("//")
      ? src
      : src.startsWith("/")
        ? src
        : `/${src}`;

  const numericWidth = width != null ? Number(width) : undefined;
  const numericHeight = height != null ? Number(height) : undefined;
  const hasExplicitDimensions =
    typeof numericWidth === "number" &&
    numericWidth > 0 &&
    typeof numericHeight === "number" &&
    numericHeight > 0;

  const w = hasExplicitDimensions ? numericWidth! : 400;
  const h = hasExplicitDimensions ? numericHeight! : 800;

  return (
    <figure className="not-prose my-6 w-full flex justify-center">
      <span className="inline-block" style={{ maxWidth: `${w}px` }}>
      <Image
        src={normalizedSrc}
        alt={alt}
        width={w}
        height={h}
        className={cn("rounded-xl object-contain w-full h-auto max-w-full", className)}
        unoptimized
      />
      </span>
    </figure>
  );
}
