"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { VfxClip } from "@/lib/vfx";

export function VfxPlayer({ clips }: { clips: VfxClip[] }) {
  const [active, setActive] = useState<VfxClip | null>(null);
  const [bgmOn, setBgmOn] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = bgmRef.current;
    if (!el) return;
    if (bgmOn) el.play().catch(() => setBgmOn(false));
    else el.pause();
  }, [bgmOn]);

  return (
    <>
      <audio
        ref={bgmRef}
        src="/audio/ambient.mp3"
        loop
        preload="none"
        aria-hidden
      />

      <button
        onClick={() => setBgmOn((v) => !v)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full border border-border-strong bg-bg/70 px-4 py-2 text-xs uppercase tracking-[0.15em] text-text-muted backdrop-blur-md transition-colors hover:border-accent hover:text-accent"
        aria-pressed={bgmOn}
      >
        <span
          className={`h-2 w-2 rounded-full ${bgmOn ? "bg-accent" : "bg-text-dim"}`}
        />
        BGM {bgmOn ? "on" : "off"}
      </button>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clips.map((clip) => (
          <button
            key={clip.slug}
            onClick={() => setActive(clip)}
            className="card-glow group relative aspect-video overflow-hidden rounded-lg border border-border text-left"
            style={{
              background: `linear-gradient(135deg, ${clip.gradient[0]}, ${clip.gradient[1]})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
            <div className="absolute right-3 top-3 rounded-sm bg-bg/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.15em] text-text-muted backdrop-blur">
              {clip.duration}
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-text/40 bg-bg/30 text-2xl text-text backdrop-blur transition-transform group-hover:scale-110">
                ▶
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="font-serif text-xl leading-tight">{clip.title}</h3>
              <p className="mt-1 text-xs text-text-muted">{clip.blurb}</p>
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
            className="fixed inset-0 z-50 grid place-items-center bg-bg/85 p-6 backdrop-blur-md"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-border-strong bg-surface"
            >
              <div
                className="aspect-video w-full"
                style={{
                  background: `linear-gradient(135deg, ${active.gradient[0]}, ${active.gradient[1]})`,
                }}
              >
                {active.src ? (
                  <video
                    src={active.src}
                    autoPlay
                    controls
                    className="h-full w-full"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-text-muted">
                    Video will play here when uploaded.
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between gap-4 p-5">
                <div>
                  <h3 className="font-serif text-2xl">{active.title}</h3>
                  <p className="mt-1 text-sm text-text-muted">{active.blurb}</p>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="rounded-md border border-border-strong px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-text-muted hover:text-text"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
