// Canonical product lookup on the api side. Clients cannot be trusted for
// prices — every checkout computes total from this table. Duplicates the web
// catalog at web/lib/3d-products.ts; migrate to a shared package if it grows.

export type ProductStatus = 'available' | 'preorder' | 'coming-soon';

export type ProductPricing = {
  name: string;
  unitPrice: number; // paise (INR minor units)
  status: ProductStatus;
};

export const PRODUCTS: Record<string, ProductPricing> = {
  'rooftop-bangalore': {
    name: 'Rooftop — Bangalore',
    unitPrice: 380_000,
    status: 'available',
  },
  'display-stand-trio': {
    name: 'Five-Tier Display Stand',
    unitPrice: 40_000,
    status: 'available',
  },
  'kei-garage': {
    name: 'Kei Garage — Nishinomiya',
    unitPrice: 420_000,
    status: 'preorder',
  },
  // coming-soon pieces (shibuya-rainscape, pit-lane-suzuka, canyon-pullout)
  // are intentionally absent — /orders returns 400 for them.
};

export function productName(id: string | null | undefined): string | undefined {
  if (!id) return undefined;
  return PRODUCTS[id]?.name;
}
