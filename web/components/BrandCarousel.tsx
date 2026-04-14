"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DIECAST_BRANDS } from "@/lib/diecast";

export function BrandCarousel() {
  const [active, setActive] = useState(0);
  const brand = DIECAST_BRANDS[active];

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
        {DIECAST_BRANDS.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-2 text-sm tracking-tight transition-colors ${
              i === active
                ? "bg-white text-bg"
                : "border border-white/10 text-white/50 hover:text-white"
            }`}
          >
            {b.title}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={brand.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2"
        >
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/5"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${brand.accent}33, transparent 55%), linear-gradient(135deg, #141415, #1c1c1e)`,
            }}
          >
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-serif text-5xl tracking-tight md:text-7xl text-white/90">
                {brand.title}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50">
              <span>{brand.id}</span>
              <span>1:64</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">
              Brand · 1:64
            </span>
            <h3 className="font-serif text-4xl tracking-tight md:text-5xl">{brand.title}</h3>
            <p className="max-w-md text-base text-white/50">{brand.description}</p>

            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-white/50">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: brand.accent }}
                />
                Coming soon
              </span>
              <span className="text-xs text-white/30">
                Inventory drops alongside the store launch.
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
