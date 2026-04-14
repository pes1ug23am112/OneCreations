"use client";

import { useMemo, useState } from "react";
import { ProductCard, type CardDensity } from "@/components/ProductCard";
import {
  PRODUCT_CATEGORIES,
  type Product3D,
  type ProductCategory,
} from "@/lib/3d-products";

type SortKey =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "title-asc"
  | "status";

const DENSITIES: CardDensity[] = [1, 4, 8, 16];

const DENSITY_GRID: Record<CardDensity, string> = {
  1: "grid-cols-1",
  4: "grid-cols-1 sm:grid-cols-2",
  8: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  16: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
};

const STATUS_ORDER: Record<Product3D["status"], number> = {
  available: 0,
  preorder: 1,
  "coming-soon": 2,
};

export function ProductsCatalog({ products }: { products: Product3D[] }) {
  const [density, setDensity] = useState<CardDensity>(4);
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [status, setStatus] = useState<Product3D["status"] | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    let list = [...products];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (status !== "all") list = list.filter((p) => p.status === status);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => (a.priceValue ?? Infinity) - (b.priceValue ?? Infinity));
        break;
      case "price-desc":
        list.sort((a, b) => (b.priceValue ?? -Infinity) - (a.priceValue ?? -Infinity));
        break;
      case "title-asc":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "status":
        list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
        break;
      case "newest":
      default:
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  }, [products, category, status, sort, query]);

  const availableCategories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return PRODUCT_CATEGORIES.filter((c) => present.has(c));
  }, [products]);

  return (
    <div className="mt-12">
      <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-[#111113] p-4 md:flex-row md:flex-wrap md:items-end md:gap-6">
        <label className="flex flex-1 flex-col gap-1.5 min-w-[180px]">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
            Search
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, tagline, tag…"
            className="rounded-md border border-white/10 bg-bg/40 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-white/30"
          />
        </label>

        <label className="flex flex-col gap-1.5 min-w-[220px]">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
            Category
          </span>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as ProductCategory | "all")
            }
            className="rounded-md border border-white/10 bg-bg/40 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/30"
          >
            <option value="all">All categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 min-w-[140px]">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
            Status
          </span>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as Product3D["status"] | "all")
            }
            className="rounded-md border border-white/10 bg-bg/40 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/30"
          >
            <option value="all">Any</option>
            <option value="available">Available</option>
            <option value="preorder">Preorder</option>
            <option value="coming-soon">Coming soon</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 min-w-[160px]">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
            Sort by
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-white/10 bg-bg/40 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/30"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price — low to high</option>
            <option value="price-desc">Price — high to low</option>
            <option value="title-asc">Title (A–Z)</option>
            <option value="status">Availability</option>
          </select>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
            View
          </span>
          <div
            role="group"
            aria-label="Cards per view"
            className="flex overflow-hidden rounded-md border border-white/10 bg-bg/40"
          >
            {DENSITIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDensity(d)}
                aria-pressed={density === d}
                className={`px-3 py-2 text-xs transition-colors ${
                  density === d
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/40">
        <span>
          {visible.length} of {products.length} piece
          {products.length === 1 ? "" : "s"}
        </span>
        {(category !== "all" || status !== "all" || query) && (
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setStatus("all");
              setQuery("");
            }}
            className="uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/50">
          No pieces match those filters yet.
        </div>
      ) : (
        <div className={`mt-6 grid gap-4 ${DENSITY_GRID[density]}`}>
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} density={density} />
          ))}
        </div>
      )}
    </div>
  );
}
