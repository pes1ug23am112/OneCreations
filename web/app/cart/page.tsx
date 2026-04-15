"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart, type CartLine } from "@/lib/cart";

const API = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";

const CheckoutSchema = z.object({
  email: z.string().email("Enter a valid email."),
});
type CheckoutValues = z.infer<typeof CheckoutSchema>;

type CreateOrderResponse = {
  ok: true;
  orderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
};

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { email?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayCtor = new (options: RazorpayOptions) => { open: () => void };

declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function CartPage() {
  const { lines, count, subtotal, setQuantity, remove, clear, ready } = useCart();
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "creating" | "opening" | "verifying" | "error" | "config"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutValues>({ resolver: zodResolver(CheckoutSchema) });

  async function onCheckout(values: CheckoutValues) {
    if (!API) {
      setStatus("config");
      return;
    }
    if (lines.length === 0) return;

    setStatus("creating");
    setErrorMsg(null);

    let order: CreateOrderResponse;
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
        }),
      });
      if (!res.ok) throw new Error(`http ${res.status}`);
      order = (await res.json()) as CreateOrderResponse;
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't start checkout. Try again.");
      return;
    }

    if (!window.Razorpay) {
      setStatus("error");
      setErrorMsg("Checkout not loaded. Refresh and retry.");
      return;
    }

    setStatus("opening");
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "OneCreations",
      description: `${count} item${count === 1 ? "" : "s"}`,
      order_id: order.orderId,
      prefill: { email: values.email },
      theme: { color: "#000000" },
      modal: {
        ondismiss: () => {
          setStatus("idle");
        },
      },
      handler: async (response) => {
        setStatus("verifying");
        try {
          const verifyRes = await fetch(`${API}/orders/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (!verifyRes.ok) throw new Error("verify failed");
          clear();
          router.push(`/cart/success?order=${encodeURIComponent(response.razorpay_order_id)}`);
        } catch {
          setStatus("error");
          setErrorMsg(
            "Payment captured, but verification failed. You'll get a confirmation email once settled.",
          );
        }
      },
    });
    rzp.open();
  }

  if (!ready) {
    return (
      <main className="relative pt-32 pb-24">
        <section className="mx-auto max-w-3xl px-6">
          <div className="h-32 animate-pulse rounded-xl border border-white/5 bg-[#141415]" />
        </section>
      </main>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <main className="relative pt-32 pb-24">
        <section className="mx-auto max-w-3xl px-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            ← Keep browsing
          </Link>

          <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tighter md:text-6xl">
            Cart
          </h1>

          {lines.length === 0 ? (
            <div className="mt-10 rounded-xl border border-white/5 bg-[#141415] p-10 text-center">
              <p className="text-white/60">Your cart is empty.</p>
              <Link
                href="/products"
                className="mt-6 inline-flex rounded-md bg-text px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.02]"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <>
              <ul className="mt-10 flex flex-col gap-4">
                {lines.map((line) => (
                  <CartRow
                    key={line.productId}
                    line={line}
                    onQty={(q) => setQuantity(line.productId, q)}
                    onRemove={() => remove(line.productId)}
                  />
                ))}
              </ul>

              <div className="mt-10 rounded-xl border border-white/5 bg-[#141415] p-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-sm text-white/60">Subtotal</span>
                  <span className="font-serif text-2xl">{formatInr(subtotal)}</span>
                </div>
                <p className="mt-3 text-xs text-white/40">
                  Taxes and shipping calculated at Razorpay checkout. Server recomputes totals
                  from a canonical price table.
                </p>

                <form
                  onSubmit={handleSubmit(onCheckout)}
                  className="mt-6 flex flex-col gap-3"
                  noValidate
                >
                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-white/50">
                    Contact email
                    <input
                      type="email"
                      placeholder="you@somewhere.com"
                      autoComplete="email"
                      {...register("email")}
                      className="w-full rounded-md border border-white/5 bg-bg px-4 py-3 text-base text-white/90 normal-case tracking-normal outline-none transition-colors placeholder:text-white/30 focus:border-accent"
                    />
                  </label>
                  {errors.email?.message && (
                    <span className="text-xs text-red-400">{errors.email.message}</span>
                  )}
                  <button
                    type="submit"
                    disabled={status === "creating" || status === "verifying" || status === "opening"}
                    className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.01] disabled:opacity-60"
                  >
                    {status === "creating"
                      ? "Starting checkout…"
                      : status === "opening"
                        ? "Opening payment…"
                        : status === "verifying"
                          ? "Verifying payment…"
                          : `Pay ${formatInr(subtotal)}`}
                  </button>
                  {status === "config" && (
                    <span className="text-xs text-red-400">
                      Checkout unavailable — NEXT_PUBLIC_API_URL is not set.
                    </span>
                  )}
                  {status === "error" && errorMsg && (
                    <span className="text-xs text-red-400">{errorMsg}</span>
                  )}
                </form>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}

function CartRow({
  line,
  onQty,
  onRemove,
}: {
  line: CartLine;
  onQty: (q: number) => void;
  onRemove: () => void;
}) {
  const { product, quantity, lineTotal } = line;
  return (
    <li className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#141415] p-4">
      <div
        className="h-20 w-20 flex-shrink-0 rounded-md"
        style={{
          background: `linear-gradient(135deg, ${product.gradient[0]}, ${product.gradient[1]})`,
        }}
      />
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${product.id}`}
          className="font-serif text-lg leading-tight hover:text-accent"
        >
          {product.title}
        </Link>
        <div className="text-xs text-white/50">{product.tagline}</div>
        <div className="mt-2 flex items-center gap-3">
          <label className="text-xs text-white/50">
            Qty
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) => onQty(Number(e.target.value))}
              className="ml-2 h-11 w-16 rounded-md border border-white/10 bg-bg px-2 text-center text-sm text-white/90 outline-none focus:border-accent"
            />
          </label>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-white/50 underline-offset-4 hover:text-white hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="text-right">
        <div className="font-serif text-lg">₹{(lineTotal / 100).toLocaleString("en-IN")}</div>
      </div>
    </li>
  );
}
