"use client";

import Link from "next/link";
import { templates, type PhotoTemplate } from "@/lib/templates";
import { PhotoStripPreview } from "@/components/PhotoStripPreview";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "selectedTemplateId";
const DEMO_PHOTOS: Record<string, string[]> = {
  "vintage-sepia": [
    "/demo/vintage/1.jpg",
    "/demo/vintage/2.png",
    "/demo/vintage/3.png",
    "/demo/vintage/4.png",
  ],
  "wedding-classic": [
    "/demo/wedding/1.png",
    "/demo/wedding/2.png",
    "/demo/wedding/3.png",
    "/demo/wedding/4.jpg",
  ],
  "romantic-bw": [
    "/demo/bw/1.png",
    "/demo/bw/2.png",
    "/demo/bw/3.png",
    "/demo/bw/4.JPG",
  ],
  "romantic-color": [
    "/demo/color/1.png",
    "/demo/color/2.jpg",
    "/demo/color/3.png",
    "/demo/color/4.png",
  ],
};

export function HomeTemplateGrid() {
  const handleSelect = (template: PhotoTemplate) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, template.id);
    }
  };

  return (
    <div className="grid place-items-stretch grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
      {templates.map((template) => {
        return (
          <Link
            key={template.id}
            href={`/capture?templateId=${template.id}`}
            onClick={() => handleSelect(template)}
            className="group block h-full cursor-pointer rounded-3xl transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.02]"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition-all duration-200 group-hover:border-rose-300 group-hover:shadow-[0_18px_45px_rgba(244,114,182,0.28)]">
              <div className="flex h-[430px] justify-center overflow-hidden border-b border-neutral-200/70 bg-neutral-100/60 transition-colors duration-200 group-hover:bg-rose-50/70">
                <PhotoStripPreview
                  template={template}
                  photos={DEMO_PHOTOS[template.id] ?? []}
                  scale={0.32}
                  className="pointer-events-none"
                />
              </div>
              <div className="px-3 pb-4 pt-3 text-center">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-neutral-900">
                    {template.name}
                  </h3>
                  <p className="mt-2 rounded-full bg-rose-500 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-200 group-hover:bg-rose-400">
                    Use this template &gt;
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

