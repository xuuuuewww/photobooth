import Image from "next/image";
import Link from "next/link";

export function BottomFooterNav() {
  return (
    <footer className="border-t border-pink-100/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left md:px-10">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 sm:justify-start"
          aria-label="Go to homepage"
        >
          <Image
            src="/logo.png"
            alt="Photobooth online logo"
            width={26}
            height={26}
            className="h-7 w-7 object-cover"
          />
          <span className="text-[13px] font-semibold tracking-tight text-pink-700">
            photobooth-online.com
          </span>
        </Link>

        <p className="text-[13px] font-medium text-neutral-700">
          Make Photo Strips Online
        </p>

        <p className="text-[13px] text-neutral-500">
          © 2026 photobooth-online.com. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

