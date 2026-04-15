import Link from "next/link";

export const metadata = {
  title: "Order confirmed — OneCreations",
};

export default async function CartSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <main className="relative pt-32 pb-24">
      <section className="mx-auto max-w-2xl px-6 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tighter md:text-6xl">
          Order received
        </h1>
        <p className="mt-4 text-white/60">
          Payment captured. We&apos;re printing your piece — expect a confirmation email shortly
          with ETA and tracking once it ships.
        </p>
        {order && (
          <p className="mt-6 font-mono text-xs text-white/40">
            Reference · {order}
          </p>
        )}
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/products"
            className="rounded-md bg-text px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.02]"
          >
            Back to shop
          </Link>
          <Link
            href="/"
            className="rounded-md border border-white/10 px-5 py-2.5 text-sm text-white/80 transition-colors hover:border-white/30 hover:text-white"
          >
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
