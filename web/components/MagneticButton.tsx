"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

type Props = {
  children: ReactNode;
  className?: string;
  radius?: number;
  strength?: number;
};

export function MagneticButton({
  children,
  className = "",
  radius = 120,
  strength = 0.25,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });
        return;
      }
      gsap.to(el, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.6,
        ease: "power3.out",
      });
    }

    function onLeave() {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });
    }

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [radius, strength]);

  return (
    <span ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </span>
  );
}
