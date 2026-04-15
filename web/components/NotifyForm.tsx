"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email("Enter a valid email."),
});

type FormValues = z.infer<typeof FormSchema>;

const API = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";

type Props = {
  productId?: string;
  productName?: string;
  variant?: "inline" | "stacked";
};

export function NotifyForm({ productId, productName, variant = "inline" }: Props) {
  const [status, setStatus] = useState<"idle" | "success" | "error" | "config">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema) });

  async function onSubmit(values: FormValues) {
    if (!API) {
      setStatus("config");
      return;
    }

    try {
      const res = await fetch(`${API}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          productId: productId ?? null,
          source: "web",
        }),
      });
      if (!res.ok) throw new Error("bad response");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  const message =
    errors.email?.message ??
    (status === "success"
      ? productName
        ? `You're on the list for ${productName}.`
        : "You're on the list."
      : status === "config"
        ? "Waitlist is temporarily unavailable — NEXT_PUBLIC_API_URL is not set."
      : status === "error"
        ? "Couldn't reach the server. Try again."
        : null);

  if (variant === "stacked") {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3" noValidate>
        <input
          type="email"
          placeholder="you@somewhere.com"
          autoComplete="email"
          {...register("email")}
          className="w-full rounded-md border border-white/5 bg-[#141415] px-4 py-3 text-base text-white/90 outline-none transition-colors placeholder:text-white/30 focus:border-accent"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-white px-4 py-3 text-sm font-medium tracking-tight text-bg transition-colors hover:bg-white/90 disabled:opacity-60"
        >
          {isSubmitting ? "Sending…" : productName ? `Notify me when ${productName} is live` : "Notify me"}
        </button>
        {message && (
          <span
            className={`text-xs ${
              status === "error" ? "text-red-400" : "text-white/50"
            }`}
          >
            {message}
          </span>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full max-w-md flex-col gap-2" noValidate>
      <div className="flex items-stretch gap-2 rounded-md border border-white/5 bg-[#141415] p-1">
        <input
          type="email"
          placeholder="you@somewhere.com"
          autoComplete="email"
          {...register("email")}
          className="flex-1 bg-transparent px-3 py-2 text-base text-white/90 outline-none placeholder:text-white/30"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent-soft disabled:opacity-60"
        >
          {isSubmitting ? "Sending" : "Notify me"}
        </button>
      </div>
      {message && (
        <span className={`text-xs ${status === "error" ? "text-red-400" : "text-white/50"}`}>
          {message}
        </span>
      )}
    </form>
  );
}
