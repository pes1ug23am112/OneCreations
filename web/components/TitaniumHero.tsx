"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type Props = {
  text: string;
  className?: string;
};

export function TitaniumHero({ text, className = "" }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.from(".titanium-word", {
        filter: "blur(24px)",
        y: 40,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.04,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const words = text.split(" ");

  return (
    <h1
      ref={ref}
      className={`titanium-text font-serif leading-[0.95] tracking-tight ${className}`}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="titanium-word inline-block pr-[0.25em] will-change-transform"
        >
          {word}
        </span>
      ))}
    </h1>
  );
}
