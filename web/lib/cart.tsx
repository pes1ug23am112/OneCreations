"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PRODUCTS_3D, type Product3D } from "@/lib/3d-products";

const STORAGE_KEY = "oc.cart.v1";
const MAX_QTY = 10;

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartLine = CartItem & {
  product: Product3D;
  lineTotal: number;
};

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function isAvailable(p: Product3D | undefined): p is Product3D {
  return !!p && p.status === "available" && typeof p.priceValue === "number";
}

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is CartItem =>
          x && typeof x.productId === "string" && typeof x.quantity === "number",
      )
      .map((x) => ({
        productId: x.productId,
        quantity: Math.max(1, Math.min(MAX_QTY, Math.floor(x.quantity))),
      }));
  } catch {
    return [];
  }
}

// Module-level store so useSyncExternalStore can hand out a stable snapshot
// without synchronous setState inside an effect.
const EMPTY: CartItem[] = [];
let current: CartItem[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  current = readStorage();
  hydrated = true;
}

function persist(next: CartItem[]) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full / disabled — cart becomes session-only, not fatal.
  }
  notify();
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  // Trigger once so consumers see the hydrated snapshot on mount.
  cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    current = readStorage();
    notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CartItem[] {
  return current;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = items !== EMPTY || hydrated;

  const add = useCallback((productId: string, quantity = 1) => {
    const product = PRODUCTS_3D.find((p) => p.id === productId);
    if (!isAvailable(product)) return;
    const existing = current.find((i) => i.productId === productId);
    if (existing) {
      persist(
        current.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) }
            : i,
        ),
      );
    } else {
      persist([
        ...current,
        { productId, quantity: Math.min(MAX_QTY, Math.max(1, quantity)) },
      ]);
    }
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.floor(quantity);
    if (q <= 0) {
      persist(current.filter((i) => i.productId !== productId));
      return;
    }
    persist(
      current.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(MAX_QTY, q) } : i,
      ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    persist(current.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => persist([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = items.flatMap((i) => {
      const product = PRODUCTS_3D.find((p) => p.id === i.productId);
      if (!isAvailable(product)) return [];
      return [
        {
          ...i,
          product,
          lineTotal: (product.priceValue ?? 0) * i.quantity,
        },
      ];
    });
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
    return { items, lines, count, subtotal, add, setQuantity, remove, clear, ready };
  }, [items, add, setQuantity, remove, clear, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
