import Link from "next/link";
import type { Product3D } from "@/lib/3d-products";
import { CardFlashlight } from "@/components/CardFlashlight";

const STATUS_LABEL: Record<Product3D["status"], string> = {
  available: "Available",
  preorder: "Preorder",
  "coming-soon": "Coming soon",
};

export function ProductCard({ product }: { product: Product3D }) {
  const [a, b, c] = product.gradient;
  return (
    <Link
      href={`/products/${product.id}`}
      className="card-glow group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-[#141415] transition-colors hover:border-white/10"
    >
      <CardFlashlight />
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
                ? "border-white/20 bg-white/10 text-white/80"
                : product.status === "preorder"
                  ? "border-white/15 bg-white/5 text-white/70"
                  : "border-white/10 bg-bg/40 text-white/50"
            }`}
          >
            {STATUS_LABEL[product.status]}
          </span>
        </div>
        <div className="absolute right-4 top-4 text-[0.65rem] uppercase tracking-[0.15em] text-white/50">
          {product.scale}
        </div>
      </div>
      <div className="relative z-20 flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-2xl leading-tight tracking-tight transition-colors group-hover:text-white">
          {product.title}
        </h3>
        <p className="text-sm text-white/50">{product.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-sm text-white/80">
            {product.price ?? "Notify when live"}
          </span>
          <span className="text-xs text-white/50 transition-colors group-hover:text-white/80">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
