// Content source for the /diecast brand wall.
//
// MVP asset workflow (no CMS yet):
//   1. Drop brand hero images into web/public/assets/diecast/
//   2. Point each entry's `assetPath` at that file (e.g. "/assets/diecast/hot-wheels.jpg")
//   3. Commit — Vercel will serve it statically.

export type DiecastBrand = {
  id: string;
  title: string;
  description: string;
  status: "coming-soon";
  accent: string;
  tags: string[];
  assetPath: string;
};

export const DIECAST_BRANDS: DiecastBrand[] = [
  {
    id: "hot-wheels",
    title: "Hot Wheels",
    description: "The mainline. Treasure hunts. Premium series.",
    status: "coming-soon",
    accent: "#d4d4d8",
    tags: ["hot-wheels", "mainline"],
    assetPath: "/assets/diecast/hot-wheels.jpg",
  },
  {
    id: "mini-gt",
    title: "Mini GT",
    description: "Detailed 1:64 from licensed European and JDM marques.",
    status: "coming-soon",
    accent: "#c7c7cc",
    tags: ["mini-gt", "licensed"],
    assetPath: "/assets/diecast/mini-gt.jpg",
  },
  {
    id: "pop-race",
    title: "Pop Race",
    description: "JDM-leaning 1:64 with strong race-livery game.",
    status: "coming-soon",
    accent: "#bcbcc2",
    tags: ["pop-race", "jdm"],
    assetPath: "/assets/diecast/pop-race.jpg",
  },
  {
    id: "inno-64",
    title: "Inno 64",
    description: "High-detail 1:64 — JDM legends and modern classics.",
    status: "coming-soon",
    accent: "#b0b0b6",
    tags: ["inno-64", "jdm"],
    assetPath: "/assets/diecast/inno-64.jpg",
  },
  {
    id: "tarmac-works",
    title: "Tarmac Works",
    description: "Race-spec 1:64 with collaboration energy.",
    status: "coming-soon",
    accent: "#a5a5ab",
    tags: ["tarmac-works", "race-spec"],
    assetPath: "/assets/diecast/tarmac-works.jpg",
  },
  {
    id: "tomica",
    title: "Tomica",
    description: "Japanese mainline, kei trucks, working features.",
    status: "coming-soon",
    accent: "#9a9aa0",
    tags: ["tomica", "japanese"],
    assetPath: "/assets/diecast/tomica.jpg",
  },
];
