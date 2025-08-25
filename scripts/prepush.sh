#!/bin/sh
bash scripts/prepush.sh
set -e

FRONTEND_PATH="." # repo root — your frontend lives here
FRONTEND_FILE_PATTERNS="src/ package.json yarn.lock vite.config.ts tailwind.config.ts"

echo "🚦 Pre-push sanity checks for TX frontend..."

# 1. Ensure we're in a Git repo with package.json
if [ ! -f "$FRONTEND_PATH/package.json" ]; then
  echo "⚠️  No package.json found in $FRONTEND_PATH — skipping frontend checks."
  exit 0
fi

# 2. Detect current branch and upstream
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
UPSTREAM_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>/dev/null || true)

if [ -z "$UPSTREAM_BRANCH" ]; then
  echo "⚠️  No upstream branch set for '$CURRENT_BRANCH'."
  echo "    Set it with: git push --set-upstream origin $CURRENT_BRANCH"
  exit 1
fi

# 3. Check if staged changes touch frontend files
if ! git diff --cached --name-only | grep -E "$FRONTEND_FILE_PATTERNS" >/dev/null; then
  echo "ℹ️  No frontend-related changes detected — skipping build."
  exit 0
fi

# 4. Ensure local branch is up to date with upstream
echo "🔍 Checking if '$CURRENT_BRANCH' is up to date with '$UPSTREAM_BRANCH'..."
git fetch origin
if [ "$(git rev-parse HEAD)" != "$(git merge-base HEAD "$UPSTREAM_BRANCH")" ]; then
  echo "❌ Your branch '$CURRENT_BRANCH' is behind '$UPSTREAM_BRANCH'."
  echo "   Please pull/rebase manually before pushing."
  exit 1
fi

# 5. Dependency check
echo "🔍 Checking for missing dependencies..."
if ! yarn check --verify-tree >/dev/null 2>&1; then
  echo "❌ Missing deps — installing now..."
  yarn install --frozen-lockfile
fi

# 6. Build sanity check
echo "🧪 Running frontend build..."
if ! yarn build; then
  echo "❌ Build failed — fix before pushing."
  exit 1
fi

echo "✅ All good — ready to push!"
