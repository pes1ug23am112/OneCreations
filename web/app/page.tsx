import Link from "next/link";
import { MagneticButton } from "@/components/MagneticButton";
import { ProductCard } from "@/components/ProductCard";
import { HorizontalCarousel } from "@/components/HorizontalCarousel";
import { NeuralNoiseClient as NeuralNoise } from "@/components/ui/neural-noise-client";
import { PRODUCTS_3D } from "@/lib/3d-products";
import { ANIMATIONS } from "@/lib/animations";

const PILLARS = [
  {
    href: "/products",
    eyebrow: "01 — 3D Products",
    title: "Dioramas, printed to spec.",
  },
  {
    href: "/vfx",
    eyebrow: "02 — VFX",
    title: "Motion, built around the castings.",
  },
  {
    href: "/diecast",
    eyebrow: "03 — Diecast",
    title: "A curated wall of 1:64.",
  },
];

export default function Home() {
  return (
    <main className="relative pt-16">
      <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-6 py-24 md:px-12">
        <div className="pointer-events-none absolute inset-0 z-0">
          <NeuralNoise />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center">
          <h1 className="font-object-sans charcoal-halo-text text-[clamp(1.75rem,8vw,6rem)] font-bold leading-[0.9] tracking-tight">
            OneCreations
          </h1>
          <span className="charcoal-halo-subtext font-object-sans mt-5 text-[clamp(0.7rem,1.4vw,1rem)] font-bold uppercase tracking-[0.45em] md:tracking-[0.55em]">
            Studio · Bangalore
          </span>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton>
              <Link
                href="/products"
                className="inline-flex rounded-md bg-[#7c3aed] px-6 py-3 text-sm font-semibold tracking-tight text-white shadow-[0_0_20px_rgba(124,58,237,0.45)] transition-colors hover:bg-[#8b4dfc]"
              >
                Shop 3D products
              </Link>
            </MagneticButton>
            <Link
              href="/vfx"
              className="rounded-md border border-white/10 px-6 py-3 text-sm tracking-tight text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              See the VFX work
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 md:py-32">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-16 flex max-w-2xl flex-col gap-3">
            <span className="reveal-up inline-block text-xs uppercase tracking-[0.2em] text-white/50">
              Three things we do
            </span>
            <h2 className="reveal-up delay-1 font-serif text-5xl tracking-tighter md:text-6xl">
              What OneCreations is, end to end.
            </h2>
          </div>
          <div className="pillar-grid grid grid-cols-1 gap-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Link
                key={p.href}
                href={p.href}
                className={`pillar-card reveal-up delay-${i + 2} group flex flex-col gap-6 rounded-2xl border border-white/5 bg-[#141415] p-8`}
              >
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {p.eyebrow}
                </span>
                <h3 className="font-serif text-3xl leading-tight tracking-tight">{p.title}</h3>
                <span className="mt-auto pt-8 text-sm text-white/50 transition-colors group-hover:text-white">
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
        {PRODUCTS_3D.slice(0, 5).map((p, i) => (
          <div
            key={p.id}
            className={`reveal-right delay-${i + 1} w-[64vw] flex-shrink-0 snap-start sm:w-[30vw] lg:w-[18rem]`}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </HorizontalCarousel>

      <section className="reveal-up relative z-10 px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-4">
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">
              VFX reel
            </span>
            <h2 className="font-serif text-5xl leading-[1.05] tracking-tighter md:text-6xl">
              Motion built around the castings, not the other way around.
            </h2>
            <p className="max-w-md text-base text-white/50">
              Scale shifts, garage flythroughs, and product reveals where the
              car is the main character — not the camera move.
            </p>
            <div className="mt-4">
              <Link
                href="/vfx"
                className="inline-flex rounded-md border border-white/10 px-5 py-3 text-sm text-white/80 transition-colors hover:border-white/30 hover:text-white"
              >
                Watch the reel →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ANIMATIONS.slice(0, 4).map((clip) => (
              <div
                key={clip.id}
                className="aspect-video overflow-hidden rounded-xl border border-white/5"
                style={{
                  background: `linear-gradient(135deg, ${clip.gradient[0]}, ${clip.gradient[1]})`,
                }}
              >
                <div className="grid h-full w-full place-items-center text-2xl text-white/60">
                  ▶
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal-up relative z-10 px-6 py-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-white/50">
            Get on the list
          </span>
          <h2 className="font-serif text-5xl leading-[1.05] tracking-tighter md:text-7xl">
            First drop, first look.
          </h2>
          <p className="max-w-xl text-base text-white/50">
            One email when the first batch goes live. No spam, no weekly
            newsletter — just the drop.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton>
              <Link
                href="/products"
                className="inline-flex rounded-md bg-white px-6 py-3 text-sm font-semibold tracking-tight text-bg"
              >
                Browse 3D products
              </Link>
            </MagneticButton>
            <Link
              href="/diecast"
              className="rounded-md border border-white/10 px-6 py-3 text-sm tracking-tight text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              Diecast brands
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 px-6 py-12 text-sm text-white/50 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <span className="font-object-sans text-xl font-bold tracking-tight text-white/90">OneCreations</span>
            <span>© {new Date().getFullYear()} · Made in Bangalore</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/products" className="hover:text-white">3D Products</Link>
            <Link href="/vfx" className="hover:text-white">VFX</Link>
            <Link href="/diecast" className="hover:text-white">Diecast</Link>
            <Link href="/login" className="hover:text-white">Sign in</Link>
            <a
              href="https://www.instagram.com/onecreations_media"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
