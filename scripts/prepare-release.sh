#!/bin/bash

set -e

current_branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")

if [ "$current_branch" = "main" ]; then
  echo "⚠️  Run this on a feature branch before creating PR"
  exit 1
fi

if ! git diff-index --quiet HEAD --; then
  echo "⚠️  Commit or stash uncommitted changes first"
  exit 1
fi

last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -z "$last_tag" ]; then
  pnpm run release:first
else
  pnpm run release -- --skip.changelog=false --skip.commit=true --skip.tag=true
fi

git add package.json pnpm-lock.yaml CHANGELOG.md 2>/dev/null || true

NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ Version bumped to $NEW_VERSION"
echo "📝 Files staged. Commit and create PR."

