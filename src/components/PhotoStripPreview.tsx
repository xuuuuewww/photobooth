"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import type { PhotoTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

export type StickerPlacement = {
  id: string;
  src: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
};

type PhotoStripPreviewProps = {
  template: PhotoTemplate;
  photos?: string[];
  stickers?: StickerPlacement[];
  scale?: number;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  /** When true, the 4 slot images use priority loading (e.g. for first template card LCP). */
  priority?: boolean;
  /** Per-slot alt text for preview images (e.g. home template cards). */
  photoAlts?: string[];
};
export const PhotoStripPreview = React.forwardRef<
  HTMLDivElement,
  PhotoStripPreviewProps
>(function PhotoStripPreview(
  {
    template,
    photos = [],
    stickers = [],
    scale = 1,
    className,
    onClick,
    priority = false,
    photoAlts,
  },
  ref
) {
  const slots = Array.from(
    { length: template.photoCount },
    (_, index) => photos[index] ?? null,
  );

  const rootStyle: CSSProperties = {
    width: 400,
    height: 1300,
    transform: `scale(${scale ?? 1})`,
    transformOrigin: "top center",
    backgroundColor: template.bgColor,
  };

  const bgPattern = template.bgPattern ?? "solid";
  if (bgPattern === "dots") {
    rootStyle.backgroundImage =
      "radial-gradient(rgba(255,255,255,0.7) 1.4px, transparent 1.4px)";
    rootStyle.backgroundSize = "12px 12px";
  } else if (bgPattern === "checker") {
    rootStyle.backgroundImage =
      "linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4)), linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4))";
    rootStyle.backgroundSize = "16px 16px";
    rootStyle.backgroundPosition = "0 0, 8px 8px";
  } else if (bgPattern === "diagonal-stripe") {
    rootStyle.backgroundImage =
      "repeating-linear-gradient(135deg, rgba(255,255,255,0.34), rgba(255,255,255,0.34) 8px, transparent 8px, transparent 16px)";
  } else if (bgPattern === "grid") {
    rootStyle.backgroundImage =
      "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)";
    rootStyle.backgroundSize = "18px 18px";
  }

  let filterStyle: CSSProperties = {};
  if (template.filterClass === "sepia") {
    filterStyle = { filter: "sepia(1)" };
  } else if (template.filterClass === "grayscale") {
    filterStyle = { filter: "grayscale(1)" };
  } else if (template.filterClass === "warm") {
    filterStyle = { filter: "saturate(1.3) brightness(1.05)" };
  }

  const footerStyle: CSSProperties = {
    color: template.fontColor,
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <div
      ref={ref}
      className={cn("relative rounded-3xl shadow-2xl", className)}
      style={rootStyle}
      onClick={onClick}
    >
      <div
        style={{
          height: "100%",
          padding: 30,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          {slots.map((src, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[8px] bg-[#e0e0e0]"
              style={{
                width: 340,
                height: 240,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {src ? (
                <Image
                  src={src}
                  alt={
                    photoAlts?.[index] ??
                    `Photobooth sample image ${index + 1}`
                  }
                  width={340}
                  height={240}
                  className="h-full w-full object-cover"
                  style={filterStyle}
                  priority={priority}
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                  Slot {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.35)",
            ...(footerStyle ?? {}),
          }}
          className="pt-3 text-[16px] font-bold tracking-[0.2em] uppercase"
        >
          <div className="font-semibold">{template.footerText}</div>
          <div className="mt-1 text-[13px] font-semibold tracking-[0.08em]">{today}</div>
        </div>
      </div>

      {stickers.map((sticker) => (
        <Image
          key={sticker.id}
          src={sticker.src}
          alt="Sticker"
          width={sticker.size}
          height={sticker.size}
          className="pointer-events-none absolute select-none"
          style={{
            left: sticker.x - sticker.size / 2,
            top: sticker.y - sticker.size / 2,
            transform: `rotate(${sticker.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
});

