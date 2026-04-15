"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "3D Products" },
  { href: "/vfx", label: "VFX" },
  { href: "/diecast", label: "Diecast" },
];

const DRAWER_ID = "site-mobile-drawer";

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-direction auto-hide: reveal on scroll-up, hide on scroll-down.
  // Works on touch (no mousemove) and desktop. Home page stays always-visible.
  useEffect(() => {
    if (isHome) {
      setHidden(false);
      return;
    }
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastScrollY.current;
      if (y < 12) setHidden(false);
      else if (Math.abs(dy) > 6) setHidden(dy > 0);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Close drawer on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Body scroll-lock + Escape-to-close while drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const effectivelyHidden = hidden && !menuOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 bg-bg/90 backdrop-blur-xl transition-all duration-300 ${
          scrolled ? "shadow-[0_1px_0_rgba(255,255,255,0.05)]" : ""
        } ${effectivelyHidden ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
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
                    active ? "text-text" : "text-text-muted hover:text-text"
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
              href="/cart"
              aria-label={`Cart${count > 0 ? ` (${count})` : ""}`}
              className="relative inline-flex h-11 items-center gap-2 rounded-md bg-text px-4 text-sm font-medium text-bg transition-transform hover:scale-[1.02] md:h-9"
            >
              <span>Cart</span>
              {count > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bg px-1.5 text-[10px] font-semibold text-text">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls={DRAWER_ID}
              onClick={() => setMenuOpen((v) => !v)}
              className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-strong text-text transition-colors hover:border-accent hover:text-accent md:hidden"
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
      </header>

      {/* Mobile drawer: backdrop + slide-in panel. Rendered at <body> layer so
          it sits above the fixed header and locks the whole viewport. */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-bg/80 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          id={DRAWER_ID}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={`pt-safe pb-safe absolute inset-y-0 right-0 flex w-[84%] max-w-sm flex-col border-l border-border-strong bg-bg shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between px-5">
            <span className="font-object-sans text-lg font-bold tracking-tight">
              Menu
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-strong text-text transition-colors hover:border-accent hover:text-accent"
            >
              <span aria-hidden className="text-lg leading-none">
                ✕
              </span>
            </button>
          </div>

          <nav className="flex flex-col px-3 py-2">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-4 text-base transition-colors ${
                    active ? "text-text" : "text-text-muted hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t border-border px-5 py-5">
            <Link
              href="/cart"
              className="inline-flex h-12 items-center justify-between rounded-md border border-border-strong px-4 text-sm text-text transition-colors hover:border-accent hover:text-accent"
            >
              <span>Cart</span>
              {count > 0 && (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-2 text-xs font-semibold text-bg">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-md bg-text text-sm font-medium text-bg transition-transform hover:scale-[1.01]"
            >
              Shop
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-md text-sm text-text-muted transition-colors hover:text-text"
            >
              Sign in
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
