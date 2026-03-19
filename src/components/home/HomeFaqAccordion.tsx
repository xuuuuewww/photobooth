"use client";

import React, { useMemo, useState } from "react";

export type HomeFaqItem = { q: string; a: string };

export function HomeFaqAccordion({ items }: { items: HomeFaqItem[] }) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="mt-8 space-y-4">
      {safeItems.map((item, i) => {
        const isOpen = i === openIndex;
        return (
          <details
            key={item.q}
            open={isOpen}
            className="group rounded-2xl border border-pink-100 bg-white p-5 shadow-sm"
            onToggle={(e) => {
              const details = e.currentTarget;
              const nextOpen = details.open;
              // 永远只展开一个 FAQ：关闭当前时不改变 openIndex。
              setOpenIndex((curr) => (nextOpen ? i : curr));
            }}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
              <span className="text-base font-semibold text-neutral-900 md:text-lg">
                {item.q}
              </span>
              <span
                className={
                  "text-pink-500 transition-transform " +
                  (isOpen ? "rotate-45" : "rotate-0")
                }
              >
                +
              </span>
            </summary>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 md:text-base">
              {item.a}
            </p>
          </details>
        );
      })}
    </div>
  );
}

