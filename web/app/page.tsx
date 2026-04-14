import Link from "next/link";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { ProductCard } from "@/components/ProductCard";
import { HorizontalCarousel } from "@/components/HorizontalCarousel";
import { PRODUCTS } from "@/lib/products";
import { VFX } from "@/lib/vfx";

const PILLARS = [
  {
    href: "/products",
    eyebrow: "01 — 3D Products",
    title: "Custom dioramas, printed on a Bambu X1C.",
    body: "Display scenes and shelf pieces designed for 1:64 collectors. Small batches, hand-finished in Bangalore.",
  },
  {
    href: "/vfx",
    eyebrow: "02 — VFX",
    title: "Motion work for the cars we love.",
    body: "Scale-shift transitions, animated dioramas, product reveals — built around real and printed castings.",
  },
  {
    href: "/diecast",
    eyebrow: "03 — Diecast",
    title: "A curated wall of 1:64 brands.",
    body: "Hot Wheels, Mini GT, Pop Race, Inno 64 — picks landing alongside the OneCreations store launch.",
  },
];

export default function Home() {
  return (
    <main className="relative pt-16">
      <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center px-6 py-24 md:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <span className="text-xs uppercase tracking-[0.3em] text-text-muted">
            Studio · Bangalore · Est. 2026
          </span>

          <h1 className="mt-6 leading-[0.9] glow-text">
            <AnimatedLogo size="xl" />
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-text-muted md:text-xl">
            A small studio building 3D-printed dioramas, motion work, and
            curated diecast picks for the people who care about the details on
            their shelf.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.02]"
            >
              Shop 3D products
            </Link>
            <Link
              href="/vfx"
              className="rounded-md border border-border-strong px-5 py-3 text-sm text-text transition-colors hover:border-accent hover:text-accent"
            >
              See the VFX work
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-border pt-8 text-sm text-text-muted">
            <span>Printed on Bambu X1C</span>
            <span className="hidden h-1 w-1 rounded-full bg-text-dim md:inline-block" />
            <span>1:64 dioramas + display pieces</span>
            <span className="hidden h-1 w-1 rounded-full bg-text-dim md:inline-block" />
            <span>Made-to-order, small batches</span>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex max-w-2xl flex-col gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
              Three things we do
            </span>
            <h2 className="font-serif text-5xl md:text-6xl">
              What OneCreations is, end to end.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PILLARS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="card-glow group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-8 transition-colors hover:border-border-strong"
              >
                <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
                  {p.eyebrow}
                </span>
                <h3 className="font-serif text-3xl leading-tight">{p.title}</h3>
                <p className="text-sm text-text-muted">{p.body}</p>
                <span className="mt-auto pt-6 text-sm text-text-muted transition-colors group-hover:text-accent">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HorizontalCarousel
        eyebrow="From the workshop"
        title="Pieces dropping with the store launch."
      >
        {PRODUCTS.slice(0, 5).map((p) => (
          <div
            key={p.slug}
            className="w-[78vw] flex-shrink-0 snap-start sm:w-[40vw] lg:w-[26rem]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </HorizontalCarousel>

      <section className="relative px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-4">
            <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
              VFX reel
            </span>
            <h2 className="font-serif text-5xl leading-[1.05] md:text-6xl">
              Motion built around the castings, not the other way around.
            </h2>
            <p className="max-w-md text-base text-text-muted">
              Scale shifts, garage flythroughs, and product reveals where the
              car is the main character — not the camera move.
            </p>
            <div className="mt-4">
              <Link
                href="/vfx"
                className="inline-flex rounded-md border border-border-strong px-5 py-3 text-sm text-text transition-colors hover:border-accent hover:text-accent"
              >
                Watch the reel →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {VFX.slice(0, 4).map((clip) => (
              <div
                key={clip.slug}
                className="aspect-video overflow-hidden rounded-lg border border-border"
                style={{
                  background: `linear-gradient(135deg, ${clip.gradient[0]}, ${clip.gradient[1]})`,
                }}
              >
                <div className="grid h-full w-full place-items-center text-2xl text-text/80">
                  ▶
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-text-muted">
            Get on the list
          </span>
          <h2 className="font-serif text-5xl leading-[1.05] md:text-7xl">
            First drop, first look.
          </h2>
          <p className="max-w-xl text-base text-text-muted">
            One email when the first batch goes live. No spam, no weekly
            newsletter — just the drop.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.02]"
            >
              Browse 3D products
            </Link>
            <Link
              href="/diecast"
              className="rounded-md border border-border-strong px-6 py-3 text-sm text-text transition-colors hover:border-accent hover:text-accent"
            >
              Diecast brands
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-border px-6 py-12 text-sm text-text-muted md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <span className="font-serif text-xl text-text">OneCreations</span>
            <span>© {new Date().getFullYear()} · Made in Bangalore</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/products" className="hover:text-text">3D Products</Link>
            <Link href="/vfx" className="hover:text-text">VFX</Link>
            <Link href="/diecast" className="hover:text-text">Diecast</Link>
            <Link href="/login" className="hover:text-text">Sign in</Link>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-text"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
