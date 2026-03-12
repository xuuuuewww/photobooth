"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function NextJSImage({
  src,
  alt,
  width = 800,
  height = 400,
  className,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <figure className="not-prose my-6 flex justify-center">
      <Image
        src={src.startsWith("/") ? src : `/images/blog/${src}`}
        alt={alt}
        width={width}
        height={height}
        className={cn("rounded-xl object-cover", className)}
        unoptimized
      />
    </figure>
  );
}
