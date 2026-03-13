"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/capture", label: "Capture" },
  { href: "/customize", label: "Customize" },
  { href: "/blog", label: "Blog" },
  { href: "/blog/how-to-use-photobooth-online", label: "Guide" },
] as const;

export function MobileNavMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-pink-600 transition hover:text-pink-500"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-2xl border border-pink-100 bg-white/95 shadow-[0_14px_32px_rgba(15,23,42,0.18)] backdrop-blur">
          <nav className="flex flex-col p-1.5 text-sm font-semibold text-pink-600">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2 transition",
                    isActive
                      ? "bg-pink-500 text-white"
                      : "text-pink-700 hover:bg-pink-50",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
