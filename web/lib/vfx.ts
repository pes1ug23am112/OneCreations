export type VfxClip = {
  slug: string;
  title: string;
  blurb: string;
  duration: string;
  src?: string;
  poster?: string;
  gradient: [string, string];
};

export const VFX: VfxClip[] = [
  {
    slug: "scale-shift-pop-race",
    title: "Scale Shift — Pop Race",
    blurb: "1:64 to full-size SLK transition built around a Pop Race casting.",
    duration: "0:24",
    gradient: ["#1a0a2a", "#e07a4a"],
  },
  {
    slug: "diorama-build-up",
    title: "Diorama Build-up",
    blurb: "3D-printed diorama assembling itself around a parked Mini GT.",
    duration: "0:18",
    gradient: ["#0a1a2a", "#3a78ff"],
  },
  {
    slug: "pit-lane-flythrough",
    title: "Pit Lane Flythrough",
    blurb: "Camera weaves through the Suzuka pit garage at 1:64 scale.",
    duration: "0:32",
    gradient: ["#2a1a0a", "#ffcc33"],
  },
  {
    slug: "neon-rainscape",
    title: "Neon Rainscape",
    blurb: "Animated puddle reflections and signage flicker on the Shibuya base.",
    duration: "0:21",
    gradient: ["#1a0a30", "#e83a5c"],
  },
];
