OneCreations — MVP asset drop zone
==================================

No CMS yet. To "upload" an asset for the site, drop the file into the
right subfolder and point the matching `assetPath` entry at it in the
data file under web/lib/.

  assets/models/    → .glb files referenced from web/lib/3d-products.ts
                      (Draco-compress before committing: <2MB, <60k tris)

  assets/diecast/   → brand hero images (.jpg/.webp/.png)
                      referenced from web/lib/diecast.ts

  assets/videos/    → .mp4 clips referenced from web/lib/animations.ts
                      and the VFX page hero scrub (hero.mp4)

  assets/audio/     → ambient.mp3 for the VFX page BGM toggle

Everything in /public is served as a static file at the same path with
`/` in place of `public/`.
