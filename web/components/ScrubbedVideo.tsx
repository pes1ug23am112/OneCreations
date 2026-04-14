"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  src: string;
  className?: string;
};

export function ScrubbedVideo({ src, className = "" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    const onError = () => setFailed(true);
    video.addEventListener("error", onError);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(wrap);

    return () => {
      io.disconnect();
      video.removeEventListener("error", onError);
    };
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next) video.play().catch(() => {});
  };

  return (
    <>
      <div
        ref={wrapRef}
        className={`relative ${failed ? "h-screen" : className}`}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 40%, rgba(120, 60, 200, 0.35), transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(80, 30, 160, 0.3), transparent 60%), linear-gradient(180deg, #0b0612 0%, #09090B 100%)",
            }}
          />
          {!failed && (
            <video
              ref={videoRef}
              src={src}
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
              className="relative h-full w-full object-cover"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg" />
        </div>
      </div>

      {mounted && !failed &&
        createPortal(
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={!muted}
            aria-label={muted ? "Turn BGM on" : "Turn BGM off"}
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full border border-white/10 bg-bg/70 px-4 py-2 text-xs uppercase tracking-[0.15em] text-white/70 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white"
          >
            <span
              className={`h-2 w-2 rounded-full ${!muted ? "bg-white" : "bg-white/30"}`}
            />
            BGM {muted ? "off" : "on"}
          </button>,
          document.body
        )}
    </>
  );
}
