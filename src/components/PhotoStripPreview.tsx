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
};

export const PhotoStripPreview = React.forwardRef<
  HTMLDivElement,
  PhotoStripPreviewProps
>(function PhotoStripPreview(
  { template, photos = [], stickers = [], scale = 1, className, onClick },
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

  const framePattern = template.framePattern ?? "solid";
  const frameStyle: CSSProperties = {
    borderColor: template.frameColor,
    borderStyle: "solid",
    borderWidth: 4,
  };

  if (framePattern === "dashed") {
    frameStyle.borderStyle = "dashed";
  } else if (framePattern === "dotted") {
    frameStyle.borderStyle = "dotted";
  } else if (framePattern === "double") {
    frameStyle.borderStyle = "double";
    frameStyle.borderWidth = 6;
  } else if (framePattern === "stripe") {
    frameStyle.borderStyle = "solid";
    frameStyle.borderWidth = 6;
    frameStyle.borderImage = `repeating-linear-gradient(45deg, ${template.frameColor}, ${template.frameColor} 8px, #ffffff 8px, #ffffff 16px) 1`;
  } else if (framePattern === "gradient") {
    frameStyle.borderStyle = "solid";
    frameStyle.borderWidth = 6;
    frameStyle.borderImage = "linear-gradient(135deg, #ff6b9d, #f9c6d0, #ffd6e7, #ff6b9d) 1";
  } else if (framePattern === "lace") {
    frameStyle.borderStyle = "solid";
    frameStyle.borderWidth = 6;
    frameStyle.borderImage =
      "radial-gradient(circle at 4px 4px, #f8b7ca 0 2px, #ffe6ef 2px 6px) 1 round";
  } else if (framePattern === "gold-foil") {
    frameStyle.borderStyle = "solid";
    frameStyle.borderWidth = 6;
    frameStyle.borderImage =
      "linear-gradient(135deg, #d4af37 0%, #f7e7a8 22%, #b8860b 45%, #f2cc59 67%, #8c6a11 100%) 1";
  } else if (framePattern === "checker") {
    frameStyle.borderStyle = "solid";
    frameStyle.borderWidth = 6;
    frameStyle.borderImage =
      "repeating-conic-gradient(from 45deg, #ffd1e3 0deg 90deg, #fff 90deg 180deg) 1 round";
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
                ...frameStyle,
              }}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`Photo ${index + 1}`}
                  className="h-full w-full object-cover"
                  style={filterStyle}
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
            ...(footerStyle ?? {}),
          }}
          className="pt-3 text-xs tracking-[0.28em] uppercase"
        >
          <div className="font-semibold">{template.footerText}</div>
          <div className="mt-1 tracking-normal">{today}</div>
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

