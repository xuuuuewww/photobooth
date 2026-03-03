"use client";

import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export type PhotoStripTemplateId =
  | "vintage-sepia"
  | "wedding-classic"
  | "romantic-bw"
  | "romantic-color";

type PhotoStripTemplateProps = {
  photos: string[];
  templateId: PhotoStripTemplateId;
  className?: string;
};

const TEMPLATE_STYLES: Record<
  PhotoStripTemplateId,
  {
    stripBg: string;
    photoWrap: string;
    photoImg: string;
    footerText: string;
    footerLogoFont: string;
    placeholder: string;
  }
> = {
  "vintage-sepia": {
    stripBg: "bg-[#f4ecd8]",
    photoWrap: "rounded-md overflow-hidden",
    photoImg: "sepia contrast-125 brightness-90",
    footerText: "text-neutral-900/90",
    footerLogoFont: "font-serif tracking-[0.18em]",
    placeholder: "bg-neutral-200/70 text-neutral-600",
  },
  "wedding-classic": {
    stripBg: "bg-white",
    photoWrap: "rounded-md overflow-hidden border border-gray-200",
    photoImg: "",
    footerText: "text-neutral-900/90",
    footerLogoFont: "font-light tracking-[0.22em]",
    placeholder: "bg-neutral-100 text-neutral-500 border border-gray-200",
  },
  "romantic-bw": {
    stripBg: "bg-black",
    photoWrap: "rounded-md overflow-hidden",
    photoImg: "grayscale contrast-125",
    footerText: "text-white/90",
    footerLogoFont: "font-medium tracking-[0.22em]",
    placeholder: "bg-white/10 text-white/70 ring-1 ring-white/15",
  },
  "romantic-color": {
    stripBg: "bg-pink-50",
    photoWrap: "rounded-sm overflow-hidden",
    photoImg: "saturate-110",
    footerText: "text-rose-900/80",
    footerLogoFont: "font-medium tracking-[0.2em]",
    placeholder: "bg-rose-100/70 text-rose-700/70",
  },
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function PhotoStripTemplate({
  photos,
  templateId,
  className,
}: PhotoStripTemplateProps) {
  const styles = TEMPLATE_STYLES[templateId];
  const normalized = Array.from({ length: 4 }, (_, i) => photos[i] ?? null);
  const today = formatDate(new Date());

  return (
    <div
      className={cn(
        "w-72 p-4 shadow-2xl",
        "rounded-3xl",
        styles.stripBg,
        className,
      )}
      aria-label={`Photobooth strip template: ${templateId}`}
    >
      <div className="flex flex-col gap-4">
        {normalized.map((src, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <div
              className={cn(
                "aspect-[4/3] w-full",
                "flex items-center justify-center",
                styles.photoWrap,
                !src && styles.placeholder,
              )}
            >
              {src ? (
                <img
                  src={src}
                  alt={`Photo ${idx + 1}`}
                  className={cn(
                    "h-full w-full object-cover",
                    "filter",
                    styles.photoImg,
                  )}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Camera className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[11px] font-medium tracking-wide">
                    Add photo
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className={cn("pt-1 text-center", styles.footerText)}>
          <div
            className={cn(
              "text-[11px] font-semibold uppercase",
              styles.footerLogoFont,
            )}
          >
            PHOTOBOOTH.ONLINE
          </div>
          <div className="mt-1 text-[11px] opacity-80">{today}</div>
        </div>
      </div>
    </div>
  );
}

