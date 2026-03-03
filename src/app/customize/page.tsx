"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as htmlToImage from "html-to-image";
import { Button } from "@/components/ui/button";
import { PhotoStripPreview } from "@/components/PhotoStripPreview";
import { templates, type PhotoTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "capturedPhotos";

type FilterOption = "none" | "sepia" | "grayscale" | "warm";

const BORDER_COLORS = [
  "#ffffff",
  "#000000",
  "#f9c6d0",
  "#c9a87c",
  "#ff6b9d",
  "#a8d8ea",
] as const;

const BG_COLORS = [
  "#ffffff",
  "#fff8f8",
  "#f5e6d3",
  "#1a1a1a",
  "#fff0f5",
  "#f0f4ff",
] as const;

export default function CustomizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") ?? templates[0]?.id ?? "";

  const baseTemplate: PhotoTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? templates[0],
    [templateId],
  );

  const [photos, setPhotos] = useState<string[]>([]);
  const [borderColor, setBorderColor] = useState<string>(baseTemplate.frameColor);
  const [bgColor, setBgColor] = useState<string>(baseTemplate.bgColor);
  const [filter, setFilter] = useState<FilterOption>(() =>
    baseTemplate.filterClass === "sepia"
      ? "sepia"
      : baseTemplate.filterClass === "grayscale"
        ? "grayscale"
        : "none",
  );
  const [footerText, setFooterText] = useState<string>(baseTemplate.footerText);
  const [isExporting, setIsExporting] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setBorderColor(baseTemplate.frameColor);
    setBgColor(baseTemplate.bgColor);
    setFilter(
      baseTemplate.filterClass === "sepia"
        ? "sepia"
        : baseTemplate.filterClass === "grayscale"
          ? "grayscale"
          : baseTemplate.filterClass === "warm"
            ? "warm"
            : "none",
    );
    setFooterText(baseTemplate.footerText);
  }, [baseTemplate.id, baseTemplate.frameColor, baseTemplate.bgColor, baseTemplate.filterClass, baseTemplate.footerText]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace(`/capture?templateId=${baseTemplate.id}`);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        router.replace(`/capture?templateId=${baseTemplate.id}`);
        return;
      }
      setPhotos(
        (parsed as string[]).filter((p) => typeof p === "string") ?? [],
      );
    } catch {
      router.replace(`/capture?templateId=${baseTemplate.id}`);
    }
  }, [baseTemplate.id, router]);

  const effectiveTemplate: PhotoTemplate = {
    ...baseTemplate,
    bgColor,
    frameColor: borderColor,
    filterClass:
      filter === "sepia"
        ? "sepia"
        : filter === "grayscale"
          ? "grayscale"
          : filter === "warm"
            ? "warm"
            : "",
    fontColor: baseTemplate.fontColor,
    footerText,
  };

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        cacheBust: true,
        width: 400,
        height: 1300,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `photobooth-${effectiveTemplate.id}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export image", err);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRetake = () => {
    router.push(`/capture?templateId=${baseTemplate.id}`);
  };

  const handleStartOver = () => {
    router.push("/");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 px-3 py-4 md:px-8 md:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">
              Step 3 · Customize &amp; Export
            </h1>
            <p className="mt-1 text-sm font-medium text-neutral-900 md:text-base">
              Fine-tune your photobooth strip and download a final image.
            </p>
          </div>
          <div className="hidden text-xs text-neutral-500 md:block">
            Template:{" "}
            <span className="font-semibold text-neutral-800">
              {baseTemplate.name}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* Left: live preview */}
          <section className="flex items-center justify-center rounded-[2rem] border border-neutral-200 bg-white/80 px-4 py-6 shadow-[0_18px_70px_rgba(15,23,42,0.12)] md:px-6">
            <div className="flex flex-col items-center gap-4">
              <PhotoStripPreview
                ref={previewRef}
                template={effectiveTemplate}
                photos={photos}
                scale={0.6}
              />
              <p className="text-xs text-neutral-500">
                Preview at 60% scale. Downloaded image will be full resolution.
              </p>
            </div>
          </section>

          {/* Right: controls */}
          <aside className="flex flex-col gap-4 rounded-[2rem] border border-neutral-200 bg-white/80 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.12)] md:p-6">
            {/* Border Color */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Border Color
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {BORDER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBorderColor(color)}
                    className={cn(
                      "h-7 w-7 rounded-full border border-neutral-200",
                      "transition-shadow",
                      borderColor === color &&
                        "ring-2 ring-rose-400 ring-offset-2 ring-offset-white",
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Border color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Background Color
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {BG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBgColor(color)}
                    className={cn(
                      "h-7 w-7 rounded-full border border-neutral-200",
                      "transition-shadow",
                      bgColor === color &&
                        "ring-2 ring-rose-400 ring-offset-2 ring-offset-white",
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Background color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Filter */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Filter
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    { id: "none", label: "None" },
                    { id: "sepia", label: "Sepia" },
                    { id: "grayscale", label: "Grayscale" },
                    { id: "warm", label: "Warm" },
                  ] as { id: FilterOption; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilter(opt.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[11px] transition",
                      filter === opt.id
                        ? "border-rose-400 bg-rose-500 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-rose-200",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer text */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Footer Text
              </h2>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="mt-2 w-full rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 outline-none ring-0 focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            {/* Download button */}
            <div className="mt-2">
              <Button
                className="w-full rounded-full bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_50px_rgba(244,114,182,0.35)] hover:bg-rose-400"
                onClick={handleDownload}
                disabled={isExporting || photos.length === 0}
              >
                {isExporting ? "Generating..." : "Download Photo Strip"}
              </Button>
            </div>

            {/* Bottom secondary actions */}
            <div className="mt-auto flex flex-wrap justify-between gap-2 pt-4 text-xs text-neutral-500">
              <button
                type="button"
                onClick={handleRetake}
                className="text-rose-500 hover:text-rose-600"
              >
                ← Retake Photos
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="hover:text-neutral-700"
              >
                Start Over
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Hidden full-scale strip for export (off-screen so html-to-image captures full res) */}
      <div
        className="pointer-events-none opacity-0"
        style={{ position: "absolute", left: -9999, top: 0 }}
      >
        <PhotoStripPreview
          ref={exportRef}
          template={effectiveTemplate}
          photos={photos}
          scale={1}
        />
      </div>
    </div>
  );
}
