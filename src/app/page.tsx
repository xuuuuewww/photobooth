import Image from "next/image";
import Link from "next/link";
import { HomeTemplateGrid } from "@/components/HomeTemplateGrid";

export default function Home() {
  return (
    <div className="flex min-h-[100vh] items-stretch justify-center bg-neutral-50 px-3 py-4 md:px-6 md:py-6">
      <main className="relative flex w-full max-w-6xl flex-col items-center">
        <section className="flex w-full flex-1 flex-col items-center gap-5 md:gap-7">
          <header className="mt-4 space-y-2 text-center md:mt-6">
            <h1 className="text-[26px] font-semibold tracking-tight text-pink-500 md:text-[34px]">
              Choose A Photo Strip Template
            </h1>
            <p className="mx-auto text-xs text-neutral-500 md:whitespace-nowrap md:text-sm">
              Pick a strip style to match your moment. You can always refine colors, frames, and details later in the editor.
            </p>
          </header>

          <section aria-label="Photobooth templates" className="w-full">
            <HomeTemplateGrid />
          </section>
        </section>

        <section className="mt-20 w-full md:mt-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-50 via-pink-50 to-pink-100/80 px-4 py-7 shadow-[0_22px_80px_rgba(248,113,166,0.18)] md:px-8 md:py-8">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/40 via-transparent to-transparent" />

            <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="space-y-4 md:space-y-5">
              <h2 className="text-[21px] font-semibold tracking-tight text-neutral-900 md:text-[26px]">
                Photobooth Online &amp; Free
              </h2>
              <p className="max-w-md text-sm text-neutral-600 md:text-base">
                Create beautiful photo booth strips in seconds right from your
                browser. No downloads, no sign up, just instant memories made
                online for free.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-500 px-5 py-2 text-xs font-semibold tracking-[0.18em] text-white shadow-[0_16px_40px_rgba(244,114,182,0.5)] transition hover:bg-pink-400 md:px-6 md:py-2.5 md:text-sm"
              >
                Make My Photo Strip Now &gt;
              </Link>
            </div>

              <div className="flex items-center justify-center">
                <div className="relative h-[420px] w-full max-w-md animate-float-soft md:h-[520px]">
                  <div className="absolute left-0 top-2 z-0 flex h-[360px] w-[260px] -rotate-8 items-center justify-center overflow-hidden rounded-[1.9rem] border border-white/80 bg-neutral-100 shadow-[0_22px_60px_rgba(15,23,42,0.28)] md:h-[420px] md:w-[270px]">
                  <Image
                    src="/hero-photo-booth-3.png"
                    alt="Photobooth strip example, back layer"
                    width={270}
                    height={900}
                    className="h-full w-auto object-cover"
                  />
                  </div>

                  <div className="group absolute right-2 top-12 z-10 flex h-[380px] w-[280px] items-center justify-center overflow-hidden rounded-[2rem] border border-neutral-100 bg-neutral-50 shadow-[0_30px_90px_rgba(15,23,42,0.38)] transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.03] md:h-[460px] md:w-[290px]">
                  <Image
                    src="/hero-photo-booth-2.png"
                    alt="Photobooth strip example, front layer"
                    width={290}
                    height={960}
                    className="h-full w-auto object-cover"
                  />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
