#!/bin/bash
set -euo pipefail

# Prevent multiple runs in the same push
if [ "${PREPUSH_ALREADY_RUN:-}" = "1" ]; then
  exit 0
fi
export PREPUSH_ALREADY_RUN=1

echo "🔍 Pre-push sanity checks for TX frontend..."

# 1. Skip if no frontend changes
if git diff --cached --quiet -- 'frontend/**'; then
  echo "No frontend-related changes detected — skipping build."
  exit 0
fi

# 2. Install deps exactly as lockfile specifies
yarn install --frozen-lockfile

# 3. Type check
yarn tsc --noEmit

# 4. Lint
yarn lint

# 5. Build test (dry-run first, fallback to full build)
yarn build --dry-run || yarn build

echo "✅ Guardrail checks passed."
