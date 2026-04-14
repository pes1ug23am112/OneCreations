"use client";

import dynamic from "next/dynamic";

export const NeuralNoiseClient = dynamic(
  () => import("./neural-noise").then((m) => m.NeuralNoise),
  { ssr: false }
);
