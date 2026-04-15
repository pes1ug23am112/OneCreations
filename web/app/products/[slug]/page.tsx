import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { NotifyForm } from "@/components/NotifyForm";
import { ProductGallery } from "@/components/ProductGallery";
import { StickyBuyBar } from "@/components/StickyBuyBar";
import { PRODUCTS_3D, getProduct } from "@/lib/3d-products";

export async function generateStaticParams() {
  return PRODUCTS_3D.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Not found — OneCreations" };
  return {
    title: `${product.title} — OneCreations`,
    description: product.tagline,
  };
}

const STATUS_LABEL = {
  available: "Available",
  preorder: "Preorder",
  "coming-soon": "Coming soon",
} as const;

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const others = PRODUCTS_3D.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <main className="relative pt-32 pb-24 md:pb-24 [@media(max-width:767px)]:pb-32">
      <section className="mx-auto max-w-7xl px-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
        >
          ← All products
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="flex flex-col gap-3">
            <ProductGallery product={product} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-bg/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-white/60 backdrop-blur">
                {STATUS_LABEL[product.status]}
              </span>
              <span className="rounded-full border border-white/10 bg-bg/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-white/60 backdrop-blur">
                {product.scale}
              </span>
              <span className="rounded-full border border-white/10 bg-bg/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-white/60 backdrop-blur">
                {product.category}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-white/50">
                {product.scale}
              </span>
              <h1 className="font-serif text-5xl leading-[1.05] tracking-tighter md:text-6xl">
                {product.title}
              </h1>
              <p className="text-lg text-white/50">{product.tagline}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/5 px-3 py-1 text-xs text-white/50"
                >
                  {t}
                </span>
              ))}
            </div>

            <p className="text-base text-white/80">{product.description}</p>

            <div className="mt-2 flex items-baseline gap-4">
              <span className="font-serif text-3xl text-white/90">
                {product.price ?? "Notify when live"}
              </span>
              {product.status === "preorder" && (
                <span className="text-xs uppercase tracking-[0.15em] text-white/50">
                  Preorder · ships in batches
                </span>
              )}
            </div>

            {product.status === "available" ? (
              <div className="mt-4">
                <AddToCartButton productId={product.id} />
                <p className="mt-3 text-xs text-white/30">
                  Ships in 7–10 days from Bangalore. Hand-finished per order.
                </p>
              </div>
            ) : (
              <div id="notify" className="mt-4 rounded-xl border border-white/5 bg-[#141415] p-5 scroll-mt-24">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Get notified when this drops
                  </span>
                </div>
                <NotifyForm
                  variant="stacked"
                  productId={product.id}
                  productName={product.title}
                />
                <p className="mt-3 text-xs text-white/30">
                  One email when this piece is in stock. Nothing else.
                </p>
              </div>
            )}
          </div>
        </div>

        {others.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-8 font-serif text-3xl tracking-tight">More from the workshop</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="card-glow flex items-center gap-4 rounded-lg border border-white/5 bg-[#141415] p-4 transition-colors hover:border-white/10"
                >
                  <div
                    className="h-16 w-16 flex-shrink-0 rounded-md"
                    style={{
                      background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})`,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-serif text-lg leading-tight">
                      {p.title}
                    </div>
                    <div className="text-xs text-white/50">{p.tagline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
      <StickyBuyBar product={product} />
    </main>
  );
}
