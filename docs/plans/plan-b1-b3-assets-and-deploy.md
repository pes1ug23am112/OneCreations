# Plan B1 + B3 — Asset Pipeline & DigitalOcean Deploy Artifacts

Status: **not executed** — scaffold-only when run.

## Context

`web/public/assets/models/` currently ships `.glb` files from the Next.js static folder. That works for MVP but blows up Vercel's asset bundle once VFX reels (`.mp4`) land. Move heavy binaries to an object store (R2 preferred; Spaces is the DO-native fallback) and reference them by public URL in [web/lib/3d-products.ts](web/lib/3d-products.ts).

The API deploys to a DigitalOcean droplet ($200 Student Pack credit). This plan produces the PM2 + nginx + deploy artifacts so provisioning is a repeatable script, not tribal knowledge.

No external accounts are assumed at execution time — all URL references and systemd units use placeholders that you fill in on the droplet.

## Prerequisites before executing

- [ ] Cloudflare R2 bucket created, or DO Spaces bucket. Public read enabled (or CDN endpoint configured).
- [ ] Custom domain planned: `onecreations.in` (frontend) + `api.onecreations.in` (API).
- [ ] MongoDB Atlas reachable from the droplet IP (add to IP allowlist when the droplet boots).
- [ ] SSH key added to your DO account.

## Steps

### 1. Asset upload pipeline (local → bucket)

- Install `rclone` locally (`brew install rclone`) and configure a remote for R2 or Spaces.
- Write `scripts/upload-assets.sh` in the repo:
  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  REMOTE="${REMOTE:-r2:onecreations-assets}"
  rclone sync web/public/assets "$REMOTE" --progress --exclude ".DS_Store"
  ```
- Document in a new top-level `docs/assets.md`: the bucket name, CDN URL, and the expected folder layout (`models/`, `products/<id>/`, `vfx/`).

### 2. Make `assetPath` CDN-aware (code change)

- Add `NEXT_PUBLIC_ASSET_BASE_URL` to `web/.env.local.example` (empty default).
- Add a helper in `web/lib/assets.ts`:
  ```ts
  const BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "") ?? "";
  export function assetUrl(path: string): string {
    if (/^https?:\/\//.test(path)) return path;
    if (!BASE) return path; // dev fallback: /public served by Next
    return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  }
  ```
- Wherever a product's `assetPath` is consumed (currently unused in render, but the image gallery in `web/components/ProductGallery.tsx` uses `product.images` — apply `assetUrl()` there too). Same for VFX `src` in `web/app/vfx/page.tsx`.

### 3. DO droplet provisioning script

Create `deploy/droplet-bootstrap.sh` (runs once on a fresh Ubuntu 24.04 LTS droplet, as root):

```bash
#!/usr/bin/env bash
set -euo pipefail
apt-get update && apt-get upgrade -y
apt-get install -y curl git ufw nginx certbot python3-certbot-nginx build-essential

# Node 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# Create deploy user
id -u deploy &>/dev/null || useradd -m -s /bin/bash deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

### 4. PM2 ecosystem file

Create `api/ecosystem.config.cjs`:

```js
module.exports = {
  apps: [
    {
      name: "onecreations-api",
      script: "dist/index.js",
      cwd: "/home/deploy/oneCreations/api",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      max_memory_restart: "300M",
      error_file: "/home/deploy/logs/api.err.log",
      out_file: "/home/deploy/logs/api.out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
```

### 5. nginx reverse-proxy template

Create `deploy/nginx/api.onecreations.in.conf` (copied to `/etc/nginx/sites-available/` on the droplet):

```
server {
  listen 80;
  server_name api.onecreations.in;

  # certbot will rewrite this block to listen on 443 + auto-redirect

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }
}
```

After enabling: `ln -s /etc/nginx/sites-available/api.onecreations.in.conf /etc/nginx/sites-enabled/` → `nginx -t && systemctl reload nginx` → `certbot --nginx -d api.onecreations.in`.

### 6. Deploy script

Create `deploy/deploy.sh` (runs on droplet as `deploy` user):

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /home/deploy/oneCreations
git fetch --all
git reset --hard origin/main
cd api
npm ci --omit=dev=false
npm run build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
```

### 7. API trust-proxy (code change)

On the droplet, requests arrive through nginx — rate limiters need `req.ip` to reflect the client, not nginx. In [api/src/index.ts](api/src/index.ts), after `const app = express()` add:
```ts
app.set('trust proxy', 1);
```
This is safe because only nginx on the same host sets `X-Forwarded-For`.

### 8. Vercel frontend deploy

- Import the GitHub repo into Vercel; set **Root Directory** to `web`.
- Build command stays `next build`; framework preset auto-detected.
- Env vars (Production + Preview):
  - `NEXT_PUBLIC_API_URL=https://api.onecreations.in`
  - `NEXT_PUBLIC_ASSET_BASE_URL=https://<your-r2-or-spaces-cdn>`
- DNS (root registrar):
  - `onecreations.in` A → Vercel's anycast IPs (Vercel shows these in the dashboard)
  - `www` CNAME → `cname.vercel-dns.com`
  - `api` A → droplet IP

## Files created / modified

- `scripts/upload-assets.sh` (new)
- `docs/assets.md` (new)
- `web/lib/assets.ts` (new)
- `web/.env.local.example` (add `NEXT_PUBLIC_ASSET_BASE_URL`)
- `web/components/ProductGallery.tsx` (use `assetUrl`)
- `web/app/vfx/page.tsx` (use `assetUrl` for video srcs)
- `deploy/droplet-bootstrap.sh` (new)
- `deploy/deploy.sh` (new)
- `deploy/nginx/api.onecreations.in.conf` (new)
- `api/ecosystem.config.cjs` (new)
- `api/src/index.ts` (add `app.set('trust proxy', 1)`)

## Verification

1. `rclone ls r2:onecreations-assets models/` returns your `.glb` files.
2. `curl -I https://<cdn>/models/shibuya-rainscape.glb` → 200.
3. `npm run build` in `web/` succeeds with `NEXT_PUBLIC_ASSET_BASE_URL` set; image tags resolve to CDN URLs in the rendered HTML.
4. On droplet: `pm2 status` shows `onecreations-api` online, `curl https://api.onecreations.in/health` → `{"ok":true}`.
5. Rate limiter check: `curl` `/notify` 6 times from your laptop; 6th returns 429 with the **real** client IP in PM2 logs (confirms `trust proxy` is working).
6. Vercel preview build succeeds; opening the deployed site shows product images loading from the CDN (check network tab).
