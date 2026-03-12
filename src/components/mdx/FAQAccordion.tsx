import React from "react";
import { ChevronDown } from "lucide-react";

export type FAQItem = { question: string; answer: string };

export function FAQAccordion({ items }: { items?: FAQItem[] }) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;

  return (
    <div className="not-prose my-10">
      <ol className="list-none space-y-3 p-0">
        {list.map((item, i) => {
          const num = i + 1;
          return (
            <li
              key={i}
              className="overflow-hidden rounded-xl border border-pink-200 bg-pink-50/30"
            >
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left font-medium text-neutral-900 transition [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-200 text-xs font-bold text-pink-800">
                      {num}
                    </span>
                    {item.question}
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-pink-600 transition group-open:rotate-180" />
                </summary>
                <div className="border-t border-pink-200 bg-white px-4 py-3 pl-12">
                  <p className="text-sm leading-relaxed text-neutral-900 sm:text-base">
                    {item.answer}
                  </p>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
