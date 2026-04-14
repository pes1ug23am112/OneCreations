import { VfxPlayer } from "@/components/VfxPlayer";
import { VFX } from "@/lib/vfx";

export const metadata = {
  title: "VFX — OneCreations",
  description:
    "Motion work for diecast: scale-shift transitions, animated dioramas, product reveals.",
};

export default function VfxPage() {
  return (
    <main className="relative pt-32 pb-24">
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex max-w-3xl flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.25em] text-text-muted">
            Reel · VFX
          </span>
          <h1 className="font-serif text-5xl leading-[1.05] md:text-7xl">
            Motion built around the castings.
          </h1>
          <p className="mt-2 max-w-xl text-base text-text-muted">
            Scale-shift transitions, animated dioramas, and product reveals.
            Sound's optional — toggle the BGM in the bottom right.
          </p>
        </div>

        <div className="mt-16">
          <VfxPlayer clips={VFX} />
        </div>

        <p className="mt-12 text-xs text-text-dim">
          Drop your final exports in <code>web/public/videos/</code> and an
          ambient track at <code>web/public/audio/ambient.mp3</code>. Then add
          their paths in <code>web/lib/vfx.ts</code>.
        </p>
      </section>
    </main>
  );
}
