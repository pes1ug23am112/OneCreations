#!/usr/bin/env bash
# Run on the droplet as the `deploy` user from /home/deploy/oneCreations.
#   ssh deploy@<ip>
#   cd /home/deploy/oneCreations && bash deploy/deploy.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "[deploy] pulling latest main"
git fetch --all --prune
git reset --hard origin/main

echo "[deploy] installing api deps"
cd "$REPO_ROOT/api"
npm ci

echo "[deploy] building api"
npm run build

echo "[deploy] (re)starting pm2 process"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "[deploy] health check"
sleep 1
curl -fsS http://127.0.0.1:4000/health && echo
echo "[deploy] done"
