"use client";

import { useRouter } from "next/navigation";
import { Maximize2, Minimize2, ArrowLeft, Settings, FlipHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TopBarProps = {
  showBack?: boolean;
  onBackHref?: string;
  onBackClick?: () => void;
  mirrored?: boolean;
  onToggleMirror?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onOpenSettings?: () => void;
  className?: string;
};

export function TopBar({
  showBack = true,
  onBackHref = "/",
  onBackClick,
  mirrored,
  onToggleMirror,
  onToggleFullscreen,
  isFullscreen,
  onOpenSettings,
  className,
}: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    if (onBackHref) {
      router.push(onBackHref);
    } else {
      router.back();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-full bg-black/60 px-3 py-2 text-xs text-slate-100 shadow-lg shadow-black/40 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-300">
          Almost ready…
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {onToggleMirror && (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-7 w-7 rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
              mirrored && "border-emerald-400/70 bg-emerald-500/20 text-emerald-100",
            )}
            onClick={onToggleMirror}
            aria-pressed={mirrored}
            aria-label="Toggle mirror preview"
          >
            <FlipHorizontal className="h-4 w-4" />
          </Button>
        )}
        {onToggleFullscreen && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        )}
        {onOpenSettings && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            onClick={onOpenSettings}
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

