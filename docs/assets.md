# Assets

Heavy binary assets (`.glb`, `.mp4`) live in an object store, not in the Next.js static bundle. The frontend picks them up via `NEXT_PUBLIC_ASSET_BASE_URL` through the [assetUrl](../web/lib/assets.ts) helper.

## Bucket layout

```
onecreations-assets/
├── models/                         # .glb diorama files (Draco-compressed, <2MB, <60k tris)
│   ├── shibuya-rainscape.glb
│   ├── pit-lane-suzuka.glb
│   └── …
├── products/                       # reference photos per product (hero first)
│   ├── shibuya-rainscape/
│   │   ├── 01-hero.jpg
│   │   └── 02-detail.jpg
│   └── …
└── videos/                         # VFX reels, .mp4 h264
    ├── Hero.mp4
    └── scale-shift-pop-race.mp4
```

Paths in [web/lib/3d-products.ts](../web/lib/3d-products.ts) and [web/lib/animations.ts](../web/lib/animations.ts) stay relative (`/assets/models/foo.glb`). At runtime, `assetUrl()` prefixes them with the CDN base URL (or leaves them alone in dev so `next dev` serves from `web/public/`).

## Provider choice

- **Cloudflare R2** — preferred. Zero egress fees, generous free tier (10GB storage + 10M class-A ops/month). Needs the repo's `.do/app.yaml` untouched — R2 is an external CDN, not a DO resource.
- **DigitalOcean Spaces** — burns the $200 Student Pack credit ($5/mo for 250GB). Use if you want one vendor.

## First-time setup

### R2 (recommended)

1. Create a bucket in the Cloudflare dashboard → R2.
2. Enable "public access" via a custom domain (e.g. `cdn.onecreations.in`) or the built-in `<accountId>.r2.dev` URL.
3. Create an API token with read/write on the bucket.
4. Configure rclone:
   ```
   rclone config
   # type: s3
   # provider: Cloudflare
   # access_key_id + secret: from the token above
   # endpoint: https://<accountId>.r2.cloudflarestorage.com
   # name the remote: r2
   ```

### Spaces

1. Create a Space in DO dashboard → `onecreations-assets`.
2. Enable CDN, note the edge URL.
3. Generate Spaces API key + secret (Settings → Spaces keys).
4. `rclone config` with `provider: DigitalOcean`, endpoint e.g. `blr1.digitaloceanspaces.com`.

## Uploading

```
REMOTE=r2:onecreations-assets ./scripts/upload-assets.sh
```

The script mirrors `web/public/assets/` → bucket root, skipping `.DS_Store`. It's idempotent — only changed files transfer.

## Env wiring

- Production (Vercel): `NEXT_PUBLIC_ASSET_BASE_URL=https://cdn.onecreations.in`
- Preview / dev: leave empty; Next serves from `public/` locally.

## Model compression (reminder)

Every `.glb` must be Draco-compressed **before** upload — target under 2MB, under 60k triangles. Use `gltfpack` or Blender's Draco export. A 40MB raw export will kill first-paint times even with a CDN.

```
npx -y gltfpack -i in.glb -o out.glb -cc -tc
```
