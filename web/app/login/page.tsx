import Link from "next/link";

export const metadata = {
  title: "Sign in — OneCreations",
};

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-6 pt-16">
      <div className="w-full max-w-md text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-text-muted">
          Account
        </span>
        <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-6xl">
          Sign in is coming with the store.
        </h1>
        <p className="mt-4 text-base text-text-muted">
          Accounts unlock once checkout goes live. For now, save pieces by
          notifying yourself on each one.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.02]"
          >
            Browse 3D products
          </Link>
          <Link
            href="/"
            className="rounded-md border border-border-strong px-5 py-3 text-sm text-text transition-colors hover:border-accent hover:text-accent"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
