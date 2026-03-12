"use client";

import { Lightbulb } from "lucide-react";

export function ProTip({
  title = "Pro Tip:",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="not-prose my-6 flex gap-3 rounded-xl border border-pink-200 bg-pink-50/60 p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-200 text-pink-700">
        <Lightbulb className="h-4 w-4" />
      </span>
      <div>
        <p className="font-semibold text-pink-800">{title}</p>
        <div className="mt-1 text-pink-900/90 [&>p]:mt-1">{children}</div>
      </div>
    </div>
  );
}
