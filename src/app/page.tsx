import { trackTemplateClick } from '@/lib/analytics'
import Image from "next/image";
import Link from "next/link";
import { HomeTemplateGrid } from "@/components/HomeTemplateGrid";
import { Building2, Cake, Heart, LayoutTemplate, Sparkles, Users } from "lucide-react";
import { HomeFaqAccordion } from "@/components/home/HomeFaqAccordion";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Photobooth-online.com really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, completely free. There are no hidden fees, no subscription plans, and no credit card required. Every feature including templates, filters, stickers, custom footer text, and instant download is available to every user at no cost.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to download an app or create an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No download and no sign-up required. Photobooth-online.com is a free online photo booth that runs entirely in your browser. Just open the page, allow camera access, and you are ready to start shooting in seconds.",
      },
    },
    {
      "@type": "Question",
      name: "What devices does the online photo booth work on?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It works on any device with a camera and a modern browser, including iPhone, Android, Mac, and Windows. Whether you are on a phone, tablet, or laptop, the experience is the same, fast, smooth, and completely free.",
      },
    },
    {
      "@type": "Question",
      name: "How many photos does a photo strip have?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each photo strip contains 4 photos taken in sequence with a countdown timer. After shooting, you can customize the background color, background pattern, filters, and stickers before downloading your finished strip.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use this as a photo booth for my wedding or party?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Photobooth-online.com is a popular choice for weddings, birthday parties, corporate events, and holiday gatherings. Simply open it on any device at your event, choose a template, and let your guests make their own photo strips to keep and share.",
      },
    },
    {
      "@type": "Question",
      name: "Can I share my photo strip on Instagram or other social media?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Once you download your photo strip, you can share it instantly to Instagram, Facebook, Twitter, WhatsApp, or any platform you use. The finished strip exports as a high-quality image that looks great on any screen.",
      },
    },
  ],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Photobooth Online",
  url: "https://www.photobooth-online.com",
  description:
    "Free online photo booth. Create beautiful photo strips instantly in your browser. No downloads, no sign up required.",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
    <div id="top" className="flex min-h-[100vh] items-stretch justify-center bg-neutral-50 px-3 py-4 md:px-6 md:py-6">
      <main className="relative flex w-full max-w-6xl flex-col items-center">
        <section className="flex w-full flex-1 flex-col items-center gap-5 md:gap-7">
          <header className="mt-4 space-y-2 text-center md:mt-6">
            <h1 className="text-[26px] font-semibold tracking-tight text-pink-500 md:text-[34px]">
              Free Photo Booth Online — Make Photo Strips Instantly
            </h1>
            <p className="mx-auto text-xs text-neutral-500 md:whitespace-nowrap md:text-sm">
              Pick a template, take photos, and download photo strips in seconds.
              No sign up, no downloads needed.
            </p>
          </header>

          <section aria-label="Photobooth templates" className="w-full">
            <HomeTemplateGrid />
          </section>
        </section>

        <section className="mt-[30px] w-full md:mt-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-50 via-pink-50 to-pink-100/80 px-4 py-7 shadow-[0_22px_80px_rgba(248,113,166,0.18)] md:px-8 md:py-8">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/40 via-transparent to-transparent" />

            <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="space-y-4 md:space-y-5">
              <h2 className="text-[22px] font-semibold tracking-tight text-pink-700 md:text-[31px]">
                Photobooth Online &amp; Free
              </h2>
              <p className="max-w-[640px] text-sm text-neutral-600 md:text-base">
                Create beautiful photo booth strips in seconds right from your
                browser. No downloads, no sign up. Just open the page, choose
                a template, and start shooting. Photobooth-online.com turns
                any phone, tablet, or laptop into a free photo booth in
                seconds. It's perfect for weddings, birthday parties, date
                nights, and everyday fun.
              </p>
              <Link
                href="#top"
                className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-500 px-5 py-2 text-xs font-semibold tracking-[0.18em] text-white shadow-[0_16px_40px_rgba(244,114,182,0.5)] transition hover:bg-pink-400 md:px-6 md:py-2.5 md:text-sm"
              >
                Make My Photo Strip Now &gt;
              </Link>
            </div>

              <div className="flex items-center justify-center">
                <div className="relative h-[420px] w-full max-w-md animate-float-soft md:h-[520px]">
                  <div className="absolute left-0 top-2 z-0 flex h-[360px] w-[260px] -rotate-8 items-center justify-center overflow-hidden rounded-[1.9rem] border border-white/80 bg-neutral-100 shadow-[0_22px_60px_rgba(15,23,42,0.28)] md:h-[420px] md:w-[270px]">
                  <Image
                    src="/hero-photo-booth-3.webp"
                    alt="free photo booth app"
                    width={270}
                    height={900}
                    className="h-full w-auto object-cover"
                  />
                  </div>

                  <div className="group absolute right-2 top-12 z-10 flex h-[380px] w-[280px] items-center justify-center overflow-hidden rounded-[2rem] border border-neutral-100 bg-neutral-50 shadow-[0_30px_90px_rgba(15,23,42,0.38)] transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.03] md:h-[460px] md:w-[290px]">
                  <Image
                    src="/hero-photo-booth-2.webp"
                    alt="free photo booth apps"
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

        {/* Features / Bento Grid */}
        <section className="mt-[40px] w-full px-2 md:mt-24 md:px-0">
          <div className="mx-auto w-full max-w-7xl px-0">
            <div className="mb-16 text-center">
              <h2 className="text-[22px] font-semibold tracking-tight text-pink-700 md:text-[31px]">
                Your Free Photo Booth Has Everything Built In
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm text-neutral-600 md:text-base">
                Multiple features, zero cost - templates, filters, stickers,
                custom text, multi-device support, and instant download.
                Everything you need to make a perfect photo strip is already
                here
              </p>
            </div>

            {/* Feature spotlight (placeholder image left, text right) */}
            <div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 gap-[30px] md:grid-cols-2 md:items-center md:gap-14">
              <div className="order-2 w-full overflow-visible md:order-1">
                <Image
                  src="/home-landing/photo-booth-filters.webp"
                  alt="Photo booth filters preview"
                  width={1280}
                  height={960}
                  className="h-auto w-full rounded-[2rem] object-contain"
                />
              </div>
              <div className="order-1 space-y-4 md:order-2">
                <h3 className="text-center text-[18px] font-semibold tracking-tight text-neutral-900 md:text-left md:text-[26px]">
                  Stunning Photo Booth Filters
                </h3>
                <p className="max-w-xl text-sm leading-relaxed text-neutral-600 md:text-base">
                  Choose from Vintage Sepia, Wedding Classic, Romantic Black &amp;
                  White, and more. Each template is designed to match a different
                  mood, so your photo strip always feels personal.
                </p>
              </div>
            </div>

            {/* Custom Photo Strip Filters and Background Colors */}
            <div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 gap-[30px] md:grid-cols-2 md:items-center md:gap-14">
              <div className="space-y-4">
                <h3 className="text-center text-[18px] font-semibold tracking-tight text-neutral-900 md:text-left md:text-[26px]">
                  Custom Photo Strip Filters and Background Colors
                </h3>
                <p className="max-w-xl text-sm leading-relaxed text-neutral-600 md:text-base">
                  Apply Sepia, Grayscale, or Warm filters directly in the
                  browser before you shoot. You can also pick from 10+ colors
                  and 5 background patterns — Solid, Dots, Checker, Diagonal
                  Stripe, or Grid.
                </p>
              </div>
              <div className="w-full overflow-visible">
                <Image
                  src="/home-landing/customize-photo-strips.webp"
                  alt="Customize photo strips preview"
                  width={1280}
                  height={960}
                  className="h-auto w-full rounded-[2rem] object-contain"
                />
              </div>
            </div>

            {/* Playful Photo Booth Stickers */}
            <div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 gap-[30px] md:grid-cols-2 md:items-center md:gap-14">
              <div className="order-2 w-full overflow-visible md:order-1">
                <Image
                  src="/home-landing/customize-photo-strips-stickers.webp"
                  alt="Photo strip stickers preview"
                  width={1280}
                  height={960}
                  className="h-auto w-full rounded-[2rem] object-contain"
                />
              </div>
              <div className="order-1 space-y-4 md:order-2">
                <h3 className="text-center text-[18px] font-semibold tracking-tight text-neutral-900 md:text-left md:text-[26px]">
                  Playful Photo Booth Stickers
                </h3>
                <p className="max-w-xl text-sm leading-relaxed text-neutral-600 md:text-base">
                  Add hearts, stars, butterflies, and more to your strip.
                  Make every photo uniquely yours.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Use Cases */}
        <section className="relative mt-[20px] w-full px-3 pt-8 pb-16 md:mt-24 md:px-6 md:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 left-1/2 right-1/2 -mx-[50vw] w-screen bg-pink-50/70"
          />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-[44px] flex flex-col items-center justify-between gap-6 text-center md:mb-16">
              <div className="max-w-3xl">
                <h2 className="text-[22px] font-semibold tracking-tight text-pink-700 md:text-[31px]">
                  Photo Strips Made for Every Moment
                </h2>
                <p className="mt-4 text-sm text-neutral-600 md:text-base">
                  From weddings and birthday parties to date nights, holiday
                  gatherings, corporate events, and everyday fun, there is
                  always a reason to make a photo strip.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2">
              <div className="group overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <div className="relative h-[250px] overflow-hidden bg-white/70">
                  <Image
                    src="/home-landing/use-case-pensonal.webp"
                    alt="Personal and social photo strip use case"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-[18px] font-bold text-neutral-900 md:text-xl">
                    Personal &amp; Social
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Snap, save, and share your favorite moments with friends
                    across all platforms instantly. No special occasion needed.
                    Some of the best photo strips happen on the most ordinary
                    days.
                  </p>
                </div>
              </div>

              <div className="group overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <div className="relative h-[250px] overflow-hidden bg-white/70">
                  <Image
                    src="/home-landing/use-case-wedding.webp"
                    alt="Wedding photo strip use case"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-[18px] font-bold text-neutral-900 md:text-xl">
                    Weddings
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Set up a free photo booth at your reception and let every
                    guest walk away with a memory. The bride, the groom, and
                    every person in the room gets a beautiful keepsake saved to
                    their phone. Yours to treasure forever.
                  </p>
                </div>
              </div>

              <div className="group overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <div className="relative h-[250px] overflow-hidden bg-white/70">
                  <Image
                    src="/home-landing/use-case-party.webp"
                    alt="Party and birthday photo strip use case"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-[18px] font-bold text-neutral-900 md:text-xl">
                    Parties &amp; Birthdays
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Turn any celebration into a memory everyone takes home. Set
                    up a free photo booth at your next party and let guests make
                    their own strips on the spot — a fun activity and a personal
                    keepsake all in one.
                  </p>
                </div>
              </div>

              <div className="group overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <div className="relative h-[250px] overflow-hidden bg-white/70">
                  <Image
                    src="/home-landing/use-case-events.webp"
                    alt="Corporate event photo strip use case"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-[18px] font-bold text-neutral-900 md:text-xl">
                    Corporate Events
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Make your next team outing, office party, or brand
                    activation more memorable. Customize the footer text with
                    your company name or event date, and give every attendee a
                    photo strip they will actually hold onto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-[30px] w-full px-3 pt-5 pb-8 md:mt-24 md:px-6 md:py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center md:mb-14">
              <h2 className="text-[22px] font-semibold tracking-tight text-pink-700 md:text-[31px]">
                What People Are Saying about Our Photobooth Online
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {[
                {
                  quoteTitle: "Exactly what I was looking for",
                  quote:
                    "I used this for my wedding reception and every single guest loved it. So easy to set up and the photo strips came out beautiful. Will definitely use it again.",
                  initials: "SM",
                  name: "Sarah Johnson",
                  meta: "Wedding, New York",
                },
                {
                  quoteTitle: "Best free photo booth tool out there",
                  quote:
                    "I've tried a few similar tools but this one is the smoothest experience by far. No sign-up, no ads, just open and shoot. My friends and I use it all the time.",
                  initials: "JT",
                  name: "James Taylor",
                  meta: "Regular User",
                },
                {
                  quoteTitle: "Our guests couldn't stop using it",
                  quote:
                    "We set it up at a birthday party and it became the highlight of the night. Everyone was taking turns making strips and sharing them instantly. Totally free and totally worth it.",
                  initials: "LK",
                  name: "Linda King",
                  meta: "Event Planner",
                },
                {
                  quoteTitle: "Perfect for our team event",
                  quote:
                    "We used it for a company outing and added our team name in the footer. It was a fun activity and everyone walked away with a keepsake. Simple, fast, and free.",
                  initials: "DR",
                  name: "David Robinson",
                  meta: "Marketing Manager",
                },
              ].map((card) => (
                <div
                  key={card.initials}
                  className="flex flex-col rounded-[2rem] border border-pink-200 bg-white p-8 shadow-sm"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-xl leading-none text-pink-500">
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="mt-6 flex-1 text-sm leading-relaxed text-neutral-700">
                    <span>{card.quoteTitle}.</span> {card.quote}
                  </p>

                  <div className="mt-auto flex items-center gap-4 pt-10">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-sm font-bold text-white">
                      {card.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">
                        {card.name}
                      </p>
                      <p className="text-sm text-neutral-500">{card.meta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="mt-[30px] w-full rounded-[3rem] bg-pink-50/70 px-3 py-14 text-neutral-900 md:mt-24 md:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="mx-auto w-full text-center text-[22px] font-semibold tracking-tight text-pink-700 md:text-[31px]">
              How to Create Photo Strips Online
            </h2>

            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="w-full text-center">
                <div className="mt-10 w-full space-y-10 text-left">
                  {/* Step 1 */}
                  <div className="flex gap-6 items-start">
                    <span className="font-headline text-5xl font-black text-pink-600/30">
                      01
                    </span>
                    <div>
                      <h3 className="text-[18px] font-bold text-neutral-900 md:text-2xl">
                        Pick a template
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                        Browse our library of professionally designed layouts and
                        select the one that matches your vibe.
                      </p>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="flex gap-6 items-start">
                    <span className="font-headline text-5xl font-black text-pink-600/30">
                      02
                    </span>
                    <div>
                      <h3 className="text-[18px] font-bold text-neutral-900 md:text-2xl">
                        Snap your photos
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                        Let your personality shine! Use our high-quality filters
                        and digital props to perfect each shot.
                      </p>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="flex gap-6 items-start">
                    <span className="font-headline text-5xl font-black text-pink-600/30">
                      03
                    </span>
                    <div>
                      <h3 className="text-[18px] font-bold text-neutral-900 md:text-2xl">
                        Customize &amp; Download
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                        Refine colors, frames, or add stickers later in the
                        editor. Instantly grab your high-resolution photo
                        strips and share them with your world.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="#top"
                  className="mt-12 inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-base font-black text-pink-600 shadow-[0_16px_40px_rgba(244,114,182,0.5)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Your First Strip
                </Link>
              </div>

              <div className="relative flex justify-center">
                <Image
                  src="/home-landing/how-to-use.webp"
                  alt="How to create photo strips online"
                  width={1200}
                  height={900}
                  className="mt-[20px] h-auto w-full max-w-[300px] rounded-3xl object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mt-[30px] w-full px-3 pb-6 md:mt-24 md:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-[22px] font-semibold tracking-tight text-pink-700 md:text-[31px]">
              Frequently Asked Questions about Photo Booth Online
            </h2>
            <HomeFaqAccordion
              items={[
                {
                  q: "Is Photobooth-online.com really free?",
                  a: "Yes, completely free. There are no hidden fees, no subscription plans, and no credit card required. Every feature - including templates, filters, stickers, custom footer text, and instant download - is available to every user at no cost.",
                },
                {
                  q: "Do I need to download an app or create an account?",
                  a: "No download and no sign-up required. Photobooth-online.com is a free online photo booth that runs entirely in your browser. Just open the page, allow camera access, and you are ready to start shooting in seconds.",
                },
                {
                  q: "What devices does the online photo booth work on?",
                  a: "It works on any device with a camera and a modern browser, including iPhone, Android, Mac, and Windows. Whether you are on a phone, tablet, or laptop, the experience is the same - fast, smooth, and completely free.",
                },
                {
                  q: "How many photos does a photo strip have?",
                  a: "Each photo strip contains 4 photos taken in sequence with a countdown timer. After shooting, you can customize the background color, background pattern, filters, and stickers before downloading your finished strip.",
                },
                {
                  q: "Can I use this as a photo booth for my wedding or party?",
                  a: "Absolutely. Photobooth-online.com is a popular choice for weddings, birthday parties, corporate events, and holiday gatherings. Simply open it on any device at your event, choose a template, and let your guests make their own photo strips to keep and share.",
                },
                {
                  q: "Can I share my photo strip on Instagram or other social media?",
                  a: "Yes. Once you download your photo strip, you can share it instantly to Instagram, Facebook, Twitter, WhatsApp, or any platform you use. The finished strip exports as a high-quality image that looks great on any screen.",
                },
              ]}
            />
          </div>
        </section>
      </main>
    </div>
    </>
  );
}
