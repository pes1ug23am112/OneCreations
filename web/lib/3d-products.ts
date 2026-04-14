// Content source for the /products catalog and per-product pages.
//
// MVP asset workflow (no CMS yet):
//   1. Drop your .glb models into web/public/assets/models/
//   2. Point each entry's `assetPath` at that file (e.g. "/assets/models/shibuya.glb")
//   3. Commit — Vercel will serve it statically.

export type Product3D = {
  id: string;
  title: string;
  scale: string;
  tagline: string;
  description: string;
  status: "available" | "preorder" | "coming-soon";
  price?: string;
  gradient: [string, string, string];
  tags: string[];
  assetPath: string;
};

export const PRODUCTS_3D: Product3D[] = [
  {
    id: "shibuya-rainscape",
    title: "Shibuya Rainscape",
    scale: "1:64 diorama",
    tagline: "Neon-soaked alley for your JDM hero car.",
    description:
      "A compact 80mm × 120mm diorama base — wet asphalt, vending machines, kanji signage, hand-painted puddle reflections. Designed to frame any 1:64 diecast you already own.",
    status: "coming-soon",
    gradient: ["#1a1a1d", "#2a2a2e", "#9a9aa2"],
    tags: ["diorama", "wet-asphalt", "neon"],
    assetPath: "/assets/models/shibuya-rainscape.glb",
  },
  {
    id: "pit-lane-suzuka",
    title: "Pit Lane — Suzuka",
    scale: "1:64 diorama",
    tagline: "Race-day pit garage with movable signage.",
    description:
      "Pit garage with sliding shutter, tire stack, fuel rig, and a magnetic sign panel so you can swap team colors. Printed in matte ASA, painted by hand.",
    status: "coming-soon",
    gradient: ["#17171a", "#262629", "#8e8e96"],
    tags: ["pit-lane", "modular", "magnetic"],
    assetPath: "/assets/models/pit-lane-suzuka.glb",
  },
  {
    id: "kei-garage",
    title: "Kei Garage — Nishinomiya",
    scale: "1:64 diorama",
    tagline: "Tight Japanese garage with rolltop door.",
    description:
      "Suburban Japanese single-car garage with rolltop, working hinged door, micro-tools on the wall, and a flickering LED option. Sized for kei cars and small coupes.",
    status: "preorder",
    price: "₹4,200",
    gradient: ["#141418", "#232327", "#7f7f88"],
    tags: ["garage", "led-option", "kei-sized"],
    assetPath: "/assets/models/kei-garage.glb",
  },
  {
    id: "rooftop-bangalore",
    title: "Rooftop — Bangalore",
    scale: "1:64 diorama",
    tagline: "Local skyline as a backdrop for your build.",
    description:
      "Hand-detailed rooftop scene — water tanks, satellite dishes, the city's signature concrete texture. A love letter to the place every OneCreations piece is printed in.",
    status: "available",
    price: "₹3,800",
    gradient: ["#1a1a1e", "#2c2c31", "#9c9ca5"],
    tags: ["skyline", "hand-detailed", "bangalore"],
    assetPath: "/assets/models/rooftop-bangalore.glb",
  },
  {
    id: "canyon-pullout",
    title: "Canyon Pullout — PCH",
    scale: "1:64 diorama",
    tagline: "Coastal pullout, gravel and a guardrail.",
    description:
      "A wide, low diorama base — Pacific Coast Highway pullout with weathered guardrail, scattered gravel, and a sun-bleached signpost. Looks expensive next to a 911.",
    status: "coming-soon",
    gradient: ["#161619", "#252529", "#8a8a93"],
    tags: ["coastal", "wide-base", "weathered"],
    assetPath: "/assets/models/canyon-pullout.glb",
  },
  {
    id: "display-stand-trio",
    title: "Display Stand — Trio",
    scale: "1:64 stand",
    tagline: "Three-tier acrylic-and-print display.",
    description:
      "A trio display stand for your shelf — 3D-printed risers with a thin acrylic top per tier. Fits any combination of three 1:64 cards or loose models.",
    status: "available",
    price: "₹1,900",
    gradient: ["#18181c", "#28282d", "#93939c"],
    tags: ["stand", "acrylic", "trio"],
    assetPath: "/assets/models/display-stand-trio.glb",
  },
];

export function getProduct(id: string): Product3D | undefined {
  return PRODUCTS_3D.find((p) => p.id === id);
}
