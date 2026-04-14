"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BRANDS } from "@/lib/brands";

export function BrandCarousel() {
  const [active, setActive] = useState(0);
  const brand = BRANDS[active];

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {BRANDS.map((b, i) => (
          <button
            key={b.slug}
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              i === active
                ? "bg-text text-bg"
                : "border border-border-strong text-text-muted hover:text-text"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={brand.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2"
        >
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${brand.accent}55, transparent 55%), linear-gradient(135deg, #14141a, #1f1f26)`,
            }}
          >
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-serif text-5xl md:text-7xl text-text">
                {brand.name}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-text-muted">
              <span>{brand.slug}</span>
              <span>1:64</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
              Brand · 1:64
            </span>
            <h3 className="font-serif text-4xl md:text-5xl">{brand.name}</h3>
            <p className="max-w-md text-base text-text-muted">{brand.blurb}</p>

            <div className="mt-2 flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-border-strong px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-text-muted"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: brand.accent }}
                />
                Coming soon
              </span>
              <span className="text-xs text-text-dim">
                Inventory drops alongside the store launch.
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
