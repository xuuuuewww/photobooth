"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { templates, type PhotoTemplate } from "@/lib/templates";
import { PhotoStripPreview } from "@/components/PhotoStripPreview";
import { cn } from "@/lib/utils";
import { trackTemplateClick } from "@/lib/analytics";

const STORAGE_KEY = "selectedTemplateId";
const DEMO_PHOTOS: Record<string, string[]> = {
  "vintage-sepia": [
    "/demo/vintage/1.webp",
    "/demo/vintage/2.webp",
    "/demo/vintage/3.webp",
    "/demo/vintage/4.webp",
  ],
  "wedding-classic": [
    "/demo/wedding/1.webp",
    "/demo/wedding/2.webp",
    "/demo/wedding/3.webp",
    "/demo/wedding/4.webp",
  ],
  "romantic-bw": [
    "/demo/bw/1.webp",
    "/demo/bw/2.webp",
    "/demo/bw/3.webp",
    "/demo/bw/4.webp",
  ],
  "romantic-color": [
    "/demo/color/1.webp",
    "/demo/color/2.webp",
    "/demo/color/3.webp",
    "/demo/color/4.webp",
  ],
};

const DEMO_PHOTO_ALTS: Record<string, string[]> = {
  "vintage-sepia": [
    "Vintage Sepia photo strip template - sample photo 1",
    "Vintage Sepia photo strip template - sample photo 2",
    "Vintage Sepia photo strip template - sample photo 3",
    "Vintage Sepia photo strip template - sample photo 4",
  ],
  "wedding-classic": [
    "Wedding Classic photo strip template - sample photo 1",
    "Wedding Classic photo strip template - sample photo 2",
    "Wedding Classic photo strip template - sample photo 3",
    "Wedding Classic photo strip template - sample photo 4",
  ],
  "romantic-bw": [
    "Romantic Black and White photo strip template - sample photo 1",
    "Romantic Black and White photo strip template - sample photo 2",
    "Romantic Black and White photo strip template - sample photo 3",
    "Romantic Black and White photo strip template - sample photo 4",
  ],
  "romantic-color": [
    "Romantic Color photo strip template - sample photo 1",
    "Romantic Color photo strip template - sample photo 2",
    "Romantic Color photo strip template - sample photo 3",
    "Romantic Color photo strip template - sample photo 4",
  ],
};

const MOBILE_TAB_ORDER = [
  { id: "vintage-sepia", label: "Vintage" },
  { id: "wedding-classic", label: "Wedding" },
  { id: "romantic-bw", label: "Black & White" },
  { id: "romantic-color", label: "Romantic" },
] as const;

export function HomeTemplateGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimerRef = useRef<number | null>(null);

  const orderedTemplates = useMemo(() => {
    const lookup = new Map(templates.map((template) => [template.id, template]));
    return MOBILE_TAB_ORDER.flatMap(({ id, label }) => {
      const template = lookup.get(id);
      return template ? [{ label, template }] : [];
    });
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const item = carousel.children[index] as HTMLElement | undefined;
    if (!item) return;
    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimerRef.current) {
      window.clearTimeout(programmaticScrollTimerRef.current);
    }
    item.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    setActiveIndex(index);
    programmaticScrollTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      programmaticScrollTimerRef.current = null;
    }, 380);
  }, []);

  const handleSelect = (template: PhotoTemplate) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, template.id);
    }
  };

  const handleCarouselScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    const carousel = carouselRef.current;
    if (!carousel) return;
    const children = Array.from(carousel.children) as HTMLElement[];
    if (!children.length) return;
    const center = carousel.scrollLeft + carousel.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(childCenter - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  }, [activeIndex]);

  const canSlidePrev = activeIndex > 0;
  const canSlideNext = activeIndex < orderedTemplates.length - 1;

  useEffect(() => {
    return () => {
      if (programmaticScrollTimerRef.current) {
        window.clearTimeout(programmaticScrollTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="md:hidden" aria-hidden="true">
        <div className="relative">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-7 bg-gradient-to-r from-neutral-50 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-7 bg-gradient-to-l from-neutral-50 to-transparent" />
          <div
            className="overflow-x-auto px-0.5 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Template categories"
          >
            <div className="mx-auto flex w-max gap-1.5">
              {orderedTemplates.map((item, index) => (
                <button
                  key={item.template.id}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300",
                    activeIndex === index
                      ? "border-pink-300 bg-pink-500 text-white shadow-[0_8px_24px_rgba(244,114,182,0.32)]"
                      : "border-neutral-200 bg-white text-neutral-700",
                  )}
                  aria-label={`Show ${item.label} template`}
                  aria-pressed={activeIndex === index}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-4">
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={!canSlidePrev}
            aria-label="Previous template"
            className={cn(
              "absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/70 bg-white/65 p-2 text-neutral-700 shadow-md backdrop-blur-sm transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300",
              canSlidePrev ? "opacity-100" : "opacity-40",
            )}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[7%] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Template preview carousel"
          >
            {orderedTemplates.map(({ template }, index) => (
              <div
                key={template.id}
                className="w-[86%] shrink-0 snap-center rounded-[1.75rem] border border-neutral-200 bg-white/90 p-3 shadow-[0_16px_42px_rgba(15,23,42,0.12)] transition-transform duration-300"
              >
                <Link
                  href={`/capture?templateId=${template.id}`}
                  onClick={() => {
                    handleSelect(template);
                    trackTemplateClick(template.name);
                  }}
                  className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
                >
                  <div className="flex h-[470px] items-start justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-100/70 to-white/80">
                    <PhotoStripPreview
                      template={template}
                      photos={DEMO_PHOTOS[template.id] ?? []}
                      photoAlts={DEMO_PHOTO_ALTS[template.id]}
                      scale={0.34}
                      className="pointer-events-none drop-shadow-[0_16px_24px_rgba(15,23,42,0.2)]"
                      priority={index === 0}
                    />
                  </div>
                  <div className="px-1 pb-1 pt-3 text-center">
                    <h3 className="text-sm font-semibold tracking-wide text-neutral-900">
                      {template.name}
                    </h3>
                    <p className="mt-2 rounded-full bg-pink-500 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                      Use this template &gt;
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              scrollToIndex(Math.min(orderedTemplates.length - 1, activeIndex + 1))
            }
            disabled={!canSlideNext}
            aria-label="Next template"
            className={cn(
              "absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/70 bg-white/65 p-2 text-neutral-700 shadow-md backdrop-blur-sm transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300",
              canSlideNext ? "opacity-100" : "opacity-40",
            )}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
          {orderedTemplates.map((item, index) => (
            <span
              key={item.template.id}
              className={cn(
                "h-1.5 rounded-full transition-all",
                activeIndex === index
                  ? "w-5 bg-pink-500"
                  : "w-1.5 bg-pink-200/90",
              )}
            />
          ))}
        </div>
      </div>

      <div className="hidden place-items-stretch grid-cols-1 gap-4 sm:grid-cols-2 md:grid md:grid-cols-4 md:gap-6">
        {templates.map((template, index) => {
          return (
            <Link
              key={template.id}
              href={`/capture?templateId=${template.id}`}
              onClick={() => {
                handleSelect(template);
                trackTemplateClick(template.name);
              }}
              className="group block h-full cursor-pointer rounded-3xl transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition-all duration-200 group-hover:border-pink-300 group-hover:shadow-[0_18px_45px_rgba(244,114,182,0.28)]">
                <div className="flex h-[430px] justify-center overflow-hidden border-b border-neutral-200/70 bg-neutral-100/60 transition-colors duration-200 group-hover:bg-pink-50/70">
                  <PhotoStripPreview
                    template={template}
                    photos={DEMO_PHOTOS[template.id] ?? []}
                    photoAlts={DEMO_PHOTO_ALTS[template.id]}
                    scale={0.32}
                    className="pointer-events-none"
                    priority={index === 0}
                  />
                </div>
                <div className="px-3 pb-4 pt-3 text-center">
                  <div>
                    <h3 className="text-sm font-semibold tracking-wide text-neutral-900">
                      {template.name}
                    </h3>
                    <p className="mt-2 rounded-full bg-pink-500 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-200 group-hover:bg-pink-400">
                      Use this template &gt;
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

