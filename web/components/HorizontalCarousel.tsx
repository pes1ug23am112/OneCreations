"use client";

import { useRef } from "react";

type Props = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function HorizontalCarousel({ title, eyebrow, children }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 720);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <section className="relative w-full py-16 md:py-24">
      <div className="mx-auto flex max-w-7xl items-end justify-between px-6">
        <div className="flex flex-col gap-2">
          {eyebrow && (
            <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
              {eyebrow}
            </span>
          )}
          <h2 className="font-serif text-4xl md:text-5xl">{title}</h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="grid h-10 w-10 place-items-center rounded-full border border-border-strong text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            ←
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="grid h-10 w-10 place-items-center rounded-full border border-border-strong text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="scrollbar-hide mt-8 flex w-full snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:gap-6"
      >
        {children}
      </div>
    </section>
  );
}
