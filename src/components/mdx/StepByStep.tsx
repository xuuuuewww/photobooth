"use client";

import React from "react";

export function StepByStep({ children }: { children: React.ReactNode }) {
  return (
    <ol className="not-prose my-6 list-none space-y-4 border-l-2 border-pink-200 pl-0">
      {React.Children.map(children, (child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ stepNumber?: number }>, { stepNumber: i + 1 })
          : child
      )}
    </ol>
  );
}

export function Step({
  title,
  children,
  stepNumber = 0,
}: {
  title: string;
  children: React.ReactNode;
  stepNumber?: number;
}) {
  return (
    <li className="relative flex gap-4 pl-8">
      <span className="absolute left-0 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-pink-300 bg-pink-100 text-sm font-bold text-pink-700">
        {stepNumber}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <span className="font-semibold text-pink-800">{title}</span>
        <div className="mt-1 text-neutral-700 [&>p]:mt-1">{children}</div>
      </div>
    </li>
  );
}
