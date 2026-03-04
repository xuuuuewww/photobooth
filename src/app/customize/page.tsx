"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as htmlToImage from "html-to-image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PhotoStripPreview,
  type StickerPlacement,
} from "@/components/PhotoStripPreview";
import { templates, type PhotoTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "capturedPhotos";
const STRIP_WIDTH = 400;
const STRIP_HEIGHT = 1300;
const PREVIEW_SCALE = 0.6;
const MOBILE_PREVIEW_SCALE = 0.26;
const DEFAULT_STICKER_SIZE = 74;

type FilterOption = "none" | "sepia" | "grayscale" | "warm";
type BackgroundPatternOption =
  | "solid"
  | "dots"
  | "checker"
  | "diagonal-stripe"
  | "grid";

const BG_COLORS = [
  "#ffffff",
  "#000000",
  "#f9c6d0",
  "#c9a87c",
  "#ff6b9d",
  "#a8d8ea",
  "#ff9dbb",
  "#f4d35e",
  "#7bd389",
  "#8b80f9",
  "#ff7f50",
  "#3b3b3b",
] as const;

const BG_PATTERNS: { id: BackgroundPatternOption; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "dots", label: "Dots" },
  { id: "checker", label: "Checker" },
  { id: "diagonal-stripe", label: "Diagonal Stripe" },
  { id: "grid", label: "Grid" },
];

const STICKER_PRESETS = [
  { id: "heart", src: "/stickers/heart.svg", label: "Heart" },
  { id: "star", src: "/stickers/star.svg", label: "Star" },
  { id: "sparkle", src: "/stickers/sparkle.svg", label: "Sparkle" },
  { id: "bow", src: "/stickers/bow.svg", label: "Bow" },
  { id: "flower", src: "/stickers/flower.svg", label: "Flower" },
  { id: "crown", src: "/stickers/crown.svg", label: "Crown" },
  { id: "smile", src: "/stickers/smile.svg", label: "Smile" },
  { id: "butterfly", src: "/stickers/butterfly.svg", label: "Butterfly" },
  { id: "cherry", src: "/stickers/cherry.svg", label: "Cherry" },
  { id: "paw", src: "/stickers/paw.svg", label: "Paw" },
  { id: "lightning", src: "/stickers/lightning.svg", label: "Lightning" },
  { id: "moon", src: "/stickers/moon.svg", label: "Moon" },
  { id: "rainbow", src: "/stickers/rainbow.svg", label: "Rainbow" },
  { id: "camera", src: "/stickers/camera.svg", label: "Camera" },
] as const;

async function waitForImagesReady(
  root: HTMLElement,
  timeoutMs = 5000,
): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  if (images.length === 0) return;

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }

          const handleDone = () => {
            cleanup();
            resolve();
          };

          const cleanup = () => {
            img.removeEventListener("load", handleDone);
            img.removeEventListener("error", handleDone);
            window.clearTimeout(timer);
          };

          const timer = window.setTimeout(handleDone, timeoutMs);
          img.addEventListener("load", handleDone);
          img.addEventListener("error", handleDone);
        }),
    ),
  );
}

function CustomizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") ?? templates[0]?.id ?? "";

  const baseTemplate: PhotoTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? templates[0],
    [templateId],
  );

  const [photos, setPhotos] = useState<string[]>([]);
  const [bgColor, setBgColor] = useState<string>(baseTemplate.bgColor);
  const [bgPattern, setBgPattern] = useState<BackgroundPatternOption>("solid");
  const [filter, setFilter] = useState<FilterOption>(() =>
    baseTemplate.filterClass === "sepia"
      ? "sepia"
      : baseTemplate.filterClass === "grayscale"
        ? "grayscale"
        : "none",
  );
  const [footerText, setFooterText] = useState<string>(baseTemplate.footerText);
  const [selectedStickerSrc, setSelectedStickerSrc] = useState<string | null>(
    null,
  );
  const [stickers, setStickers] = useState<StickerPlacement[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [mobileOpenSection, setMobileOpenSection] = useState<
    "background" | "filter" | "stickers" | "footer"
  >("background");

  const previewRef = useRef<HTMLDivElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setBgColor(baseTemplate.bgColor);
    setBgPattern(
      (baseTemplate.bgPattern as BackgroundPatternOption | undefined) ?? "solid",
    );
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
  }, [
    baseTemplate.id,
    baseTemplate.bgColor,
    baseTemplate.bgPattern,
    baseTemplate.filterClass,
    baseTemplate.footerText,
  ]);

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
    bgPattern,
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
      await waitForImagesReady(exportRef.current);

      const blob = await htmlToImage.toBlob(exportRef.current, {
        cacheBust: true,
        width: 400,
        height: 1300,
      });
      if (!blob) {
        throw new Error("Failed to generate image blob.");
      }

      const fileName = `photobooth-${effectiveTemplate.id}-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(
        navigator.userAgent,
      );
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      const objectUrl = URL.createObjectURL(blob);

      // On iOS Safari, opening the image is the most reliable way to allow
      // "Save to Photos" via long-press.
      if (isIOS) {
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
        return;
      }

      // Preferred mobile path: invoke native share sheet so users can save to Photos.
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "Photo Strip",
          files: [file],
        });
        URL.revokeObjectURL(objectUrl);
        return;
      }

      if (isMobile) {
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
        return;
      }

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
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

  const handlePreviewClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!selectedStickerSrc) return;

    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const rawX = ((event.clientX - rect.left) / rect.width) * STRIP_WIDTH;
    const rawY = ((event.clientY - rect.top) / rect.height) * STRIP_HEIGHT;
    const half = DEFAULT_STICKER_SIZE / 2;

    const x = Math.min(Math.max(rawX, half), STRIP_WIDTH - half);
    const y = Math.min(Math.max(rawY, half), STRIP_HEIGHT - half);

    const newSticker: StickerPlacement = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      src: selectedStickerSrc,
      x,
      y,
      size: DEFAULT_STICKER_SIZE,
      rotation: Math.round(Math.random() * 16 - 8),
    };

    setStickers((prev) => [...prev, newSticker]);
  };

  const handleUndoSticker = () => {
    setStickers((prev) => prev.slice(0, -1));
  };

  const handleClearStickers = () => {
    setStickers([]);
  };

  return (
    <div className="min-h-[calc(100vh-46px)] bg-neutral-50 px-3 py-2 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex h-[calc(100dvh-46px)] min-h-0 flex-col overflow-hidden md:hidden">
          <div className="sticky top-0 z-20 bg-neutral-50 pb-1">
            <h1 className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap overflow-hidden text-ellipsis text-pink-500">
              Step 3 · Customize Your Photo Strip &amp; Download
            </h1>
            <section className="relative flex h-[clamp(21rem,41vh,24rem)] items-center rounded-[1.75rem] border border-neutral-200 bg-white/90 px-3 py-3 shadow-[0_18px_70px_rgba(15,23,42,0.12)]">
              <div className="flex w-full items-center justify-center gap-2">
                <div className="relative flex w-[68%] max-w-[15rem] flex-none items-center justify-center rounded-[1.25rem] py-2">
                  <div className="relative h-[338px] w-[104px]">
                    <PhotoStripPreview
                      ref={previewRef}
                      template={effectiveTemplate}
                      photos={photos}
                      stickers={stickers}
                      scale={MOBILE_PREVIEW_SCALE}
                      onClick={handlePreviewClick}
                      className={cn(
                        "absolute left-1/2 top-0 -translate-x-1/2",
                        selectedStickerSrc ? "cursor-crosshair" : "cursor-default",
                      )}
                    />
                  </div>
                </div>
                <div className="w-[7.8rem] shrink-0 space-y-2">
                  <Button
                    className="h-11 w-full rounded-full bg-pink-500 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(244,114,182,0.3)] hover:bg-pink-400"
                    onClick={handleDownload}
                    disabled={isExporting || photos.length === 0}
                  >
                    {isExporting ? "Generating..." : "Download"}
                  </Button>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-pink-200 bg-white px-3 text-xs font-semibold text-pink-600 transition hover:bg-pink-50"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-pink-200 bg-white px-3 text-xs font-semibold text-pink-600 transition hover:bg-pink-50"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-3">
            <aside className="rounded-[1.5rem] border border-neutral-200 bg-white/95 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.1)]">
              <div className="space-y-3">
                <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpenSection("background")}
                    className="flex w-full items-center justify-between py-3 text-left"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-700">
                      Background
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-neutral-500 transition-transform",
                        mobileOpenSection === "background" && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300",
                      mobileOpenSection === "background"
                        ? "grid-rows-[1fr] pb-3"
                        : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden space-y-3">
                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                          Background Color
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                          {BG_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setBgColor(color)}
                              className={cn(
                                "h-8 w-8 shrink-0 rounded-full border border-neutral-200",
                                bgColor === color &&
                                  "ring-2 ring-pink-400 ring-offset-2 ring-offset-white",
                              )}
                              style={{ backgroundColor: color }}
                              aria-label={`Background color ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                          Background Pattern
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {BG_PATTERNS.map((pattern) => (
                            <button
                              key={pattern.id}
                              type="button"
                              onClick={() => setBgPattern(pattern.id)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-[11px] transition",
                                bgPattern === pattern.id
                                  ? "border-pink-400 bg-pink-500 text-white"
                                  : "border-neutral-200 bg-white text-neutral-700 hover:border-pink-200",
                              )}
                            >
                              {pattern.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpenSection("filter")}
                    className="flex w-full items-center justify-between py-3 text-left"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-700">
                      Filter
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-neutral-500 transition-transform",
                        mobileOpenSection === "filter" && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300",
                      mobileOpenSection === "filter"
                        ? "grid-rows-[1fr] pb-3"
                        : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-wrap gap-2">
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
                                ? "border-pink-400 bg-pink-500 text-white"
                                : "border-neutral-200 bg-white text-neutral-700 hover:border-pink-200",
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpenSection("stickers")}
                    className="flex w-full items-center justify-between py-3 text-left"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-700">
                      Stickers
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-neutral-500 transition-transform",
                        mobileOpenSection === "stickers" && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300",
                      mobileOpenSection === "stickers"
                        ? "grid-rows-[1fr] pb-3"
                        : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden space-y-3">
                      <p className="text-[11px] text-neutral-500">
                        Select a sticker, then click the photo strip preview to place it.
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {STICKER_PRESETS.map((sticker) => {
                          const isActive = selectedStickerSrc === sticker.src;
                          return (
                            <button
                              key={sticker.id}
                              type="button"
                              onClick={() =>
                                setSelectedStickerSrc(isActive ? null : sticker.src)
                              }
                              className={cn(
                                "rounded-md border bg-white p-1.5 transition",
                                isActive
                                  ? "border-pink-400 ring-2 ring-pink-300/60"
                                  : "border-neutral-200 hover:border-pink-200",
                              )}
                              aria-label={`Select ${sticker.label} sticker`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={sticker.src}
                                alt=""
                                className="mx-auto h-6 w-6"
                                draggable={false}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleUndoSticker}
                          disabled={stickers.length === 0}
                          className="rounded-full border border-neutral-200 px-3 py-1.5 text-[11px] text-neutral-700 transition hover:border-pink-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Undo Sticker
                        </button>
                        <button
                          type="button"
                          onClick={handleClearStickers}
                          disabled={stickers.length === 0}
                          className="rounded-full border border-neutral-200 px-3 py-1.5 text-[11px] text-neutral-700 transition hover:border-pink-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpenSection("footer")}
                    className="flex w-full items-center justify-between py-3 text-left"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-700">
                      Footer Text
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-neutral-500 transition-transform",
                        mobileOpenSection === "footer" && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300",
                      mobileOpenSection === "footer"
                        ? "grid-rows-[1fr] pb-3"
                        : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <input
                        type="text"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        className="w-full rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-800 outline-none ring-0 focus:border-pink-300 focus:ring-2 focus:ring-pink-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

        </div>

        <div className="hidden md:flex md:flex-col md:gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
                Step 3 · Customize Your Photo Strip &amp; Download
              </h1>
            </div>
            <div className="hidden text-xs text-neutral-500 md:block">
              Template:{" "}
              <span className="font-semibold text-neutral-800">
                {baseTemplate.name}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:items-start md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            {/* Left: live preview */}
            <section className="flex items-center justify-center rounded-[2rem] border border-neutral-200 bg-white/80 px-4 py-6 shadow-[0_18px_70px_rgba(15,23,42,0.12)] md:px-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-[780px] w-[240px]">
                  <PhotoStripPreview
                    ref={previewRef}
                    template={effectiveTemplate}
                    photos={photos}
                    stickers={stickers}
                    scale={PREVIEW_SCALE}
                    onClick={handlePreviewClick}
                    className={cn(
                      "absolute left-1/2 top-0 -translate-x-1/2",
                      selectedStickerSrc ? "cursor-crosshair" : "cursor-default",
                    )}
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  {selectedStickerSrc
                    ? "Sticker selected: click the preview to place it."
                    : "Preview at 60% scale. Downloaded image will be full resolution."}
                </p>
              </div>
            </section>

            {/* Right: controls */}
            <aside className="flex flex-col rounded-[2rem] border border-neutral-200 bg-white/90 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.12)] md:p-6">
              {/* Background Color */}
              <div className="space-y-2 border-b border-neutral-100 pb-4">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-neutral-700">
                  Background Color
                </h2>
                <div className="flex flex-wrap gap-2">
                  {BG_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBgColor(color)}
                      className={cn(
                        "h-7 w-7 rounded-full border border-neutral-200",
                        "transition-shadow",
                        bgColor === color &&
                          "ring-2 ring-pink-400 ring-offset-2 ring-offset-white",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Background color ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Background Pattern */}
              <div className="space-y-2 border-b border-neutral-100 py-4">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-neutral-700">
                  Background Pattern
                </h2>
                <div className="grid grid-cols-4 gap-2 lg:grid-cols-5">
                  {BG_PATTERNS.map((pattern) => (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => setBgPattern(pattern.id)}
                      className={cn(
                        "rounded-full border px-2 py-1 text-[10px] leading-none transition md:text-[11px]",
                        bgPattern === pattern.id
                          ? "border-pink-400 bg-pink-500 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-pink-200",
                      )}
                    >
                      {pattern.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter */}
              <div className="space-y-2 border-b border-neutral-100 py-4">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-neutral-700">
                  Filter
                </h2>
                <div className="flex flex-wrap gap-2">
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
                          ? "border-pink-400 bg-pink-500 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-pink-200",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stickers */}
              <div className="space-y-2 border-b border-neutral-100 py-4">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-neutral-700">
                  Stickers
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Select a sticker, then click the photo strip preview to place it.
                </p>
                <div className="grid grid-cols-7 gap-1 pt-1">
                  {STICKER_PRESETS.map((sticker) => {
                    const isActive = selectedStickerSrc === sticker.src;
                    return (
                      <button
                        key={sticker.id}
                        type="button"
                        onClick={() =>
                          setSelectedStickerSrc(isActive ? null : sticker.src)
                        }
                        className={cn(
                          "rounded-md border bg-white p-1 transition",
                          isActive
                            ? "border-pink-400 ring-2 ring-pink-300/60"
                            : "border-neutral-200 hover:border-pink-200",
                        )}
                        aria-label={`Select ${sticker.label} sticker`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sticker.src}
                          alt=""
                          className="mx-auto h-5 w-5 md:h-6 md:w-6"
                          draggable={false}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleUndoSticker}
                    disabled={stickers.length === 0}
                    className="rounded-full border border-neutral-200 px-3 py-1.5 text-[11px] text-neutral-700 transition hover:border-pink-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Undo Sticker
                  </button>
                  <button
                    type="button"
                    onClick={handleClearStickers}
                    disabled={stickers.length === 0}
                    className="rounded-full border border-neutral-200 px-3 py-1.5 text-[11px] text-neutral-700 transition hover:border-pink-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Footer text */}
              <div className="space-y-2 border-b border-neutral-100 py-4">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-neutral-700">
                  Footer Text
                </h2>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 outline-none ring-0 focus:border-pink-300 focus:ring-2 focus:ring-pink-200"
                />
              </div>

              {/* Download button */}
              <div className="pt-4">
                <Button
                  className="w-full rounded-full bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_50px_rgba(244,114,182,0.35)] hover:bg-pink-400"
                  onClick={handleDownload}
                  disabled={isExporting || photos.length === 0}
                >
                  {isExporting ? "Generating..." : "Download Photo Strip"}
                </Button>
              </div>

              {/* Bottom secondary actions */}
              <div className="flex flex-wrap justify-between gap-2 pt-4 text-xs text-neutral-500">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="text-pink-500 hover:text-pink-600"
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
          stickers={stickers}
          scale={1}
        />
      </div>
    </div>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-pink-500">Loading...</div>}>
      <CustomizeContent />
    </Suspense>
  );
}
