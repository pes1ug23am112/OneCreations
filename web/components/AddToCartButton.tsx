"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";

export function AddToCartButton({
  productId,
  label = "Add to cart",
}: {
  productId: string;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => {
          add(productId, 1);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1500);
        }}
        className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-bg transition-transform hover:scale-[1.02] sm:h-auto sm:py-2.5"
      >
        {added ? "Added ✓" : label}
      </button>
      <Link
        href="/cart"
        className="inline-flex items-center justify-center rounded-md px-5 text-sm text-white/70 transition-colors hover:text-white sm:h-auto sm:rounded-md sm:border sm:border-white/10 sm:py-2.5 sm:text-white/80 sm:hover:border-white/30"
      >
        View cart
      </Link>
    </div>
  );
}
