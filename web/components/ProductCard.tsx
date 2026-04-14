import Link from "next/link";
import type { Product3D } from "@/lib/3d-products";
import { CardFlashlight } from "@/components/CardFlashlight";

const STATUS_LABEL: Record<Product3D["status"], string> = {
  available: "Available",
  preorder: "Preorder",
  "coming-soon": "Coming soon",
};

export type CardDensity = 1 | 4 | 8 | 16;

const DENSITY_STYLES: Record<
  CardDensity,
  {
    aspect: string;
    padding: string;
    title: string;
    tagline: string;
    footer: string;
    badge: string;
    showTagline: boolean;
    showFooter: boolean;
  }
> = {
  1: {
    aspect: "aspect-[16/10]",
    padding: "p-8",
    title: "font-serif text-4xl md:text-5xl leading-tight tracking-tight",
    tagline: "text-base text-white/60",
    footer: "text-base text-white/80",
    badge: "text-[0.7rem]",
    showTagline: true,
    showFooter: true,
  },
  4: {
    aspect: "aspect-square",
    padding: "p-5",
    title: "font-serif text-2xl leading-tight tracking-tight",
    tagline: "text-sm text-white/50",
    footer: "text-sm text-white/80",
    badge: "text-[0.65rem]",
    showTagline: true,
    showFooter: true,
  },
  8: {
    aspect: "aspect-square",
    padding: "p-3",
    title: "font-serif text-base leading-tight tracking-tight",
    tagline: "text-xs text-white/50 line-clamp-1",
    footer: "text-xs text-white/70",
    badge: "text-[0.6rem]",
    showTagline: true,
    showFooter: true,
  },
  16: {
    aspect: "aspect-square",
    padding: "p-2",
    title: "font-serif text-xs leading-tight tracking-tight line-clamp-1",
    tagline: "text-[0.65rem] text-white/50 line-clamp-1",
    footer: "text-[0.65rem] text-white/70",
    badge: "text-[0.55rem]",
    showTagline: false,
    showFooter: false,
  },
};

export function ProductCard({
  product,
  density = 4,
}: {
  product: Product3D;
  density?: CardDensity;
}) {
  const [a, b, c] = product.gradient;
  const s = DENSITY_STYLES[density];
  const heroImage = product.images?.[0];
  return (
    <Link
      href={`/products/${product.id}`}
      className="card-glow group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-[#141415] transition-colors hover:border-white/10"
    >
      <CardFlashlight />
      <div
        className={`relative ${s.aspect} overflow-hidden`}
        style={
          heroImage
            ? undefined
            : {
                background: `radial-gradient(circle at 30% 20%, ${c}40, transparent 50%), linear-gradient(135deg, ${a}, ${b})`,
              }
        }
      >
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 uppercase tracking-[0.15em] ${s.badge} ${
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
        {density <= 4 && (
          <div
            className={`absolute right-3 top-3 uppercase tracking-[0.15em] text-white/50 ${s.badge}`}
          >
            {product.scale}
          </div>
        )}
      </div>
      <div className={`relative z-20 flex flex-1 flex-col gap-1.5 ${s.padding}`}>
        <h3 className={`${s.title} transition-colors group-hover:text-white`}>
          {product.title}
        </h3>
        {s.showTagline && <p className={s.tagline}>{product.tagline}</p>}
        {s.showFooter && (
          <div className="mt-auto flex items-center justify-between pt-3">
            <span className={s.footer}>
              {product.price ?? "Notify when live"}
            </span>
            {density <= 4 && (
              <span className="text-xs text-white/50 transition-colors group-hover:text-white/80">
                View →
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
