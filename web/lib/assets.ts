const BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "") ?? "";

export function assetUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  if (!BASE) return path;
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
