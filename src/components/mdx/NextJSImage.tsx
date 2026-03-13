"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function NextJSImage({
  src,
  alt,
  width = 800,
  height = 400,
  className,
  style,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const resolvedWidth = Number.isFinite(width) ? width : 800;
  const resolvedHeight = Number.isFinite(height) ? height : 400;

  return (
    <figure className="not-prose my-6 w-full flex justify-center">
      <span
        className="inline-block w-full"
        style={{ maxWidth: `${resolvedWidth}px`, ...style }}
      >
        <Image
          src={src.startsWith("/") ? src : `/images/blog/${src}`}
          alt={alt}
          width={resolvedWidth}
          height={resolvedHeight}
          className={cn("rounded-xl object-contain w-full h-auto max-w-full", className)}
          unoptimized
        />
      </span>
    </figure>
  );
}
