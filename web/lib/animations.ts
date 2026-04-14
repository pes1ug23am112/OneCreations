// Content source for the /vfx reel.
//
// MVP asset workflow (no CMS yet):
//   1. Drop .mp4 exports into web/public/assets/videos/
//   2. Point each entry's `assetPath` at that file (e.g. "/assets/videos/scale-shift.mp4")
//   3. Commit — Vercel will serve it statically.

export type AnimationClip = {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: "published" | "coming-soon";
  tags: string[];
  poster?: string;
  gradient: [string, string];
  assetPath: string;
};

export const ANIMATIONS: AnimationClip[] = [
  {
    id: "scale-shift-pop-race",
    title: "Scale Shift — Pop Race",
    description:
      "1:64 to full-size SLK transition built around a Pop Race casting.",
    duration: "0:24",
    status: "coming-soon",
    tags: ["scale-shift", "pop-race"],
    gradient: ["#161618", "#2a2a2e"],
    assetPath: "/assets/videos/scale-shift-pop-race.mp4",
  },
  {
    id: "diorama-build-up",
    title: "Diorama Build-up",
    description:
      "3D-printed diorama assembling itself around a parked Mini GT.",
    duration: "0:18",
    status: "coming-soon",
    tags: ["diorama", "mini-gt"],
    gradient: ["#141418", "#262629"],
    assetPath: "/assets/videos/diorama-build-up.mp4",
  },
  {
    id: "pit-lane-flythrough",
    title: "Pit Lane Flythrough",
    description:
      "Camera weaves through the Suzuka pit garage at 1:64 scale.",
    duration: "0:32",
    status: "coming-soon",
    tags: ["flythrough", "pit-lane"],
    gradient: ["#18181c", "#2c2c31"],
    assetPath: "/assets/videos/pit-lane-flythrough.mp4",
  },
  {
    id: "neon-rainscape",
    title: "Neon Rainscape",
    description:
      "Animated puddle reflections and signage flicker on the Shibuya base.",
    duration: "0:21",
    status: "coming-soon",
    tags: ["shibuya", "neon"],
    gradient: ["#151518", "#292930"],
    assetPath: "/assets/videos/neon-rainscape.mp4",
  },
];
