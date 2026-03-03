"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import type { PhotoTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

type PhotoStripPreviewProps = {
  template: PhotoTemplate;
  photos?: string[];
  scale?: number;
  className?: string;
};

export const PhotoStripPreview = React.forwardRef<
  HTMLDivElement,
  PhotoStripPreviewProps
>(function PhotoStripPreview(
  { template, photos = [], scale = 1, className },
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

  const frameStyle: CSSProperties = {
    borderColor: template.frameColor,
  };

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
      className={cn("rounded-3xl shadow-2xl", className)}
      style={rootStyle}
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
              className="overflow-hidden rounded-[8px] border-4 bg-[#e0e0e0]"
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
    </div>
  );
});

