#!/bin/bash
# cPanel Node deploy — PHASE2-BACKEND.md §12
#
# Run from the application root on the server (after Node app env vars are set).
# NEVER deletes or touches ./uploads — that directory is persistent and outside
# the standalone build output.
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Pulling latest"
git pull

echo "==> Installing dependencies"
npm ci

echo "==> Building (standalone)"
npm run build

echo "==> Syncing static assets into standalone output"
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Passenger / CloudLinux Node apps reload when this file is touched.
if [ -d tmp ]; then
  touch tmp/restart.txt
elif [ -d ../tmp ]; then
  touch ../tmp/restart.txt
else
  mkdir -p tmp && touch tmp/restart.txt
fi

echo "Deployed. Uploads dir left untouched."
