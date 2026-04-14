export type Brand = {
  slug: string;
  name: string;
  blurb: string;
  accent: string;
  status: "coming-soon";
};

export const BRANDS: Brand[] = [
  {
    slug: "hot-wheels",
    name: "Hot Wheels",
    blurb: "The mainline. Treasure hunts. Premium series.",
    accent: "#ff5a1f",
    status: "coming-soon",
  },
  {
    slug: "mini-gt",
    name: "Mini GT",
    blurb: "Detailed 1:64 from licensed European and JDM marques.",
    accent: "#3a78ff",
    status: "coming-soon",
  },
  {
    slug: "pop-race",
    name: "Pop Race",
    blurb: "JDM-leaning 1:64 with strong race-livery game.",
    accent: "#ffcc33",
    status: "coming-soon",
  },
  {
    slug: "inno-64",
    name: "Inno 64",
    blurb: "High-detail 1:64 — JDM legends and modern classics.",
    accent: "#e83a5c",
    status: "coming-soon",
  },
  {
    slug: "tarmac-works",
    name: "Tarmac Works",
    blurb: "Race-spec 1:64 with collaboration energy.",
    accent: "#22d3a8",
    status: "coming-soon",
  },
  {
    slug: "tomica",
    name: "Tomica",
    blurb: "Japanese mainline, kei trucks, working features.",
    accent: "#1f8cff",
    status: "coming-soon",
  },
];
