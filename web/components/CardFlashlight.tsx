"use client";

import { useEffect, useRef } from "react";

export function CardFlashlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    function onMove(e: MouseEvent) {
      if (!el || !parent) return;
      const rect = parent.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      el.style.opacity = "1";
    }
    function onLeave() {
      if (!el) return;
      el.style.opacity = "0";
    }

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300"
      style={{
        background:
          "radial-gradient(600px circle at var(--mx) var(--my), rgba(255,255,255,0.06), transparent 40%)",
      }}
    />
  );
}
