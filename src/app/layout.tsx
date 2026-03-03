import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Photobooth Online Free – Create Photo Booth Strips Instantly without Sign Up",
  description:
    "Create beautiful photo booth strips online for free. No sign up, no downloads. Choose a template, take selfies, and generate stunning photo strips instantly in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe2f2,_#fff5f9_55%,_#ffe4ef_100%)] text-foreground antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-pink-100/80 bg-white/80 text-xs text-foreground backdrop-blur-md">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2 md:px-10 md:py-3">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 rounded-md transition hover:opacity-90 md:gap-3"
                  aria-label="Go to homepage"
                >
                  <Image
                    src="/logo.png"
                    alt=""
                    width={44}
                    height={44}
                    className="h-10 w-10 object-cover md:h-11 md:w-11"
                  />
                  <span className="text-[13px] font-semibold uppercase tracking-[0.22em] text-rose-700 md:text-[14px]">
                    PHOTOBOOTH.online
                  </span>
                </Link>
                <nav className="hidden items-center gap-8 text-[14px] font-semibold text-rose-500/90 md:flex">
                  <Link href="/" className="transition hover:text-rose-700">
                    Home
                  </Link>
                  <Link href="/capture" className="transition hover:text-rose-700">
                    Capture
                  </Link>
                  <Link href="/customize" className="transition hover:text-rose-700">
                    Customize
                  </Link>
                </nav>
              </div>
            </header>
            <main className="flex-1 pt-[52px] md:pt-[60px]">{children}</main>
          </div>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
        <GoogleAnalytics gaId="G-0BXDGTHN02" />
      </body>
    </html>
  );
}
