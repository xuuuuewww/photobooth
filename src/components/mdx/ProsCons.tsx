"use client";

import { Check, X } from "lucide-react";

export function ProsCons({
  pros = [],
  cons = [],
}: {
  pros?: string[];
  cons?: string[];
}) {
  const proList = Array.isArray(pros) ? pros : [];
  const conList = Array.isArray(cons) ? cons : [];

  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        {/* Pros */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <h4 className="font-bold text-neutral-800">Pros</h4>
          </div>
          <ul className="space-y-3">
            {proList.map((p, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl bg-gray-100/80 px-3 py-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-sm leading-relaxed text-neutral-800 sm:text-base">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
              <X className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <h4 className="font-bold text-neutral-800">Cons</h4>
          </div>
          <ul className="space-y-3">
            {conList.map((c, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl bg-gray-100/80 px-3 py-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <span className="text-sm leading-relaxed text-neutral-800 sm:text-base">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
