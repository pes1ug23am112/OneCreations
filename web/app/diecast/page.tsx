import { BrandCarousel } from "@/components/BrandCarousel";

export const metadata = {
  title: "Diecast — OneCreations",
  description:
    "Curated 1:64 diecast brands — Hot Wheels, Mini GT, Pop Race, Inno 64, Tarmac Works, Tomica.",
};

export default function DiecastPage() {
  return (
    <main className="relative pt-32 pb-24">
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex max-w-3xl flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.25em] text-white/50">
            Curation · Diecast
          </span>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tighter md:text-7xl">
            A wall of 1:64, hand-picked.
          </h1>
          <p className="mt-2 max-w-xl text-base text-white/50">
            The brands worth shelf space. Inventory drops alongside the store
            launch — switch through the brands below to see what is coming.
          </p>
        </div>

        <div className="mt-16">
          <BrandCarousel />
        </div>
      </section>
    </main>
  );
}
