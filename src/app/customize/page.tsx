"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ChevronDown, Share2, Instagram, Facebook, Twitter, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PhotoStripPreview,
  type StickerPlacement,
} from "@/components/PhotoStripPreview";
import { templates, type PhotoTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";
import {
  trackBgColor,
  trackBgPattern,
  trackFilter,
  trackSticker,
  trackFooterText,
  trackDownload,
  trackCustomizeRetake,
  trackStartOver,
  trackLongPressSave,
  trackShare,
} from "@/lib/analytics";
import { uploadPhotoStrip } from "@/lib/shareUtils";

const STORAGE_KEY = "capturedPhotos";
const STRIP_WIDTH = 400;
const STRIP_HEIGHT = 1300;
const PREVIEW_SCALE = 0.6;
const MOBILE_PREVIEW_SCALE = 0.26;
const DEFAULT_STICKER_SIZE = 74;
const EXPORT_SCALE = 2;
const STRIP_PADDING = 30;
const PHOTO_SLOT_WIDTH = 340;
const PHOTO_SLOT_HEIGHT = 240;
const PHOTO_SLOT_RADIUS = 8;
const PHOTO_STACK_GAP = 12;
const STRIP_RADIUS = 24;

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

async function waitForFontsReady(): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font loading edge cases and continue with image readiness.
    }
  }
}

function getCanvasFilter(filter: FilterOption): string {
  if (filter === "sepia") return "sepia(1)";
  if (filter === "grayscale") return "grayscale(1)";
  if (filter === "warm") return "saturate(1.3) brightness(1.05)";
  return "none";
}

function createRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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

async function loadCanvasImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.decoding = "async";
    if (!src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = async () => {
      if (typeof img.decode === "function") {
        try {
          await img.decode();
        } catch {
          // Some browsers reject decode() for already-decoded images.
        }
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dx: number,
  dy: number,
  dWidth: number,
  dHeight: number,
) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
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

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  letterSpacing: number,
) {
  const chars = text.split("");
  const totalWidth =
    chars.reduce((sum, char) => sum + ctx.measureText(char).width, 0) +
    letterSpacing * Math.max(0, chars.length - 1);
  let cursorX = centerX - totalWidth / 2;

  for (const char of chars) {
    ctx.fillText(char, cursorX, startY);
    cursorX += ctx.measureText(char).width + letterSpacing;
  }
}

async function renderPhotoStripBlob({
  template,
  photos,
  stickers,
  filter,
  footerText,
}: {
  template: PhotoTemplate;
  photos: string[];
  stickers: StickerPlacement[];
  filter: FilterOption;
  footerText: string;
}): Promise<Blob> {
  await waitForFontsReady();

  const [photoImages, stickerImages] = await Promise.all([
    Promise.all(
      photos.map(async (src) => {
        try {
          return await loadCanvasImage(src);
        } catch {
          return null;
        }
      }),
    ),
    Promise.all(
      stickers.map(async (sticker) => {
        try {
          const image = await loadCanvasImage(sticker.src);
          return { sticker, image };
        } catch {
          return null;
        }
      }),
    ),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = STRIP_WIDTH * EXPORT_SCALE;
  canvas.height = STRIP_HEIGHT * EXPORT_SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to initialize export canvas.");
  }

  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
  createRoundedRectPath(ctx, 0, 0, STRIP_WIDTH, STRIP_HEIGHT, STRIP_RADIUS);
  ctx.clip();
  fillStripBackground(ctx, template, STRIP_WIDTH, STRIP_HEIGHT);

  const slotX = STRIP_PADDING;
  const slotStartY = STRIP_PADDING;
  for (let index = 0; index < template.photoCount; index += 1) {
    const y = slotStartY + index * (PHOTO_SLOT_HEIGHT + PHOTO_STACK_GAP);
    createRoundedRectPath(
      ctx,
      slotX,
      y,
      PHOTO_SLOT_WIDTH,
      PHOTO_SLOT_HEIGHT,
      PHOTO_SLOT_RADIUS,
    );
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(slotX, y, PHOTO_SLOT_WIDTH, PHOTO_SLOT_HEIGHT);

    const image = photoImages[index];
    if (image) {
      ctx.filter = getCanvasFilter(filter);
      drawCoverImage(ctx, image, slotX, y, PHOTO_SLOT_WIDTH, PHOTO_SLOT_HEIGHT);
      ctx.filter = "none";
    } else {
      ctx.fillStyle = "#a3a3a3";
      ctx.font = '500 14px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Slot ${index + 1}`, slotX + PHOTO_SLOT_WIDTH / 2, y + PHOTO_SLOT_HEIGHT / 2);
    }
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = template.fontColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1;
  ctx.font = '700 16px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  drawCenteredText(ctx, footerText.toUpperCase(), STRIP_WIDTH / 2, 1215, 3.2);
  ctx.font = '600 13px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  drawCenteredText(
    ctx,
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }),
    STRIP_WIDTH / 2,
    1245,
    1.1,
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
  if (!blob) {
    throw new Error("Failed to create export blob.");
  }
  return blob;
}

function openMobileResultPage(
  targetWindow: Window | null,
  imageUrl: string,
  fileName: string,
) {
  const resultWindow = targetWindow ?? window.open("", "_blank");
  if (!resultWindow) {
    window.open(imageUrl, "_blank");
    return;
  }

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${fileName}</title>
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        min-height: 100%;
        background: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body {
        padding: 72px 16px 24px;
      }
      .toast {
        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        padding: 10px 16px;
        border-radius: 999px;
        background: rgba(236, 72, 153, 0.92);
        color: #fff;
        box-shadow: 0 8px 24px rgba(236, 72, 153, 0.22);
        font-size: 14px;
        line-height: 1.2;
        white-space: nowrap;
        z-index: 10;
        max-width: calc(100vw - 24px);
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .wrap {
        display: flex;
        justify-content: center;
        width: 100%;
      }
      .strip {
        display: block;
        width: min(92vw, 420px);
        max-width: 100%;
        height: auto;
        border-radius: 24px;
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.16);
        -webkit-user-drag: none;
      }
    </style>
  </head>
  <body>
    <div class="toast">Long press the photo strip to save to your device.</div>
    <main class="wrap">
      <img id="strip-img" class="strip" src="${imageUrl}" alt="Photo Strip" draggable="false" />
    </main>
    <script>
      (function() {
        var img = document.getElementById('strip-img');
        var timer = null;
        function clearTimer() {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        }
        img.addEventListener('touchstart', function() {
          clearTimer();
          timer = setTimeout(function() {
            timer = null;
            if (window.opener) {
              window.opener.postMessage({ type: 'PHOTOBOTH_LONG_PRESS_SAVE' }, '*');
            }
          }, 600);
        }, { passive: true });
        img.addEventListener('touchend', clearTimer, { passive: true });
        img.addEventListener('touchmove', clearTimer, { passive: true });
      })();
    </script>
  </body>
</html>`;

  resultWindow.document.open();
  resultWindow.document.write(html);
  resultWindow.document.close();
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
  const shareRef = useRef<HTMLDivElement | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isTwitterSharing, setIsTwitterSharing] = useState(false);

  useEffect(() => {
    if (!isShareOpen) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!shareRef.current || !target) return;
      if (!shareRef.current.contains(target)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isShareOpen]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "PHOTOBOTH_LONG_PRESS_SAVE") {
        trackLongPressSave();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

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
    trackDownload();
    const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(
      navigator.userAgent,
    );
    const mobileResultWindow = isMobile ? window.open("", "_blank") : null;
    setIsExporting(true);
    const loadingToastId = toast.loading("Preparing your photo strip...", {
      icon: <span className="inline-block animate-pulse">⏳</span>,
    });
    try {
      const blob = await renderPhotoStripBlob({
        template: effectiveTemplate,
        photos,
        stickers,
        filter,
        footerText,
      });
      if (!blob) {
        throw new Error("Failed to generate image blob.");
      }

      const fileName = `photobooth-${effectiveTemplate.id}-${Date.now()}.png`;
      const objectUrl = URL.createObjectURL(blob);

      if (isMobile) {
        toast.dismiss(loadingToastId);
        openMobileResultPage(mobileResultWindow, objectUrl, fileName);
        return;
      }

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      toast.dismiss(loadingToastId);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toast.dismiss(loadingToastId);
      if (mobileResultWindow && !mobileResultWindow.closed) {
        mobileResultWindow.close();
      }
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
    trackCustomizeRetake();
    router.push(`/capture?templateId=${baseTemplate.id}`);
  };

  const handleStartOver = () => {
    trackStartOver();
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

  const handleShareClick = async () => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(ua);

    if (
      isMobile &&
      typeof navigator !== "undefined" &&
      "share" in navigator
    ) {
      try {
        await (
          navigator as Navigator & {
            share?: (data: ShareData) => Promise<void>;
          }
        ).share?.({
          title: "My Photo Strip",
          text: "Just made this free photo strip!",
          url: window.location.href,
        });
        trackShare("navigator_share");
        return;
      } catch {
        // user cancelled or share not completed; fall through to popover
      }
    }

    setIsShareOpen(true);
  };

  const handleShareFacebook = () => {
    trackShare("facebook");
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href,
    )}`;
    window.open(url, "_blank");
    setIsShareOpen(false);
  };

  const handleShareTwitter = () => {
    // 第一步：同步立即开窗，必须在任何 await 之前
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) {
      toast.error("Please allow popups for this site");
      return;
    }
    trackShare("twitter");
    setIsShareOpen(false);
    setIsTwitterSharing(true);
    // 第二步：异步上传图片并导航到 Twitter
    (async () => {
      try {
        const blob = await renderPhotoStripBlob({
          template: effectiveTemplate,
          photos,
          stickers,
          filter,
          footerText,
        });
        if (!blob) throw new Error("Failed to generate image.");
        const imageUrl = await uploadPhotoStrip(blob);
        const shareUrl = `${window.location.origin}/share?img=${encodeURIComponent(imageUrl)}`;
        const tweetText = `Just made this photo strip for free at photobooth-online.com! 📸 ${imageUrl}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
        win.location.href = twitterUrl;
      } catch (err) {
        console.error("Twitter share failed", err);
        win.close();
        toast.error("Failed to share. Please try again.");
      } finally {
        setIsTwitterSharing(false);
      }
    })();
  };

  const handleShareInstagram = () => {
    trackShare("instagram");
    toast.info("Please download the photo strip before posting to Instagram", {
      className:
        "bg-pink-500 text-white border border-pink-400 shadow-[0_10px_30px_rgba(244,114,182,0.45)]",
      style: {
        backgroundColor: "#ec4899",
        color: "#ffffff",
        borderColor: "#fb7185",
      },
    });
    setIsShareOpen(false);
  };

  const handleSharePinterest = () => {
    // window.open 必须在用户点击后同步直接调用，否则浏览器会拦截弹窗（about:blank#blocked）
    const shareWin = window.open("", "_blank", "noopener,noreferrer");
    if (!shareWin) {
      toast.error("Please allow popups for this site to share to Pinterest.");
      setIsShareOpen(false);
      return;
    }
    trackShare("pinterest");
    setIsShareOpen(false);
    const loadingId = toast.loading("Preparing image for Pinterest...");
    (async () => {
      try {
        const blob = await renderPhotoStripBlob({
          template: effectiveTemplate,
          photos,
          stickers,
          filter,
          footerText,
        });
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            resolve(typeof result === "string" ? result : "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const pinterestUrl =
          "https://pinterest.com/pin/create/button/?url=" +
          encodeURIComponent(window.location.href) +
          "&media=" +
          encodeURIComponent(dataUrl) +
          "&description=" +
          encodeURIComponent("My photo strip from Photobooth Online");
        shareWin.location.href = pinterestUrl;
      } catch (err) {
        console.error("Failed to prepare image for Pinterest", err);
        toast.dismiss(loadingId);
        toast.error("Failed to prepare image for Pinterest. Please try again.");
        shareWin.close();
        return;
      }
      toast.dismiss(loadingId);
    })();
  };

  const handleCopyLink = async () => {
    try {
      setIsCopying(true);
      const blob = await renderPhotoStripBlob({
        template: effectiveTemplate,
        photos,
        stickers,
        filter,
        footerText,
      });
      if (!blob) {
        throw new Error("Failed to generate image blob.");
      }
      const imageUrl = await uploadPhotoStrip(blob);
      const shareUrl = `${window.location.origin}/share?img=${encodeURIComponent(imageUrl)}`;
      await navigator.clipboard.writeText(shareUrl);
      trackShare("copy_link");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Share link copied!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate share link. Please try again.");
    } finally {
      setIsCopying(false);
    }
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
                    onClick={handleShareClick}
                    className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-pink-300 bg-white px-3 text-xs font-semibold text-pink-600 transition hover:bg-pink-50"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share to Friends</span>
                  </button>
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
                              onClick={() => {
                                trackBgColor();
                                setBgColor(color);
                              }}
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
                              onClick={() => {
                                trackBgPattern();
                                setBgPattern(pattern.id);
                              }}
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
                            onClick={() => {
                              trackFilter();
                              setFilter(opt.id);
                            }}
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
                              onClick={() => {
                                trackSticker();
                                setSelectedStickerSrc(isActive ? null : sticker.src);
                              }}
                              className={cn(
                                "rounded-md border bg-white p-1.5 transition",
                                isActive
                                  ? "border-pink-400 ring-2 ring-pink-300/60"
                                  : "border-neutral-200 hover:border-pink-200",
                              )}
                              aria-label={`Select ${sticker.label} sticker`}
                            >
                              <Image
                                src={sticker.src}
                                alt={`${sticker.label} sticker photobooth online`}
                                width={24}
                                height={24}
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
                        onBlur={trackFooterText}
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
                      onClick={() => {
                        trackBgColor();
                        setBgColor(color);
                      }}
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
                      onClick={() => {
                        trackBgPattern();
                        setBgPattern(pattern.id);
                      }}
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
                      onClick={() => {
                        trackFilter();
                        setFilter(opt.id);
                      }}
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
                        onClick={() => {
                          trackSticker();
                          setSelectedStickerSrc(isActive ? null : sticker.src);
                        }}
                        className={cn(
                          "rounded-md border bg-white p-1 transition",
                          isActive
                            ? "border-pink-400 ring-2 ring-pink-300/60"
                            : "border-neutral-200 hover:border-pink-200",
                        )}
                        aria-label={`Select ${sticker.label} sticker`}
                      >
                        <Image
                          src={sticker.src}
                          alt={`${sticker.label} sticker photobooth online`}
                          width={24}
                          height={24}
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
                  onBlur={trackFooterText}
                  className="w-full rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 outline-none ring-0 focus:border-pink-300 focus:ring-2 focus:ring-pink-200"
                />
              </div>

              {/* Download / Share buttons */}
              <div className="pt-4">
                <div className="flex gap-2">
                  <Button
                    className="h-11 w-2/3 rounded-full bg-pink-500 px-4 text-sm font-semibold text-white shadow-[0_16px_50px_rgba(244,114,182,0.35)] hover:bg-pink-400"
                    onClick={handleDownload}
                    disabled={isExporting || photos.length === 0}
                  >
                    {isExporting ? "Generating..." : "Download Photo Strip"}
                  </Button>
                  <div ref={shareRef} className="relative w-1/3">
                    <button
                      type="button"
                      onClick={handleShareClick}
                      onMouseEnter={() => setIsShareOpen(true)}
                      className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-pink-300 bg-white px-3 text-xs font-semibold text-pink-600 shadow-sm transition hover:bg-pink-50"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share to Friends</span>
                    </button>
                    {isShareOpen && (
                      <div className="absolute bottom-full right-0 z-30 mb-2 w-80 rounded-2xl border border-neutral-200 bg-white p-3 text-xs text-neutral-800 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
                        <p className="mb-2 text-[11px] font-semibold text-neutral-800">
                          Share your photo strip!
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={handleShareInstagram}
                            className="flex flex-col items-center gap-1 text-[11px] text-neutral-700"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4405F] text-white">
                              <Instagram className="h-4 w-4" />
                            </span>
                            <span>Instagram</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleShareFacebook}
                            className="flex flex-col items-center gap-1 text-[11px] text-neutral-700"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white">
                              <Facebook className="h-4 w-4" />
                            </span>
                            <span>Facebook</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleShareTwitter}
                            disabled={isTwitterSharing || photos.length === 0}
                            className="flex flex-col items-center gap-1 text-[11px] text-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1DA1F2] text-white">
                              {isTwitterSharing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Twitter className="h-4 w-4" />
                              )}
                            </span>
                            <span>{isTwitterSharing ? "Sharing..." : "Twitter/X"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSharePinterest}
                            className="flex flex-col items-center gap-1 text-[11px] text-neutral-700"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E60023] text-white text-base font-semibold leading-none">
                              Ⓟ
                            </span>
                            <span>Pinterest</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            disabled={isCopying || photos.length === 0}
                            className="flex flex-col items-center gap-1 text-[11px] text-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white">
                              <Link2 className="h-4 w-4" />
                            </span>
                            <span>
                              {isCopying
                                ? "Generating..."
                                : copied
                                  ? "Copied! ✓"
                                  : "Copy Link"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
