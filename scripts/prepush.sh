#!/bin/bash
set -e

echo "🔍 Checking for missing dependencies..."
yarn check --verify-tree || { 
  echo "❌ Missing deps — installing now..."
  yarn install
}

echo "🔄 Rebasing onto origin/main..."
git fetch origin
git rebase origin/main

echo "🧪 Running frontend build sanity check..."
yarn build || { 
  echo "❌ Build failed — fix before pushing."
  exit 1
}

echo "✅ All good — ready to push!"
