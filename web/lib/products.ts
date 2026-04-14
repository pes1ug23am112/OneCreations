export type Product = {
  slug: string;
  name: string;
  scale: string;
  tagline: string;
  description: string;
  status: "available" | "preorder" | "coming-soon";
  price?: string;
  gradient: [string, string, string];
  tags: string[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "shibuya-rainscape",
    name: "Shibuya Rainscape",
    scale: "1:64 diorama",
    tagline: "Neon-soaked alley for your JDM hero car.",
    description:
      "A compact 80mm × 120mm diorama base — wet asphalt, vending machines, kanji signage, hand-painted puddle reflections. Designed to frame any 1:64 diecast you already own.",
    status: "coming-soon",
    gradient: ["#1a1230", "#3b1d4a", "#e07a4a"],
    tags: ["Diorama", "Wet asphalt", "Neon"],
  },
  {
    slug: "pit-lane-suzuka",
    name: "Pit Lane — Suzuka",
    scale: "1:64 diorama",
    tagline: "Race-day pit garage with movable signage.",
    description:
      "Pit garage with sliding shutter, tire stack, fuel rig, and a magnetic sign panel so you can swap team colors. Printed in matte ASA, painted by hand.",
    status: "coming-soon",
    gradient: ["#0e1a2a", "#1c3550", "#e07a4a"],
    tags: ["Pit lane", "Modular", "Magnetic"],
  },
  {
    slug: "kei-garage",
    name: "Kei Garage — Nishinomiya",
    scale: "1:64 diorama",
    tagline: "Tight Japanese garage with rolltop door.",
    description:
      "Suburban Japanese single-car garage with rolltop, working hinged door, micro-tools on the wall, and a flickering LED option. Sized for kei cars and small coupes.",
    status: "preorder",
    price: "₹4,200",
    gradient: ["#1a1a1a", "#2a2a2a", "#e07a4a"],
    tags: ["Garage", "LED option", "Kei-sized"],
  },
  {
    slug: "rooftop-bangalore",
    name: "Rooftop — Bangalore",
    scale: "1:64 diorama",
    tagline: "Local skyline as a backdrop for your build.",
    description:
      "Hand-detailed rooftop scene — water tanks, satellite dishes, the city's signature concrete texture. A love letter to the place every OneCreations piece is printed in.",
    status: "available",
    price: "₹3,800",
    gradient: ["#2a1a0a", "#4a2a1a", "#e07a4a"],
    tags: ["Skyline", "Hand-detailed", "Bangalore"],
  },
  {
    slug: "canyon-pullout",
    name: "Canyon Pullout — PCH",
    scale: "1:64 diorama",
    tagline: "Coastal pullout, gravel and a guardrail.",
    description:
      "A wide, low diorama base — Pacific Coast Highway pullout with weathered guardrail, scattered gravel, and a sun-bleached signpost. Looks expensive next to a 911.",
    status: "coming-soon",
    gradient: ["#1a2a2a", "#2a4a4a", "#e07a4a"],
    tags: ["Coastal", "Wide-base", "Weathered"],
  },
  {
    slug: "display-stand-trio",
    name: "Display Stand — Trio",
    scale: "1:64 stand",
    tagline: "Three-tier acrylic-and-print display.",
    description:
      "A trio display stand for your shelf — 3D-printed risers with a thin acrylic top per tier. Fits any combination of three 1:64 cards or loose models.",
    status: "available",
    price: "₹1,900",
    gradient: ["#1a1a26", "#2a2a3a", "#e07a4a"],
    tags: ["Stand", "Acrylic", "Trio"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
