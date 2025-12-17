#!/bin/bash

# Test script to verify WIF configuration
# This simulates what GitHub Actions would send

set -e

echo "🔍 Testing WIF Configuration"
echo "============================"
echo ""

# Configuration
DEV_PROJECT="the-white-dev-481217"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-actions-provider"
REPO="the-white-platform/fashion-web"
REPO_OWNER="the-white-platform"

echo "Repository: $REPO"
echo "Repository Owner: $REPO_OWNER"
echo ""

# Check provider condition
echo "📋 Checking Provider Condition..."
PROVIDER_CONDITION=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
  --workload-identity-pool="$POOL_NAME" \
  --location="global" \
  --project="$DEV_PROJECT" \
  --format="value(attributeCondition)" 2>/dev/null || echo "")

echo "Current condition: $PROVIDER_CONDITION"
echo ""

# Check if condition would match
echo "📋 Testing Condition Logic..."
if [[ "$PROVIDER_CONDITION" == *"assertion.repository == '$REPO'"* ]] || [[ "$PROVIDER_CONDITION" == *"assertion.repository_owner == '$REPO_OWNER'"* ]]; then
  echo "✅ Condition should match repository: $REPO"
else
  echo "❌ Condition may not match repository: $REPO"
fi
echo ""

# Check IAM binding
echo "📋 Checking IAM Binding..."
IAM_BINDING=$(gcloud iam service-accounts get-iam-policy github-actions-deployer@${DEV_PROJECT}.iam.gserviceaccount.com \
  --project="$DEV_PROJECT" \
  --format="json" 2>/dev/null | jq -r '.bindings[] | select(.role == "roles/iam.workloadIdentityUser") | .members[]' | grep "github-actions-pool" | head -1)

echo "IAM Binding: $IAM_BINDING"
echo ""

# Extract expected attribute from binding
if [[ "$IAM_BINDING" == *"/attribute.repository/$REPO"* ]]; then
  echo "✅ IAM binding expects: attribute.repository = $REPO"
  echo ""
  echo "📋 Attribute Mapping Check..."
  ATTRIBUTE_MAPPING=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
    --workload-identity-pool="$POOL_NAME" \
    --location="global" \
    --project="$DEV_PROJECT" \
    --format="json" 2>/dev/null | jq -r '.attributeMapping."attribute.repository"')
  
  echo "Attribute mapping: attribute.repository = $ATTRIBUTE_MAPPING"
  
  if [[ "$ATTRIBUTE_MAPPING" == "assertion.repository" ]]; then
    echo "✅ Mapping is correct: assertion.repository -> attribute.repository"
    echo ""
    echo "Flow check:"
    echo "  1. GitHub sends: assertion.repository = '$REPO'"
    echo "  2. Provider condition: $PROVIDER_CONDITION"
    echo "  3. Attribute mapping: attribute.repository = assertion.repository = '$REPO'"
    echo "  4. IAM binding checks: attribute.repository = '$REPO'"
    echo ""
    echo "✅ Configuration looks correct!"
  else
    echo "❌ Mapping mismatch!"
  fi
else
  echo "❌ IAM binding doesn't match expected repository"
fi

echo ""
echo "============================"
echo "Note: This only checks configuration, not actual authentication."
echo "To fully test, you need to run this from GitHub Actions."
