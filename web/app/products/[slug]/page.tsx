import Link from "next/link";
import { notFound } from "next/navigation";
import { NotifyForm } from "@/components/NotifyForm";
import { PRODUCTS, getProduct } from "@/lib/products";

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
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
    title: `${product.name} — OneCreations`,
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

  const [a, b, c] = product.gradient;
  const others = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <main className="relative pt-32 pb-24">
      <section className="mx-auto max-w-7xl px-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
        >
          ← All products
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${c}55, transparent 55%), linear-gradient(135deg, ${a}, ${b})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent" />
            <div className="absolute left-5 top-5 flex items-center gap-2">
              <span className="rounded-full border border-border-strong bg-bg/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-text-muted backdrop-blur">
                {STATUS_LABEL[product.status]}
              </span>
              <span className="rounded-full border border-border-strong bg-bg/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-text-muted backdrop-blur">
                {product.scale}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-text-muted">
                {product.scale}
              </span>
              <h1 className="font-serif text-5xl leading-[1.05] md:text-6xl">
                {product.name}
              </h1>
              <p className="text-lg text-text-muted">{product.tagline}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-3 py-1 text-xs text-text-muted"
                >
                  {t}
                </span>
              ))}
            </div>

            <p className="text-base text-text">{product.description}</p>

            <div className="mt-2 flex items-baseline gap-4">
              <span className="font-serif text-3xl text-text">
                {product.price ?? "Notify when live"}
              </span>
              {product.status === "preorder" && (
                <span className="text-xs uppercase tracking-[0.15em] text-text-muted">
                  Preorder · ships in batches
                </span>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
                  {product.status === "available"
                    ? "Want a heads-up on the next batch?"
                    : "Get notified when this drops"}
                </span>
              </div>
              <NotifyForm
                variant="stacked"
                productId={product.slug}
                productName={product.name}
              />
              <p className="mt-3 text-xs text-text-dim">
                One email when this piece is in stock. Nothing else.
              </p>
            </div>
          </div>
        </div>

        {others.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-8 font-serif text-3xl">More from the workshop</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="card-glow flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                >
                  <div
                    className="h-16 w-16 flex-shrink-0 rounded-md"
                    style={{
                      background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})`,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-serif text-lg leading-tight">
                      {p.name}
                    </div>
                    <div className="text-xs text-text-muted">{p.tagline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
