"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (CSS.supports("animation-timeline: view()")) return;

    const els = document.querySelectorAll<HTMLElement>(".reveal-up, .reveal-right");
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
