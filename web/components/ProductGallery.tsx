"use client";

import { useState } from "react";
import type { Product3D } from "@/lib/3d-products";

type Props = {
  product: Product3D;
};

export function ProductGallery({ product }: Props) {
  const images = product.images ?? [];
  const [active, setActive] = useState(0);
  const [a, b, c] = product.gradient;

  const current = images[active];
  const fallbackStyle = {
    background: `radial-gradient(circle at 30% 20%, ${c}55, transparent 55%), linear-gradient(135deg, ${a}, ${b})`,
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-square overflow-hidden rounded-xl border border-white/5"
        style={current ? undefined : fallbackStyle}
      >
        {current && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current}
            src={current}
            alt={`${product.title} — view ${active + 1}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent" />

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() =>
                setActive((i) => (i - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-bg/60 px-3 py-1.5 text-sm text-white/80 backdrop-blur transition-colors hover:border-white/30 hover:text-white"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setActive((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-bg/60 px-3 py-1.5 text-sm text-white/80 backdrop-blur transition-colors hover:border-white/30 hover:text-white"
            >
              →
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-bg/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-white/70 backdrop-blur">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={active === i}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border transition-colors ${
                active === i
                  ? "border-white/60"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
