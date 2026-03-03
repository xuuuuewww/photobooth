"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type SidePanelTab = "filters" | "stickers" | "layout" | "export";

type SidePanelProps = {
  value: SidePanelTab;
  onChange: (value: SidePanelTab) => void;
  children?: React.ReactNode;
  className?: string;
};

export function SidePanel({ value, onChange, children, className }: SidePanelProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col gap-3 rounded-3xl border border-slate-800/80 bg-black/60 p-3 text-xs text-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl md:w-72",
        className,
      )}
      aria-label="Editing tools"
    >
      <Tabs
        value={value}
        onValueChange={(val) => onChange(val as SidePanelTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 bg-slate-900/80">
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="stickers">Stickers</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex-1 overflow-y-auto rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/40 p-3">
        {children ?? (
          <div className="space-y-1 text-[11px] text-slate-400">
            <p className="font-medium text-slate-200">Tools coming soon</p>
            <p>
              Filters, stickers, layouts, and export settings will appear here
              once implemented.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

