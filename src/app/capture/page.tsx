"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, RotateCcw, ShieldAlert } from "lucide-react";
import { templates } from "@/lib/templates";
import type { PhotoTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "capturedPhotos";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function safeParsePhotos(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string") as string[];
  } catch {
    return [];
  }
}

function CaptureContent() {
  const router = useRouter();
  const params = useSearchParams();
  const templateId = params.get("templateId") ?? "";

  const template: PhotoTemplate | undefined = useMemo(
    () => templates.find((t) => t.id === templateId) ?? templates[0],
    [templateId],
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);

  useEffect(() => {
    setPhotos(safeParsePhotos(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        setError(null);
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (!active) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch (e) {
        console.error(e);
        setError(
          "Camera access was denied or unavailable. Please allow permissions and reload.",
        );
      }
    };

    start();

    return () => {
      active = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const shotIndex = Math.min(photos.length + (isShooting ? 1 : 0), 4);

  const captureBase64 = async (): Promise<string | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    const targetRatio = 4 / 3;
    const sourceRatio = w / h;

    let sx = 0;
    let sy = 0;
    let sw = w;
    let sh = h;

    if (sourceRatio > targetRatio) {
      sw = Math.round(h * targetRatio);
      sx = Math.round((w - sw) / 2);
    } else if (sourceRatio < targetRatio) {
      sh = Math.round(w / targetRatio);
      sy = Math.round((h - sh) / 2);
    }

    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // mirror capture to match preview
    ctx.save();
    ctx.translate(sw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
    ctx.restore();

    return canvas.toDataURL("image/png");
  };

  const runShootSequence = async () => {
    if (isShooting) return;
    if (!stream || error) return;

    setIsShooting(true);
    setPhotos([]);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

    const captured: string[] = [];

    for (let i = 0; i < 4; i++) {
      for (let t = 3; t >= 1; t--) {
        setCountdown(t);
        await sleep(1000);
      }
      setCountdown(null);

      setFlash(true);
      setTimeout(() => setFlash(false), 120);

      const dataUrl = await captureBase64();
      if (dataUrl) {
        captured.push(dataUrl);
        setPhotos([...captured]);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
      }

      if (i < 3) {
        await sleep(1500);
      }
    }

    setIsShooting(false);
  };

  const handleContinue = () => {
    if (!template) return;
    router.push(`/customize?templateId=${template.id}`);
  };

  const handleRetake = () => {
    setCountdown(null);
    setIsShooting(false);
    setPhotos([]);
    setActiveThumbIndex(0);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  };

  useEffect(() => {
    if (photos.length === 0) {
      setActiveThumbIndex(0);
      return;
    }
    setActiveThumbIndex((prev) => Math.min(prev, photos.length - 1));
  }, [photos.length]);

  return (
    <div className="h-[calc(100dvh-46px)] overflow-hidden bg-neutral-50 px-3 py-3 md:min-h-[calc(100vh-4rem)] md:h-auto md:overflow-visible md:px-8 md:py-6">
      <div className="mx-auto hidden w-full max-w-6xl gap-4 md:grid md:grid-cols-[minmax(0,1fr)_24rem] lg:grid-cols-[minmax(0,1fr)_26rem]">
        <section className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white/80 shadow-[0_18px_70px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between border-b border-neutral-200/70 px-4 py-3">
            <div className="text-sm font-semibold tracking-tight text-pink-600">
              Capture
            </div>
            <div className="text-xs text-neutral-500">
              Template:{" "}
              <span className="font-medium text-neutral-700">
                {template?.name ?? "Unknown"}
              </span>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full bg-neutral-900">
            <video
              ref={videoRef}
              className="h-full w-full object-contain"
              style={{ transform: "scaleX(-1)" }}
              playsInline
              muted
              autoPlay
            />

            {flash && (
              <div className="pointer-events-none absolute inset-0 bg-white/80" />
            )}

            {countdown !== null && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/80 text-5xl font-semibold text-pink-600 shadow-[0_20px_70px_rgba(244,114,182,0.35)] backdrop-blur-sm">
                  {countdown}
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/85 p-6">
                <div className="max-w-md rounded-2xl border border-pink-200 bg-pink-50 p-4 text-center shadow-sm">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-700">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold text-pink-800">
                    Camera permission required
                  </div>
                  <p className="mt-2 text-sm text-pink-700/90">{error}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-pink-500 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-white transition hover:bg-pink-400"
                  >
                    Reload
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="flex flex-col overflow-hidden rounded-[2rem] border border-neutral-200 bg-white/80 shadow-[0_18px_70px_rgba(15,23,42,0.12)]">
          <div className="border-b border-neutral-200/70 px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
              Shot {Math.max(1, shotIndex)} / 4
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3.5 p-5">
            {Array.from({ length: 4 }).map((_, idx) => {
              const src = photos[idx];
              return (
                <div
                  key={idx}
                  className="mx-auto aspect-[4/3] h-24 overflow-hidden rounded-2xl bg-neutral-100 md:h-28"
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={`Captured ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                      Empty
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-neutral-200/70 p-4">
            {photos.length === 4 && !isShooting ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex w-full items-center justify-center rounded-full bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_50px_rgba(244,114,182,0.35)] transition hover:bg-pink-400"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex w-full items-center justify-center rounded-full border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={runShootSequence}
                disabled={Boolean(error) || !stream || isShooting}
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-white transition",
                  "shadow-[0_16px_50px_rgba(244,114,182,0.35)]",
                  Boolean(error) || !stream || isShooting
                    ? "bg-pink-300"
                    : "bg-pink-500 hover:bg-pink-400",
                )}
              >
                <Camera className="mr-2 h-4 w-4" />
                {isShooting ? "Shooting…" : "Start 4-shot capture"}
              </button>
            )}
          </div>
        </aside>
      </div>

      <div className="mx-auto flex h-full w-full max-w-6xl flex-col pb-[calc(21.5rem+env(safe-area-inset-bottom))] md:hidden">
        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-neutral-200 bg-white/80 shadow-[0_18px_70px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between border-b border-neutral-200/70 px-4 py-3">
            <div className="text-sm font-semibold tracking-tight text-pink-600">
              Capture
            </div>
            <div className="text-xs text-neutral-500">
              Template:{" "}
              <span className="font-medium text-neutral-700">
                {template?.name ?? "Unknown"}
              </span>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full bg-neutral-900">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
              playsInline
              muted
              autoPlay
            />

            {flash && (
              <div className="pointer-events-none absolute inset-0 bg-white/80" />
            )}

            {countdown !== null && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/80 text-5xl font-semibold text-pink-600 shadow-[0_20px_70px_rgba(244,114,182,0.35)] backdrop-blur-sm">
                  {countdown}
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/85 p-4">
                <div className="max-w-md rounded-2xl border border-pink-200 bg-pink-50 p-4 text-center shadow-sm">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-700">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold text-pink-800">
                    Camera permission required
                  </div>
                  <p className="mt-2 text-sm text-pink-700/90">{error}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-pink-500 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-white transition hover:bg-pink-400"
                  >
                    Reload
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="mx-auto w-full max-w-6xl px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          <aside className="rounded-[1.6rem] border border-neutral-200 bg-white/95 p-2.5 shadow-[0_18px_70px_rgba(15,23,42,0.15)] backdrop-blur-sm">
            <div className="border-b border-neutral-200/70 pb-2">
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
                Shot {Math.max(1, shotIndex)} / 4
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 py-2">
              {Array.from({ length: 4 }).map((_, idx) => {
                const src = photos[idx];
                const isActive = idx === activeThumbIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveThumbIndex(idx)}
                    className={cn(
                      "aspect-[16/10] overflow-hidden rounded-lg border bg-neutral-100 text-left transition",
                      isActive ? "border-pink-300 ring-2 ring-pink-200/70" : "border-neutral-200",
                    )}
                    aria-label={`Thumbnail ${idx + 1}`}
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={`Captured ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                        Empty
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {photos.length === 4 && !isShooting ? (
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="col-span-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-pink-500 px-4 text-sm font-semibold text-white shadow-[0_16px_50px_rgba(244,114,182,0.35)] transition hover:bg-pink-400"
                >
                  Continue
                </button>

                <button
                  type="button"
                  onClick={handleRetake}
                  className="col-span-1 inline-flex h-11 w-full items-center justify-center rounded-full border border-pink-200 bg-white px-3 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={runShootSequence}
                disabled={Boolean(error) || !stream || isShooting}
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-semibold text-white transition",
                  "shadow-[0_16px_50px_rgba(244,114,182,0.35)]",
                  Boolean(error) || !stream || isShooting
                    ? "bg-pink-300"
                    : "bg-pink-500 hover:bg-pink-400",
                )}
              >
                <Camera className="mr-2 h-4 w-4" />
                {isShooting ? "Shooting…" : "Start 4-shot capture"}
              </button>
            )}
          </aside>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

export default function CapturePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-pink-500">Loading...</div>}>
      <CaptureContent />
    </Suspense>
  );
}

