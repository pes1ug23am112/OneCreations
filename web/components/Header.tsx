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
  const [menuOpen, setMenuOpen] = useState(false);
  const [revealed, setRevealed] = useState(true);

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isHome) {
      setRevealed(true);
      return;
    }
    const update = () => {
      const nearTop = window.scrollY < 12;
      setRevealed(nearTop);
    };
    update();
    const onMove = (e: MouseEvent) => {
      if (e.clientY < 80 || window.scrollY < 12) setRevealed(true);
      else if (!menuOpen) setRevealed(false);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("mousemove", onMove);
    };
  }, [isHome, menuOpen]);

  const hidden = !isHome && !revealed && !menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-bg/70 backdrop-blur-xl" : ""
      } ${hidden ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center">
          <span className="font-object-sans text-2xl font-bold tracking-tight transition-colors group-hover:text-accent">
            Store
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
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-strong text-text transition-colors hover:border-accent hover:text-accent md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute inset-x-0 top-0 h-px bg-current transition-transform ${
                  menuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current transition-opacity ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform ${
                  menuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div className="magma-divider -mt-2" aria-hidden />

      {menuOpen && (
        <div className="border-t border-border bg-bg/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-6 py-4">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-md px-3 py-3 text-base transition-colors ${
                    active ? "text-text" : "text-text-muted hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-3 text-base text-text-muted transition-colors hover:text-text"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
