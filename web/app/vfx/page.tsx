import { VfxPlayer } from "@/components/VfxPlayer";
import { ScrubbedVideo } from "@/components/ScrubbedVideo";
import { ANIMATIONS } from "@/lib/animations";

export const metadata = {
  title: "VFX — OneCreations",
  description:
    "Motion work for diecast: scale-shift transitions, animated dioramas, product reveals.",
};

export default function VfxPage() {
  return (
    <main className="relative">
      <ScrubbedVideo src="/assets/videos/Hero.mp4" className="h-screen" />

      <section className="relative mx-auto -mt-[60vh] max-w-7xl px-6 pb-24">
        <div className="flex max-w-3xl flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.25em] text-white/50">
            Reel · VFX
          </span>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tighter md:text-7xl">
            Motion built around the castings.
          </h1>
          <p className="mt-2 max-w-xl text-base text-white/50">
            Scale-shift transitions, animated dioramas, and product reveals.
            Sound is optional — toggle it from the bottom right of the reel.
          </p>
        </div>

        <div className="mt-16">
          <VfxPlayer clips={ANIMATIONS} />
        </div>
      </section>
    </main>
  );
}
