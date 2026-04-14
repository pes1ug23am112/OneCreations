"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "3D Products" },
  { href: "/vfx", label: "VFX" },
  { href: "/diecast", label: "Diecast" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-bg/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center">
          <span className="font-serif text-2xl tracking-tight transition-colors group-hover:text-accent">
            OneCreations
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-md px-4 py-2 text-sm transition-colors ${
                  active
                    ? "text-text"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-md border border-border-strong px-4 py-2 text-sm text-text transition-colors hover:border-accent hover:text-accent md:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/products"
            className="rounded-md bg-text px-4 py-2 text-sm font-medium text-bg transition-transform hover:scale-[1.02]"
          >
            Shop
          </Link>
        </div>
      </div>
    </header>
  );
}
