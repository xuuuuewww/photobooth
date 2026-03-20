import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { BottomFooterNav } from "@/components/BottomFooterNav";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.photobooth-online.com"),
  title: "Photobooth Online Free – Create Photo Booth Strips Instantly without Sign Up",
  description:
    "Create beautiful photo booth strips online for free. No sign up, no downloads. Choose a template, take selfies, and generate stunning photo strips instantly in your browser.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Photobooth Online & Free",
    description:
      "Create beautiful photo booth strips in seconds right from your browser. No downloads, no sign up, just instant memories made online for free.",
    url: "https://www.photobooth-online.com",
    siteName: "Photobooth Online",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Photobooth Online",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photobooth Online & Free",
    description:
      "Create beautiful photo booth strips in seconds. No downloads, no sign up, free forever.",
    images: ["/og-image.webp"],
  },
  icons: {
    icon: [
      {
        url: "/favicon-v2.png",
        type: "image/png",
        sizes: "96x96",
      },
    ],
    shortcut: [{ url: "/favicon-v2.png", type: "image/png", sizes: "96x96" }],
    apple: [{ url: "/favicon-v2.png", type: "image/png", sizes: "96x96" }],
  },
};

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const GA_MEASUREMENT_ID = "G-0BXDGTHN02";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable}`}
    >
      <head>
        <link rel="preload" as="image" href="/demo/vintage/1.webp" />
      </head>
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe2f2,_#fff5f9_55%,_#ffe4ef_100%)] font-sans text-foreground antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-pink-100/80 bg-white/80 text-xs text-foreground backdrop-blur-md">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-1.5 md:px-10 md:py-3">
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
                    className="h-9 w-9 object-cover md:h-11 md:w-11"
                  />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-pink-700 md:text-[14px]">
                    PHOTOBOOTH.online
                  </span>
                </Link>
                <nav className="hidden items-center gap-6 text-[14px] font-semibold text-pink-500/90 md:flex">
                  <Link href="/" className="transition hover:text-pink-700">
                    Home
                  </Link>
                  <Link href="/capture" className="transition hover:text-pink-700">
                    Capture
                  </Link>
                  <Link href="/customize" className="transition hover:text-pink-700">
                    Customize
                  </Link>
                  <Link href="/blog" className="transition hover:text-pink-700">
                    Blog
                  </Link>
                  <Link
                    href="/blog/how-to-use-photobooth-online"
                    className="transition hover:text-pink-700"
                  >
                    Guide
                  </Link>
                </nav>
                <MobileNavMenu />
              </div>
            </header>
            <main className="flex-1 pt-[46px] md:pt-[60px]">{children}</main>
            <BottomFooterNav />
          </div>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
        <Script
          id="_next-ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          window['dataLayer'] = window['dataLayer'] || [];
          function gtag(){window['dataLayer'].push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');`,
          }}
        />
        <Script
          id="_next-ga"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
      </body>
    </html>
  );
}
