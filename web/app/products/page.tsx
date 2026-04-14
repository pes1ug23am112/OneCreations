import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS_3D } from "@/lib/3d-products";

export const metadata = {
  title: "3D Products — OneCreations",
  description:
    "Custom 3D-printed dioramas and display pieces for 1:64 diecast collectors.",
};

export default function ProductsPage() {
  return (
    <main className="relative pt-32 pb-24">
      <section className="mx-auto max-w-7xl px-6">
        <div className="flex max-w-3xl flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.25em] text-white/50">
            Catalog · 3D Products
          </span>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tighter md:text-7xl">
            Pieces designed for the shelf.
          </h1>
          <p className="mt-2 max-w-xl text-base text-white/50">
            Each piece is sliced, printed on a Bambu X1C, sanded, and finished
            by hand. Notify yourself on a piece and you will hear the moment it
            opens for orders.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS_3D.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
