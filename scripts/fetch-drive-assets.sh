#!/usr/bin/env bash
# fetch-drive-assets.sh — one-time download of lookbook + hi-res images from Google Drive.
# Reuses the shared dev-script helpers and the `gws` Google Workspace CLI (must be authenticated).
#
# Output:
#   src/endpoints/seed/lookbook/<product-slug>/<image-name>
#   src/endpoints/seed/hi-res/<image-name>
#
# Safe to re-run: skips files that already exist on disk.

source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

check_command gws
check_command jq

MANIFEST="$SCRIPT_DIR/drive-manifest.json"
LOOKBOOK_DIR="$PROJECT_ROOT/src/endpoints/seed/lookbook"
HIRES_DIR="$PROJECT_ROOT/src/endpoints/seed/hi-res"

[[ -f "$MANIFEST" ]] || { error "Manifest not found: $MANIFEST"; exit 1; }

if ! gws auth status 2>/dev/null | grep -q '"token_valid": true'; then
  error "gws is not authenticated. Run 'gws auth login' first."
  exit 1
fi

mkdir -p "$LOOKBOOK_DIR" "$HIRES_DIR"

# ── Lookbook products ────────────────────────────────────────────────────────
info "Downloading lookbook folders…"

product_count=$(jq '.products | length' "$MANIFEST")
for i in $(seq 0 $((product_count - 1))); do
  slug=$(jq -r ".products[$i].slug" "$MANIFEST")
  folder_id=$(jq -r ".products[$i].driveFolderId" "$MANIFEST")
  vi_name=$(jq -r ".products[$i].viName" "$MANIFEST")

  product_dir="$LOOKBOOK_DIR/$slug"
  mkdir -p "$product_dir"

  info "  [$((i + 1))/$product_count] $vi_name ($slug)"

  listing=$(gws drive files list \
    --params "{\"q\":\"'$folder_id' in parents and trashed=false\",\"fields\":\"files(id,name,mimeType)\",\"pageSize\":200}" \
    --format json 2>/dev/null) || { warn "    failed to list folder $folder_id"; continue; }

  file_count=$(echo "$listing" | jq '.files | length')
  if [[ "$file_count" -eq 0 ]]; then
    warn "    no files in folder"
    continue
  fi

  for j in $(seq 0 $((file_count - 1))); do
    file_id=$(echo "$listing" | jq -r ".files[$j].id")
    file_name=$(echo "$listing" | jq -r ".files[$j].name")
    mime=$(echo "$listing" | jq -r ".files[$j].mimeType")

    # Skip anything that's not an image
    case "$mime" in
      image/*) ;;
      *) info "    skipping non-image: $file_name ($mime)"; continue;;
    esac

    # Normalise file name (avoid spaces)
    safe_name=$(echo "$file_name" | tr ' ' '_' | tr -d "'\"")
    dest="$product_dir/$safe_name"

    if [[ -f "$dest" ]]; then
      info "    [skip] $safe_name (exists)"
      continue
    fi

    gws drive files get --params "{\"fileId\":\"$file_id\",\"alt\":\"media\"}" -o "$dest" >/dev/null 2>&1 \
      && success "    [ok]   $safe_name" \
      || warn "    [fail] $safe_name"
  done
done

# ── Hi-res product gallery (N1-N28.png from the shared "2D" Drive folder) ───
hires_folder_id=$(jq -r '.hiResFolderId // empty' "$MANIFEST")
if [[ -n "$hires_folder_id" ]]; then
  info "Downloading hi-res PDP gallery…"
  listing=$(gws drive files list \
    --params "{\"q\":\"'$hires_folder_id' in parents and trashed=false and mimeType='image/png'\",\"fields\":\"files(id,name)\",\"pageSize\":200}" \
    --format json 2>/dev/null) || { warn "  failed to list hi-res folder"; }
  if [[ -n "$listing" ]]; then
    count=$(echo "$listing" | jq '.files | length')
    for j in $(seq 0 $((count - 1))); do
      file_id=$(echo "$listing" | jq -r ".files[$j].id")
      file_name=$(echo "$listing" | jq -r ".files[$j].name")
      safe_name=$(echo "$file_name" | tr ' ' '_' | tr -d "'\"")
      dest="$HIRES_DIR/$safe_name"
      if [[ -f "$dest" ]]; then
        info "  [skip] $safe_name (exists)"
        continue
      fi
      gws drive files get --params "{\"fileId\":\"$file_id\",\"alt\":\"media\"}" -o "$dest" >/dev/null 2>&1 \
        && success "  [ok]   $safe_name" \
        || warn "  [fail] $safe_name"
    done
  fi
fi

success "Drive asset download complete."
echo
info "Summary:"
echo "  lookbook:    $(find "$LOOKBOOK_DIR" -type f 2>/dev/null | wc -l | tr -d ' ') files in $(find "$LOOKBOOK_DIR" -maxdepth 1 -type d 2>/dev/null | tail -n +2 | wc -l | tr -d ' ') product folders"
echo "  hi-res:      $(find "$HIRES_DIR" -type f 2>/dev/null | wc -l | tr -d ' ') files"
