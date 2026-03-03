#!/usr/bin/env bash
# db-reset.sh — wipe the database and optionally re-seed
# Usage: bash scripts/db-reset.sh [--force] [--seed]

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

# ── Parse flags ───────────────────────────────────────────────────────

FORCE=false
SEED=false
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
    --seed)  SEED=true ;;
    *) warn "Unknown flag: $arg" ;;
  esac
done

# ── 1. Confirm unless --force ────────────────────────────────────────

if [ "$FORCE" = false ]; then
  echo -n "⚠  This will wipe all database data. Continue? (y/N) "
  read -r answer
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    info "Aborted."
    exit 0
  fi
fi

# ── 2. Tear down and recreate ────────────────────────────────────────

info "Stopping containers and removing volumes..."
docker compose -f "$PROJECT_ROOT/docker-compose.yml" down -v

info "Starting PostgreSQL..."
docker compose -f "$PROJECT_ROOT/docker-compose.yml" up -d postgres
wait_for_postgres 60

# ── 3. Seed (optional) ───────────────────────────────────────────────

if [ "$SEED" = true ]; then
  info "Seeding database with demo data..."
  seed_database
fi

# ── Done ──────────────────────────────────────────────────────────────

echo ""
success "Database reset complete! 🎉"
if [ "$SEED" = true ]; then
  success "Demo data has been seeded."
fi
echo ""
info "Next steps:"
echo "  pnpm dev    — start the dev server"
echo ""

