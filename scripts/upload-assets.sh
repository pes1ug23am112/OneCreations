#!/usr/bin/env bash
# Sync web/public/assets to the configured object store (R2 or Spaces).
#
# Usage:
#   REMOTE=r2:onecreations-assets ./scripts/upload-assets.sh
#   REMOTE=spaces:onecreations-assets ./scripts/upload-assets.sh
#
# Prereqs:
#   brew install rclone
#   rclone config   # create the "r2" or "spaces" remote
set -euo pipefail

REMOTE="${REMOTE:-r2:onecreations-assets}"
SRC="$(cd "$(dirname "$0")/.." && pwd)/web/public/assets"

if [[ ! -d "$SRC" ]]; then
  echo "error: $SRC does not exist" >&2
  exit 1
fi

echo "Syncing $SRC → $REMOTE"
rclone sync "$SRC" "$REMOTE" \
  --progress \
  --exclude ".DS_Store" \
  --exclude "*.tmp" \
  --transfers 4 \
  --checkers 8
