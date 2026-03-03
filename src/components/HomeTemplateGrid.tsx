"use client";

import { useState } from "react";
import Link from "next/link";
import { templates, type PhotoTemplate } from "@/lib/templates";
import { PhotoStripPreview } from "@/components/PhotoStripPreview";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "selectedTemplateId";

export function HomeTemplateGrid() {
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY);
  });

  const handleSelect = (template: PhotoTemplate) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, template.id);
    }
    setSelectedId(template.id);
  };

  return (
    <div className="grid place-items-stretch grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
      {templates.map((template) => {
        const isSelected = selectedId === template.id;
        return (
          <Link
            key={template.id}
            href={`/capture?templateId=${template.id}`}
            onClick={() => handleSelect(template)}
            className={cn(
              "block h-full transform cursor-pointer rounded-3xl transition-transform duration-200 hover:scale-105",
              isSelected &&
                "ring-2 ring-rose-400 ring-offset-2 ring-offset-neutral-50",
            )}
          >
            <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
              <div className="flex h-64 justify-center overflow-hidden border-b border-neutral-200/70 bg-neutral-100/60">
                <PhotoStripPreview
                  template={template}
                  scale={0.32}
                  className="pointer-events-none"
                />
              </div>
              <div className="flex flex-1 flex-col items-center justify-between gap-2 px-3 pb-3 pt-2 text-center">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-neutral-900">
                    {template.name}
                  </h3>
                  <p className="mt-1 rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-500">
                    {template.category}
                  </p>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-rose-500">
                  Use This Template
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

