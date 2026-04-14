"use client";

import { motion } from "motion/react";

const LETTERS = "OneCreations".split("");

type Props = {
  size?: "sm" | "lg" | "xl";
  className?: string;
};

const sizeClass: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-2xl md:text-3xl",
  lg: "text-7xl md:text-8xl",
  xl: "text-8xl md:text-[10rem] lg:text-[14rem]",
};

export function AnimatedLogo({ size = "sm", className = "" }: Props) {
  return (
    <span
      className={`inline-flex font-serif tracking-tight ${sizeClass[size]} ${className}`}
      aria-label="OneCreations"
    >
      {LETTERS.map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.7,
            delay: i * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block"
          aria-hidden
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
