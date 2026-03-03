"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CameraIcon } from "lucide-react";
import { toast } from "sonner";

import { TopBar } from "@/components/TopBar";
import { SidePanel } from "@/components/SidePanel";
import {
  type CameraStatus,
  type CapturedFrame,
  useBoothStore,
} from "@/store/booth-store";
import { Button } from "@/components/ui/button";

const DEFAULT_CAPTURE_COUNT = 3 as const;
const DEFAULT_COUNTDOWN_SECONDS = 3 as const;

export default function CanvasPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cameraStatus = useBoothStore((s) => s.cameraStatus);
  const setCameraStatus = useBoothStore((s) => s.setCameraStatus);
  const mirror = useBoothStore((s) => s.mirror);
  const setMirror = useBoothStore((s) => s.setMirror);
  const addFrame = useBoothStore((s) => s.addFrame);
  const clearFrames = useBoothStore((s) => s.clearFrames);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount] = useState<number>(DEFAULT_CAPTURE_COUNT);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const startCamera = async () => {
      try {
        setCameraStatus("requesting");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraStatus("ready");
      } catch (error) {
        console.error("Error accessing camera", error);
        setCameraStatus("error");
        toast.error("Unable to access camera. Please check permissions.");
      }
    };

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [setCameraStatus]);

  const handleToggleMirror = () => {
    setMirror(!mirror);
  };

  const handleToggleFullscreen = () => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (!document.fullscreenElement) {
      root.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const captureFrame = async (): Promise<CapturedFrame | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    if (mirror) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, width, height);
    }

    return new Promise<CapturedFrame | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (typeof result === "string") {
              resolve({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                createdAt: Date.now(),
                dataUrl: result,
              });
            } else {
              resolve(null);
            }
          };
          reader.readAsDataURL(blob);
        },
        "image/png",
        0.92,
      );
    });
  };

  const runCountdownAndCapture = async () => {
    if (isCapturing) return;
    if (cameraStatus !== "ready") {
      toast.error("Camera is not ready yet.");
      return;
    }
    setIsCapturing(true);
    clearFrames();

    for (let i = 0; i < captureCount; i++) {
      setCountdown(DEFAULT_COUNTDOWN_SECONDS);
      for (let sec = DEFAULT_COUNTDOWN_SECONDS; sec > 0; sec--) {
        setCountdown(sec);
        await new Promise((res) => setTimeout(res, 1000));
      }
      setCountdown(null);
      const frame = await captureFrame();
      if (frame) {
        addFrame(frame);
      }
      await new Promise((res) => setTimeout(res, 400));
    }

    setIsCapturing(false);
    router.push("/customize");
  };

  const statusLabel = (status: CameraStatus) => {
    switch (status) {
      case "idle":
        return "Waiting to request camera…";
      case "requesting":
        return "Requesting camera permission…";
      case "ready":
        return "Camera ready · live preview";
      case "error":
        return "Camera error · check permissions";
      default:
        return "Unknown status";
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col px-4 py-4 md:px-8 md:py-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <TopBar
          onBackHref="/"
          mirrored={mirror}
          onToggleMirror={handleToggleMirror}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />
        <div className="hidden text-[11px] text-slate-400 md:inline-flex">
          {statusLabel(cameraStatus)}
        </div>
      </div>

      <div className="grid flex-1 gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <div className="relative flex flex-col gap-3 rounded-3xl border border-slate-800/80 bg-slate-950/90 p-3 shadow-[0_28px_90px_rgba(0,0,0,0.85)]">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">
              Capture canvas
            </span>
            <span>{statusLabel(cameraStatus)}</span>
          </div>

          <div className="relative flex flex-1 items-center justify-center rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900 to-black overflow-hidden">
            <video
              ref={videoRef}
              className={`max-h-full w-full object-contain ${mirror ? "scale-x-[-1]" : ""}`}
              playsInline
              muted
              autoPlay
            />
            {countdown !== null && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/70 bg-black/80 text-4xl font-semibold text-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.7)]">
                  {countdown}
                </div>
              </div>
            )}
            {cameraStatus === "error" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="flex items-center gap-2 rounded-full border border-red-500/60 bg-red-500/15 px-4 py-2 text-xs text-red-100">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    Camera access failed. Check browser permissions and reload.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>
              Countdown and multi-shot sequence are placeholders but wired to
              the capture pipeline.
            </span>
            <Button
              size="sm"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-300"
              onClick={runCountdownAndCapture}
              disabled={cameraStatus !== "ready" || isCapturing}
            >
              <CameraIcon className="h-3 w-3" />
              {isCapturing ? "Capturing…" : `Capture ${captureCount} photos`}
            </Button>
          </div>
        </div>

        <SidePanel
          value="filters"
          onChange={() => {
            // no-op for now; dedicated tabs will be hooked on customize page
          }}
        >
          <div className="space-y-3 text-[11px] text-slate-300">
            <p className="font-medium text-slate-100">Capture checklist</p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Grant camera access in your browser.</li>
              <li>Confirm the preview is live and responsive.</li>
              <li>Use the mirror toggle if you prefer mirrored framing.</li>
              <li>Press the capture button to run the countdown sequence.</li>
            </ul>
            <p className="pt-1 text-slate-400">
              In the full implementation, this panel becomes the main editing
              toolset shared with the customize page.
            </p>
          </div>
        </SidePanel>
      </div>

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

