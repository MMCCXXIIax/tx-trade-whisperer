#!/bin/bash
set -e

# --- CONFIG ---
FRONTEND_PATH="." # adjust if your frontend is in a subfolder
FRONTEND_FILE_PATTERNS="src/ package.json yarn.lock vite.config.ts tailwind.config.js"

echo "🚦 Pre-push sanity checks for TX frontend..."

# 1. Ensure we're in a Git repo with package.json
if [ ! -f "$FRONTEND_PATH/package.json" ]; then
  echo "⚠️  No package.json found in $FRONTEND_PATH — skipping frontend checks."
  exit 0
fi

# 2. Check if staged changes touch frontend files
if ! git diff --cached --name-only | grep -E "$FRONTEND_FILE_PATTERNS" >/dev/null; then
  echo "ℹ️  No frontend-related changes detected — skipping build."
  exit 0
fi

# 3. Dependency check
echo "🔍 Checking for missing dependencies..."
if ! yarn check --verify-tree >/dev/null 2>&1; then
  echo "❌ Missing deps — installing now..."
  yarn install --frozen-lockfile
fi

# 4. Rebase onto latest main
echo "🔄 Rebasing onto origin/main..."
git fetch origin
git rebase origin/main

# 5. Build sanity check
echo "🧪 Running frontend build..."
if ! yarn build; then
  echo "❌ Build failed — fix before pushing."
  exit 1
fi

echo "✅ All good — ready to push!"
