#!/usr/bin/env bash
# setup.sh — bootstrap a fresh clone for local development
# Usage: bash scripts/setup.sh [--seed]

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

# ── Parse flags ───────────────────────────────────────────────────────

SEED=false
for arg in "$@"; do
  case "$arg" in
    --seed) SEED=true ;;
    *) warn "Unknown flag: $arg" ;;
  esac
done

# ── 1. Check prerequisites ───────────────────────────────────────────

info "Checking prerequisites..."
check_command docker
check_command pnpm
success "All prerequisites found."

# ── 2. Create .env if missing ────────────────────────────────────────

if [ ! -f "$PROJECT_ROOT/.env" ]; then
  info "Creating .env from .env.example..."
  cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"

  # Generate a real PAYLOAD_SECRET
  if command -v openssl &>/dev/null; then
    secret=$(openssl rand -hex 32)
  else
    secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  fi

  # Replace placeholder secret (macOS + Linux compatible sed)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|PAYLOAD_SECRET=YOUR_SECRET_HERE|PAYLOAD_SECRET=$secret|" "$PROJECT_ROOT/.env"
  else
    sed -i "s|PAYLOAD_SECRET=YOUR_SECRET_HERE|PAYLOAD_SECRET=$secret|" "$PROJECT_ROOT/.env"
  fi

  # Append PAYLOAD_PUSH_SCHEMA if not already present
  if ! grep -q "^PAYLOAD_PUSH_SCHEMA=" "$PROJECT_ROOT/.env"; then
    echo "" >> "$PROJECT_ROOT/.env"
    echo "# Auto-push schema changes in dev (set to false to use migrations)" >> "$PROJECT_ROOT/.env"
    echo "PAYLOAD_PUSH_SCHEMA=true" >> "$PROJECT_ROOT/.env"
  fi

  success ".env created with generated PAYLOAD_SECRET."
else
  success ".env already exists — skipping."
fi

# ── 3. Start PostgreSQL ──────────────────────────────────────────────

info "Starting PostgreSQL via Docker Compose..."
docker compose -f "$PROJECT_ROOT/docker-compose.yml" up -d postgres
wait_for_postgres 60

# ── 4. Install dependencies ──────────────────────────────────────────

info "Installing dependencies..."
cd "$PROJECT_ROOT"
pnpm install
success "Dependencies installed."

# ── 5. Seed (optional) ───────────────────────────────────────────────

if [ "$SEED" = true ]; then
  info "Seeding database with demo data (categories, products, homepage, etc.)..."
  seed_database
fi

# ── Done ──────────────────────────────────────────────────────────────

echo ""
success "Setup complete! 🎉"
echo ""
info "Next steps:"
echo "  pnpm dev          — start the dev server"
if [ "$SEED" = false ]; then
  echo "  pnpm setup --seed — re-run with demo data (products, categories, etc.)"
fi
echo ""

