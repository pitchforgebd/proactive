#!/bin/bash
# cPanel Node deploy — PHASE2-BACKEND.md §12
#
# Run from the application root (Node virtualenv active).
# NEVER deletes uploads. Low-memory defaults for CloudLinux LVE.
set -euo pipefail

cd "$(dirname "$0")"

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
export RAYON_NUM_THREADS="${RAYON_NUM_THREADS:-1}"
export UV_THREADPOOL_SIZE="${UV_THREADPOOL_SIZE:-1}"

echo "==> Pulling latest"
git pull

echo "==> Installing dependencies (devDeps needed for next build)"
NODE_ENV=development npm install --include=dev --no-audit --no-fund

echo "==> Building (standalone; next.config experimental.cpus=1)"
npm run build

echo "==> Syncing static assets into standalone output"
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -r public .next/standalone/public

if [ -d tmp ]; then
  touch tmp/restart.txt
elif [ -d ../tmp ]; then
  touch ../tmp/restart.txt
else
  mkdir -p tmp && touch tmp/restart.txt
fi

echo "Deployed. Uploads dir left untouched."
