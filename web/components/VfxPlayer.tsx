"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { AnimationClip } from "@/lib/animations";

export function VfxPlayer({ clips }: { clips: AnimationClip[] }) {
  const [active, setActive] = useState<AnimationClip | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clips.map((clip) => (
          <button
            key={clip.id}
            onClick={() => setActive(clip)}
            className="card-glow group relative aspect-video overflow-hidden rounded-xl border border-white/5 text-left"
            style={{
              background: `linear-gradient(135deg, ${clip.gradient[0]}, ${clip.gradient[1]})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
            <div className="absolute right-3 top-3 rounded-sm bg-bg/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.15em] text-white/60 backdrop-blur">
              {clip.duration}
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-bg/30 text-2xl text-white/90 backdrop-blur transition-transform group-hover:scale-110">
                ▶
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="font-serif text-xl leading-tight tracking-tight">{clip.title}</h3>
              <p className="mt-1 text-xs text-white/60">{clip.description}</p>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 grid place-items-center bg-bg/85 p-3 backdrop-blur-md sm:p-6"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#141415]"
            >
              <div
                className="aspect-video w-full"
                style={{
                  background: `linear-gradient(135deg, ${active.gradient[0]}, ${active.gradient[1]})`,
                }}
              >
                {active.status === "published" ? (
                  <video
                    src={active.assetPath}
                    autoPlay
                    controls
                    className="h-full w-full"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-white/50">
                    Video will play here when uploaded.
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-4 p-5">
                <div>
                  <h3 className="font-serif text-2xl tracking-tight">{active.title}</h3>
                  <p className="mt-1 text-sm text-white/50">{active.description}</p>
                </div>
                <button
                  onClick={() => setActive(null)}
                  aria-label="Close video"
                  className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md border border-white/10 text-lg text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  <span aria-hidden>✕</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
