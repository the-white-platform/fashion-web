#!/usr/bin/env bash
# _lib.sh — shared helpers for dev scripts
# Source this file: source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Color / emoji helpers ──────────────────────────────────────────────

_supports_color() { [[ -t 1 ]] && command -v tput &>/dev/null && [[ $(tput colors 2>/dev/null || echo 0) -ge 8 ]]; }

if _supports_color; then
  _RESET="\033[0m"; _BLUE="\033[0;34m"; _GREEN="\033[0;32m"; _YELLOW="\033[0;33m"; _RED="\033[0;31m"
else
  _RESET=""; _BLUE=""; _GREEN=""; _YELLOW=""; _RED=""
fi

info()    { echo -e "${_BLUE}ℹ${_RESET}  $*"; }
success() { echo -e "${_GREEN}✔${_RESET}  $*"; }
warn()    { echo -e "${_YELLOW}⚠${_RESET}  $*" >&2; }
error()   { echo -e "${_RED}✖${_RESET}  $*" >&2; }

# ── Dependency checks ─────────────────────────────────────────────────

check_command() {
  local cmd="$1"
  if ! command -v "$cmd" &>/dev/null; then
    error "'$cmd' is not installed. Please install it and try again."
    exit 1
  fi
}

# ── Wait for PostgreSQL ───────────────────────────────────────────────

wait_for_postgres() {
  local timeout="${1:-60}"
  local elapsed=0
  info "Waiting for PostgreSQL to be ready (timeout: ${timeout}s)..."
  while [ "$elapsed" -lt "$timeout" ]; do
    if docker compose -f "$PROJECT_ROOT/docker-compose.yml" ps --format '{{.Health}}' postgres 2>/dev/null | grep -qi "healthy"; then
      success "PostgreSQL is ready."
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  error "PostgreSQL did not become healthy within ${timeout}s."
  exit 1
}

# ── Wait for URL ──────────────────────────────────────────────────────

wait_for_url() {
  local url="$1"
  local timeout="${2:-120}"
  local elapsed=0
  info "Waiting for $url to respond (timeout: ${timeout}s)..."
  while [ "$elapsed" -lt "$timeout" ]; do
    if curl -sf --max-time 2 "$url" >/dev/null 2>&1; then
      success "$url is responding."
      return 0
    fi
    sleep 3
    elapsed=$((elapsed + 3))
  done
  error "$url did not respond within ${timeout}s."
  return 1
}

# ── Seed database ─────────────────────────────────────────────────────

seed_database() {
  local dev_pid=""

  _cleanup_dev_server() {
    if [ -n "$dev_pid" ] && kill -0 "$dev_pid" 2>/dev/null; then
      info "Stopping background dev server (PID $dev_pid)..."
      kill "$dev_pid" 2>/dev/null || true
      wait "$dev_pid" 2>/dev/null || true
    fi
  }
  trap _cleanup_dev_server EXIT

  info "Starting dev server in background for seeding..."
  cd "$PROJECT_ROOT"
  pnpm dev &>/dev/null &
  dev_pid=$!

  if ! wait_for_url "http://localhost:3200" 120; then
    error "Dev server failed to start. Cannot seed."
    exit 1
  fi

  info "Seeding database via /api/seed..."
  local http_code
  http_code=$(curl -sf -o /dev/null -w '%{http_code}' --max-time 120 "http://localhost:3200/api/seed")

  if [ "$http_code" = "200" ]; then
    success "Database seeded successfully."
  else
    error "Seeding failed with HTTP $http_code."
    _cleanup_dev_server
    exit 1
  fi

  _cleanup_dev_server
  trap - EXIT
  dev_pid=""
}

