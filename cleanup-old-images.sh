#!/bin/bash
# Script to delete old Docker images from GCP Artifact Registry
# Keeps only the latest 10 images by version tag

set -e

REGION="asia-southeast1"
DEV_PROJECT="the-white-dev-481217"
PROD_PROJECT="the-white-prod-481217"
REPO="app-images"
IMAGE="fashion-web"

echo "🧹 Cleaning up old images from Artifact Registry..."

# Function to cleanup images in a project
cleanup_project() {
  local PROJECT=$1
  local ENV=$2
  
  echo ""
  echo "📦 Cleaning $ENV project: $PROJECT"
  
  # List all images with version tags (excluding 'latest' and SHA tags)
  echo "   Listing images..."
  IMAGES=$(gcloud artifacts docker images list \
    "$REGION-docker.pkg.dev/$PROJECT/$REPO/$IMAGE" \
    --project="$PROJECT" \
    --format="value(package,version)" \
    --filter="version~^[0-9]+\.[0-9]+\.[0-9]+$" \
    --sort-by="~create_time" \
    2>/dev/null || echo "")
  
  if [ -z "$IMAGES" ]; then
    echo "   ✅ No version-tagged images found"
    return
  fi
  
  # Count total images
  TOTAL=$(echo "$IMAGES" | wc -l | tr -d ' ')
  echo "   Found $TOTAL version-tagged images"
  
  if [ "$TOTAL" -le 10 ]; then
    echo "   ✅ Only $TOTAL images found, keeping all"
    return
  fi
  
  # Get images to delete (skip first 10)
  TO_DELETE=$(echo "$IMAGES" | tail -n +11)
  DELETE_COUNT=$(echo "$TO_DELETE" | wc -l | tr -d ' ')
  
  echo "   🗑️  Deleting $DELETE_COUNT old images (keeping latest 10)..."
  
  # Delete each old image
  while IFS= read -r line; do
    if [ -n "$line" ]; then
      IMAGE_PATH=$(echo "$line" | awk '{print $1}')
      VERSION=$(echo "$line" | awk '{print $2}')
      echo "      Deleting: $IMAGE_PATH:$VERSION"
      gcloud artifacts docker images delete \
        "$IMAGE_PATH:$VERSION" \
        --project="$PROJECT" \
        --quiet \
        2>/dev/null || echo "         ⚠️  Failed to delete (may not exist)"
    fi
  done <<< "$TO_DELETE"
  
  echo "   ✅ Cleanup complete for $ENV"
}

# Cleanup dev project
cleanup_project "$DEV_PROJECT" "dev"

# Cleanup prod project
cleanup_project "$PROD_PROJECT" "prod"

echo ""
echo "✅ All cleanup operations completed!"
