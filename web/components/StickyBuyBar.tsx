"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product3D } from "@/lib/3d-products";

export function StickyBuyBar({ product }: { product: Product3D }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const available = product.status === "available";
  const price = product.price ?? "—";

  return (
    <div
      className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border-strong bg-bg/95 backdrop-blur-xl md:hidden"
      role="region"
      aria-label="Buy bar"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs text-white/50">{product.title}</div>
          <div className="font-serif text-xl leading-none">
            {available ? price : "Notify when live"}
          </div>
        </div>
        {available ? (
          <>
            <button
              type="button"
              onClick={() => {
                add(product.id, 1);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1200);
              }}
              className="inline-flex h-12 flex-[1.3] items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-bg transition-transform active:scale-[0.98]"
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>
            <Link
              href="/cart"
              aria-label="View cart"
              className="inline-flex h-12 items-center justify-center rounded-md border border-border-strong px-4 text-sm text-text transition-colors hover:border-accent hover:text-accent"
            >
              Cart
            </Link>
          </>
        ) : (
          <a
            href="#notify"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-bg"
          >
            Notify me
          </a>
        )}
      </div>
    </div>
  );
}
