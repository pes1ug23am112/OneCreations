"use client";

// Dynamic wrapper around ModelViewer. next/dynamic with ssr: false keeps
// three.js out of the server bundle and out of the initial client payload
// until a consumer actually mounts it.

import dynamic from "next/dynamic";

export const ModelViewerLazy = dynamic(
  () => import("./ModelViewer").then((m) => m.default),
  { ssr: false, loading: () => null }
);
