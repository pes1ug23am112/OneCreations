"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";

const STATUS_LABEL: Record<Product["status"], string> = {
  available: "Available",
  preorder: "Preorder",
  "coming-soon": "Coming soon",
};

export function ProductCard({ product }: { product: Product }) {
  const [a, b, c] = product.gradient;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card-glow group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-border-strong"
    >
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${c}40, transparent 50%), linear-gradient(135deg, ${a}, ${b})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.15em] ${
              product.status === "available"
                ? "border-accent/40 bg-accent/15 text-accent-soft"
                : product.status === "preorder"
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
                  : "border-border-strong bg-bg/40 text-text-muted"
            }`}
          >
            {STATUS_LABEL[product.status]}
          </span>
        </div>
        <div className="absolute right-4 top-4 text-[0.65rem] uppercase tracking-[0.15em] text-text-muted">
          {product.scale}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-2xl leading-tight transition-colors group-hover:text-accent">
          {product.name}
        </h3>
        <p className="text-sm text-text-muted">{product.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-sm text-text">
            {product.price ?? "Notify when live"}
          </span>
          <span className="text-xs text-text-muted transition-colors group-hover:text-accent">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
