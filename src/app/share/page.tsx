"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ShareContent() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("img");

  if (!imageUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-neutral-500">链接无效或已过期</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-800">
        Photo Strip
      </h1>
      <img
        src={imageUrl}
        alt="Shared photo strip"
        className="w-full max-w-[300px] rounded-lg shadow-lg"
      />
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-semibold text-white transition hover:bg-pink-400"
      >
        🎞️ Create Your Own Free Photo Strip
      </Link>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={null}>
      <ShareContent />
    </Suspense>
  );
}
