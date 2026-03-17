"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Camera, Download, RotateCcw } from "lucide-react";
import { templates, type PhotoTemplate } from "@/lib/templates";
import {
  PhotoStripPreview,
  type StickerPlacement,
} from "@/components/PhotoStripPreview";
import { cn } from "@/lib/utils";

const STICKER_OPTIONS = [
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

const STRIP_STICKER_POSITIONS = [
  { x: 200, y: 280 },
  { x: 200, y: 580 },
  { x: 200, y: 880 },
  { x: 100, y: 580 },
  { x: 300, y: 580 },
];

const DEMO_PHOTOS: Record<string, string[]> = {
  "vintage-sepia": ["/demo/vintage/1.jpg", "/demo/vintage/2.png", "/demo/vintage/3.png", "/demo/vintage/4.png"],
  "wedding-classic": ["/demo/wedding/1.png", "/demo/wedding/2.png", "/demo/wedding/3.png", "/demo/wedding/4.jpg"],
  "romantic-bw": ["/demo/bw/1.png", "/demo/bw/2.png", "/demo/bw/3.png", "/demo/bw/4.jpeg"],
  "romantic-color": ["/demo/color/1.png", "/demo/color/2.jpg", "/demo/color/3.png", "/demo/color/4.png"],
};

type StepKey = "template" | "capture" | "customize";
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

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLVideoElement,
  dx: number,
  dy: number,
  dWidth: number,
  dHeight: number,
) {
  const width =
    "naturalWidth" in image ? image.naturalWidth : image.videoWidth;
  const height =
    "naturalHeight" in image ? image.naturalHeight : image.videoHeight;
  const sourceRatio = width / height;
  const targetRatio = dWidth / dHeight;

  let sx = 0;
  let sy = 0;
  let sWidth = width;
  let sHeight = height;

  if (sourceRatio > targetRatio) {
    sWidth = height * targetRatio;
    sx = (width - sWidth) / 2;
  } else if (sourceRatio < targetRatio) {
    sHeight = width / targetRatio;
    sy = (height - sHeight) / 2;
  }

  ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

function fillStripBackground(
  ctx: CanvasRenderingContext2D,
  template: PhotoTemplate,
  width: number,
  height: number,
) {
  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, width, height);

  const patternId = template.bgPattern ?? "solid";
  if (patternId === "solid") return;

  const tile = document.createElement("canvas");
  const tileCtx = tile.getContext("2d");
  if (!tileCtx) return;

  if (patternId === "dots") {
    tile.width = 12;
    tile.height = 12;
    tileCtx.fillStyle = "rgba(255,255,255,0.7)";
    tileCtx.beginPath();
    tileCtx.arc(2, 2, 1.4, 0, Math.PI * 2);
    tileCtx.fill();
  } else if (patternId === "checker") {
    tile.width = 16;
    tile.height = 16;
    tileCtx.fillStyle = "rgba(255,255,255,0.4)";
    tileCtx.fillRect(0, 0, 8, 8);
    tileCtx.fillRect(8, 8, 8, 8);
  } else if (patternId === "diagonal-stripe") {
    tile.width = 16;
    tile.height = 16;
    tileCtx.strokeStyle = "rgba(255,255,255,0.34)";
    tileCtx.lineWidth = 8;
    tileCtx.beginPath();
    tileCtx.moveTo(-4, 16);
    tileCtx.lineTo(16, -4);
    tileCtx.stroke();
  } else if (patternId === "grid") {
    tile.width = 18;
    tile.height = 18;
    tileCtx.strokeStyle = "rgba(255,255,255,0.35)";
    tileCtx.lineWidth = 1;
    tileCtx.beginPath();
    tileCtx.moveTo(0.5, 0);
    tileCtx.lineTo(0.5, 18);
    tileCtx.moveTo(0, 0.5);
    tileCtx.lineTo(18, 0.5);
    tileCtx.stroke();
  }

  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) return;
  ctx.save();
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function getCanvasFilter(filter: FilterOption): string {
  if (filter === "sepia") return "sepia(1)";
  if (filter === "grayscale") return "grayscale(1)";
  if (filter === "warm") return "saturate(1.3) brightness(1.05)";
  return "none";
}

async function renderStripBlob(
  template: PhotoTemplate,
  photos: string[],
  stickers: StickerPlacement[] = [],
): Promise<Blob> {
  const STRIP_WIDTH = 400;
  const STRIP_HEIGHT = 1300;
  const SLOT_WIDTH = 340;
  const SLOT_HEIGHT = 240;
  const SLOT_GAP = 12;
  const STRIP_PADDING = 30;

  const [images, stickerImages] = await Promise.all([
    Promise.all(
      photos.map(async (src) => {
        try {
          return await loadImage(src);
        } catch {
          return null;
        }
      }),
    ),
    Promise.all(
      stickers.map(async (sticker) => {
        try {
          const img = await loadImage(sticker.src);
          return { sticker, image: img };
        } catch {
          return null;
        }
      }),
    ),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = STRIP_WIDTH * 2;
  canvas.height = STRIP_HEIGHT * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable.");
  ctx.scale(2, 2);

  fillStripBackground(ctx, template, STRIP_WIDTH, STRIP_HEIGHT);

  for (let i = 0; i < 4; i += 1) {
    const y = STRIP_PADDING + i * (SLOT_HEIGHT + SLOT_GAP);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(STRIP_PADDING, y, SLOT_WIDTH, SLOT_HEIGHT, 8);
    ctx.clip();
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(STRIP_PADDING, y, SLOT_WIDTH, SLOT_HEIGHT);
    const image = images[i];
    if (image) {
      ctx.filter = getCanvasFilter(
        template.filterClass === "sepia"
          ? "sepia"
          : template.filterClass === "grayscale"
            ? "grayscale"
            : template.filterClass === "warm"
              ? "warm"
              : "none",
      );
      drawCoverImage(ctx, image, STRIP_PADDING, y, SLOT_WIDTH, SLOT_HEIGHT);
      ctx.filter = "none";
    }
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = template.fontColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = '700 16px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(template.footerText.toUpperCase(), STRIP_WIDTH / 2, 1215);
  ctx.font = '600 13px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }),
    STRIP_WIDTH / 2,
    1245,
  );
  ctx.restore();

  for (const item of stickerImages) {
    if (!item) continue;
    const { sticker, image } = item;
    ctx.save();
    ctx.translate(sticker.x, sticker.y);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.drawImage(
      image,
      -sticker.size / 2,
      -sticker.size / 2,
      sticker.size,
      sticker.size,
    );
    ctx.restore();
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Failed to export strip.");
  return blob;
}

export function PhotoBoothInlineFlow() {
  const [step, setStep] = useState<StepKey>("template");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id ?? "",
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [bgColor, setBgColor] = useState<string>(templates[0]?.bgColor ?? "#fff");
  const [bgPattern, setBgPattern] = useState<BackgroundPatternOption>(
    (templates[0]?.bgPattern ?? "solid") as BackgroundPatternOption,
  );
  const [filter, setFilter] = useState<FilterOption>("none");
  const [footerText, setFooterText] = useState<string>(
    templates[0]?.footerText ?? "photobooth-online.com",
  );
  const [stickers, setStickers] = useState<StickerPlacement[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [isStripZoomed, setIsStripZoomed] = useState(false);
  const [zoomStripUrl, setZoomStripUrl] = useState<string | null>(null);
  const [isZoomGenerating, setIsZoomGenerating] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const baseTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId],
  );

  const effectiveTemplate = useMemo<PhotoTemplate>(() => {
    if (!baseTemplate) {
      return templates[0];
    }
    return {
      ...baseTemplate,
      bgColor,
      footerText,
      bgPattern,
      filterClass: filter === "none" ? "" : filter,
    };
  }, [baseTemplate, bgColor, bgPattern, footerText, filter]);

  useEffect(() => {
    if (!baseTemplate) return;
    setBgColor(baseTemplate.bgColor);
    setFooterText(baseTemplate.footerText);
    setBgPattern(
      (baseTemplate.bgPattern ?? "solid") as BackgroundPatternOption,
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
  }, [baseTemplate]);

  useEffect(() => {
    if (step !== "capture") return;
    let active = true;

    const setupCamera = async () => {
      try {
        setCameraError(null);
        setIsCameraReady(false);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsCameraReady(true);
      } catch {
        setCameraError("Camera access is required for this step.");
      }
    };

    setupCamera();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setIsCameraReady(false);
    };
  }, [step]);

  const handleCaptureOne = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || photos.length >= 4) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror image to match selfie preview.
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    drawCoverImage(ctx, video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    const data = canvas.toDataURL("image/png");
    setPhotos((prev) => [...prev, data].slice(0, 4));
  };

  const handleDownload = async () => {
    if (photos.length !== 4 || !effectiveTemplate) return;
    setIsExporting(true);
    try {
      const blob = await renderStripBlob(effectiveTemplate, photos, stickers);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photobooth-${effectiveTemplate.id}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenZoomPreview = async () => {
    if (photos.length !== 4 || !effectiveTemplate) {
      setIsStripZoomed(true);
      return;
    }
    try {
      setIsZoomGenerating(true);
      setIsStripZoomed(true);
      const blob = await renderStripBlob(effectiveTemplate, photos, stickers);
      const url = URL.createObjectURL(blob);
      if (zoomStripUrl) {
        URL.revokeObjectURL(zoomStripUrl);
      }
      setZoomStripUrl(url);
    } finally {
      setIsZoomGenerating(false);
    }
  };

  const handleDownloadZoomImage = () => {
    if (!zoomStripUrl || !effectiveTemplate) return;
    const a = document.createElement("a");
    a.href = zoomStripUrl;
    a.download = `photobooth-${effectiveTemplate.id}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePreviewClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedStickerId) return;
    const stickerDef = STICKER_OPTIONS.find((s) => s.id === selectedStickerId);
    if (!stickerDef) return;
    if (!previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const scale = 0.32;
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    setStickers((prev) => [
      ...prev,
      {
        id: `sticker-${Date.now()}-${stickerDef.id}`,
        src: stickerDef.src,
        x: Math.max(0, Math.min(400, x)),
        y: Math.max(0, Math.min(1300, y)),
        size: 32,
        rotation: 0,
      },
    ]);
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
      <div className="min-h-0 flex-1 overflow-auto px-4 pb-5 pt-3 sm:px-5 sm:pt-6">
        {step === "template" && (
          <div className="flex flex-col">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:snap-none sm:overflow-visible sm:pb-0 sm:grid-cols-2 lg:grid-cols-4">
              {templates.map((template) => {
                const active = template.id === selectedTemplateId;
                const demoPhotos = DEMO_PHOTOS[template.id] ?? [];
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={cn(
                      "flex min-w-[220px] max-w-[240px] snap-center flex-col overflow-hidden rounded-2xl border bg-white text-left transition sm:min-w-0 sm:max-w-none",
                      active
                        ? "border-pink-300 ring-2 ring-pink-200"
                        : "border-neutral-200 hover:border-pink-200",
                    )}
                  >
                    {/* 4 张图竖向排列：宽 70px 等比，每张 4:3，strip 背景在上下左右留出 */}
                    <div className="flex w-full shrink-0 justify-center overflow-hidden rounded-t-2xl bg-neutral-100 p-1.5">
                      <div
                        className="flex flex-col gap-0.5 overflow-hidden rounded-lg"
                        style={{
                          width: 82,
                          height: 222,
                          padding: 6,
                          backgroundColor: template.bgColor,
                          ...(template.bgPattern === "dots" && {
                            backgroundImage:
                              "radial-gradient(rgba(255,255,255,0.7) 1.4px, transparent 1.4px)",
                            backgroundSize: "12px 12px",
                          }),
                          ...(template.bgPattern === "checker" && {
                            backgroundImage:
                              "linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4)), linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4))",
                            backgroundSize: "16px 16px",
                            backgroundPosition: "0 0, 8px 8px",
                          }),
                          ...(template.bgPattern === "diagonal-stripe" && {
                            backgroundImage:
                              "repeating-linear-gradient(135deg, rgba(255,255,255,0.34), rgba(255,255,255,0.34) 8px, transparent 8px, transparent 16px)",
                          }),
                          ...(template.bgPattern === "grid" && {
                            backgroundImage:
                              "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
                            backgroundSize: "18px 18px",
                          }),
                        }}
                      >
                        <div
                          className="flex flex-col gap-0.5 overflow-hidden rounded-sm"
                          style={{ width: 70, height: 210 }}
                        >
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="relative h-[52.5px] w-full shrink-0 overflow-hidden rounded-sm"
                            >
                              <Image
                                src={demoPhotos[i] ?? "/demo/vintage/1.jpg"}
                                alt={`${template.name} ${i + 1}`}
                                fill
                                className="object-cover"
                                style={{
                                  filter:
                                    template.filterClass === "sepia"
                                      ? "sepia(1)"
                                      : template.filterClass === "grayscale"
                                        ? "grayscale(1)"
                                        : template.filterClass === "warm"
                                          ? "saturate(1.3) brightness(1.05)"
                                          : undefined,
                                }}
                                sizes="70px"
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 border-t border-neutral-100 px-3 py-2">
                      <p className="text-sm font-semibold text-neutral-900">
                        {template.name}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {template.category}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhotos([]);
                  setStep("capture");
                }}
                className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(244,114,182,0.4)] transition hover:bg-pink-400"
              >
                Continue to Capture
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-neutral-400">Step 1/3</span>
            </div>
          </div>
        )}

        {step === "capture" && (
          <div className="flex h-full flex-col gap-3">
            <button
              type="button"
              onClick={() => setStep("template")}
              className="hidden text-xs font-medium text-pink-600 transition hover:text-pink-700 md:inline-flex"
            >
              ← Template
            </button>
            <div className="flex min-h-0 flex-1 flex-col items-stretch gap-5 md:flex-row md:flex-wrap md:justify-center md:items-stretch">
              {/* 1. Viewfinder: same height as preview, 4:3 scales with it */}
              <div className="flex min-h-[240px] min-w-0 shrink-0 items-center justify-center md:min-h-0 md:h-full">
                <div className="aspect-[4/3] h-full max-w-none overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 shadow-lg">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover object-center"
                    style={{ transform: "scaleX(-1)" }}
                    playsInline
                    muted
                    autoPlay
                  />
                </div>
              </div>

              {/* Mobile-only primary button under viewfinder */}
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={
                    photos.length < 4
                      ? handleCaptureOne
                      : () => {
                          if (photos.length === 4) setStep("customize");
                        }
                  }
                  disabled={
                    photos.length < 4
                      ? !isCameraReady || photos.length >= 4
                      : photos.length !== 4
                  }
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(236,72,153,0.35)] transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:bg-pink-300"
                >
                  <Camera className="h-4 w-4 shrink-0" />
                  {photos.length < 4 ? "Capture" : "Continue"}
                </button>
              </div>

              {/* 2. Preview thumbnails (20px gap from viewfinder) */}
              <aside className="flex shrink-0 flex-col rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 md:w-[280px]">
                <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 md:block">
                  Shot {photos.length} / 4
                </p>
                <div className="mt-3 grid flex-1 grid-cols-2 gap-x-3 gap-y-0.5 min-[400px]:gap-x-4 min-[400px]:gap-y-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50"
                    >
                      {photos[i] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photos[i]}
                          alt={`Captured shot ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                          —
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {cameraError ? (
                  <p className="mt-3 text-xs text-red-600">{cameraError}</p>
                ) : null}
              </aside>

              {/* 3. Buttons (20px gap from preview) - desktop layout */}
              <aside className="hidden shrink-0 flex-col justify-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 md:flex md:w-[200px]">
                <button
                  type="button"
                  onClick={handleCaptureOne}
                  disabled={!isCameraReady || photos.length >= 4}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(236,72,153,0.3)] transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:bg-pink-300"
                >
                  <Camera className="h-4 w-4 shrink-0" />
                  Capture
                </button>
                <button
                  type="button"
                  onClick={() => setPhotos([])}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  Retake All
                </button>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    disabled={photos.length !== 4}
                    onClick={() => setStep("customize")}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(236,72,153,0.3)] transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:bg-pink-300"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>
                  <span className="text-center text-xs text-neutral-400">
                    Step 2/3
                  </span>
                </div>
              </aside>
            </div>
          </div>
        )}

        {step === "customize" && (
          <div className="flex h-full flex-col gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setStep("template")}
              className="hidden text-xs font-medium text-pink-600 transition hover:text-pink-700 md:inline-flex"
            >
              ← Template
            </button>

            {/* Mobile layout – mirror /customize: top card with preview + download, controls below */}
            <div className="flex flex-col gap-3 md:hidden">
              <section className="rounded-2xl border border-neutral-200 bg-white px-3 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative h-[280px] w-[96px] overflow-hidden">
                    <PhotoStripPreview
                      ref={previewRef}
                      template={effectiveTemplate}
                      photos={photos}
                      stickers={stickers}
                      scale={0.23}
                      className="absolute left-1/2 top-0 -translate-x-1/2"
                      onClick={handlePreviewClick}
                    />
                  </div>
                  <div className="flex w-[7.8rem] shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleOpenZoomPreview}
                      className="inline-flex h-9 w-full items-center justify-center rounded-full border border-neutral-200 bg-white px-3 text-[11px] font-medium text-neutral-700 shadow-sm transition hover:border-pink-200 hover:text-pink-700 disabled:opacity-60"
                      disabled={isZoomGenerating}
                    >
                      {isZoomGenerating ? "Preparing..." : "Preview"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={photos.length !== 4 || isExporting}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-pink-500 px-3 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(244,114,182,0.3)] transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:bg-pink-300"
                    >
                      <Download className="h-4 w-4 shrink-0" />
                      {isExporting ? "Exporting..." : "Download"}
                    </button>
                  </div>
                </div>
              </section>

              <aside className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="mt-1">
                  <p className="mb-2 text-xs text-neutral-500">Background Color</p>
                  <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {BG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBgColor(color)}
                        className={cn(
                          "h-6 w-6 shrink-0 rounded-full border border-neutral-200",
                          bgColor === color && "ring-2 ring-pink-300 ring-offset-2",
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Select ${color} background`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="mb-2 text-xs text-neutral-500">Background Pattern</p>
                  <div className="flex flex-wrap gap-2">
                    {BG_PATTERNS.map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => setBgPattern(pat.id)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition",
                          bgPattern === pat.id
                            ? "border-pink-400 bg-pink-500 text-white"
                            : "border-neutral-200 text-neutral-700 hover:border-pink-200",
                        )}
                      >
                        {pat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="mb-2 text-xs text-neutral-500">Filter</p>
                  <div className="flex flex-wrap gap-2">
                    {(["none", "sepia", "grayscale", "warm"] as FilterOption[]).map(
                      (opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFilter(opt)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs transition",
                            filter === opt
                              ? "border-pink-400 bg-pink-500 text-white"
                              : "border-neutral-200 text-neutral-700 hover:border-pink-200",
                          )}
                        >
                          {opt}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="mb-2 text-xs text-neutral-500">Stickers</p>
                  <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
                    {STICKER_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setSelectedStickerId((current) =>
                            current === opt.id ? null : opt.id,
                          )
                        }
                        className={cn(
                          "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition hover:border-pink-200 hover:bg-pink-50",
                          selectedStickerId === opt.id
                            ? "border-pink-400 ring-2 ring-pink-200"
                            : "border-neutral-200",
                        )}
                        aria-label={`Add ${opt.label} sticker`}
                      >
                        <Image
                          src={opt.src}
                          alt=""
                          width={18}
                          height={18}
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                  {stickers.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStickers([])}
                      className="mt-2 text-xs text-neutral-500 underline hover:text-pink-600"
                    >
                      Clear all stickers
                    </button>
                  ) : null}
                </div>
                <div className="mt-3">
                  <p className="mb-2 text-xs text-neutral-500">Footer Text</p>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full rounded-full border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </aside>
            </div>

            {/* Desktop layout */}
            <div className="hidden min-h-0 flex-1 gap-4 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)]">
            <section className="p-0">
              <div className="mx-auto flex w-full max-w-[260px] justify-center md:justify-start">
                <div className="relative h-[338px] w-[104px] sm:h-[420px] sm:w-[130px]">
                  <PhotoStripPreview
                    ref={previewRef}
                    template={effectiveTemplate}
                    photos={photos}
                    stickers={stickers}
                    scale={0.32}
                    className="absolute left-1/2 top-0 -translate-x-1/2 md:left-[-200px] md:translate-x-0"
                    onClick={handlePreviewClick}
                  />
                </div>
              </div>
            </section>
            <aside className="rounded-2xl border border-neutral-200 bg-white p-4 md:relative md:-left-[200px] md:p-5">
              <div className="mt-1">
                <p className="mb-2 text-xs text-neutral-500">Background Color</p>
                <div className="flex flex-wrap gap-2">
                  {BG_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBgColor(color)}
                      className={cn(
                        "h-7 w-7 rounded-full border border-neutral-200",
                        bgColor === color && "ring-2 ring-pink-300 ring-offset-2",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color} background`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <p className="mb-2 text-xs text-neutral-500">Background Pattern</p>
                <div className="flex flex-wrap gap-2">
                  {BG_PATTERNS.map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => setBgPattern(pat.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition",
                        bgPattern === pat.id
                          ? "border-pink-400 bg-pink-500 text-white"
                          : "border-neutral-200 text-neutral-700 hover:border-pink-200",
                      )}
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <p className="mb-2 text-xs text-neutral-500">Filter</p>
                <div className="flex flex-wrap gap-2">
                  {(["none", "sepia", "grayscale", "warm"] as FilterOption[]).map(
                    (opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFilter(opt)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition",
                          filter === opt
                            ? "border-pink-400 bg-pink-500 text-white"
                            : "border-neutral-200 text-neutral-700 hover:border-pink-200",
                        )}
                      >
                        {opt}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="mt-3">
                <p className="mb-2 text-xs text-neutral-500">Stickers</p>
                <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
                  {STICKER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setSelectedStickerId((current) =>
                          current === opt.id ? null : opt.id,
                        )
                      }
                      className={cn(
                        "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition hover:border-pink-200 hover:bg-pink-50",
                        selectedStickerId === opt.id
                          ? "border-pink-400 ring-2 ring-pink-200"
                          : "border-neutral-200",
                      )}
                      aria-label={`Add ${opt.label} sticker`}
                    >
                      <Image
                        src={opt.src}
                        alt=""
                        width={18}
                        height={18}
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
                {stickers.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStickers([])}
                    className="mt-2 text-xs text-neutral-500 underline hover:text-pink-600"
                  >
                    Clear all stickers
                  </button>
                ) : null}
              </div>
              <div className="mt-3">
                <p className="mb-2 text-xs text-neutral-500">Footer Text</p>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full rounded-full border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={photos.length !== 4 || isExporting}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-pink-500 px-6 py-4 text-base font-semibold text-white shadow-[0_4px_14px_rgba(236,72,153,0.4)] transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:bg-pink-300"
                >
                  <Download className="h-5 w-5 shrink-0" />
                  {isExporting ? "Exporting..." : "Download Photo Strip"}
                </button>
              </div>
            </aside>
            </div>
          </div>
        )}
      </div>

      {/* Mobile strip zoom overlay */}
      {isStripZoomed ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 md:hidden"
          onClick={() => {
            setIsStripZoomed(false);
            if (zoomStripUrl) {
              URL.revokeObjectURL(zoomStripUrl);
              setZoomStripUrl(null);
            }
          }}
        >
          <div
            className="relative max-h-[80vh]"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsStripZoomed(false);
                if (zoomStripUrl) {
                  URL.revokeObjectURL(zoomStripUrl);
                  setZoomStripUrl(null);
                }
              }}
              className="absolute right-0 top-[-40px] rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-700 shadow"
            >
              Close
            </button>
            {zoomStripUrl ? (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={zoomStripUrl}
                  alt="Enlarged photo strip preview"
                  className="mx-auto h-auto max-h-[72vh] w-auto max-w-full rounded-3xl shadow-2xl"
                />
                <button
                  type="button"
                  onClick={handleDownloadZoomImage}
                  className="inline-flex items-center justify-center rounded-full bg-pink-500 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(244,114,182,0.4)] hover:bg-pink-400"
                >
                  Download image
                </button>
              </div>
            ) : (
              <div className="flex h-[60vh] w-[180px] items-center justify-center rounded-3xl bg-neutral-900/20 text-xs font-medium text-white">
                Generating preview…
              </div>
            )}
          </div>
        </div>
      ) : null}

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </section>
  );
}

