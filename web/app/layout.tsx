import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ScrollRevealInit } from "@/components/ScrollRevealInit";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OneCreations — 3D prints, VFX, diecast",
  description:
    "OneCreations designs and prints custom 3D pieces for collectors. Shop products, see the VFX work, and follow the diecast drops.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="min-h-dvh bg-bg text-text">
        <Header />
        <ScrollRevealInit />
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
