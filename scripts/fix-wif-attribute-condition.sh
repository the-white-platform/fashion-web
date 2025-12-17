#!/bin/bash

# Script to fix WIF attribute condition for fashion-web
# This updates the WIF provider to allow all repositories under the-white-platform organization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Configuration
DEV_PROJECT="the-white-dev-481217"
PROD_PROJECT="the-white-prod-481217"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-actions-provider"
REPO_OWNER="the-white-platform"

# The correct attribute condition that allows all repos under the-white-platform
# Note: CEL requires single quotes for string literals, not double quotes
ATTRIBUTE_CONDITION="assertion.repository == '${REPO_OWNER}/fashion-web'"

update_wif_provider() {
    local PROJECT_ID=$1
    local ENV_NAME=$2
    
    print_step "Updating WIF provider for ${ENV_NAME} (${PROJECT_ID})..."
    
    # Check if provider exists
    if ! gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
        --workload-identity-pool="$POOL_NAME" \
        --location="global" \
        --project="$PROJECT_ID" &>/dev/null; then
        print_error "WIF provider not found: ${PROVIDER_NAME}"
        print_info "You may need to run the setup script first: scripts/setup-github-actions.sh"
        return 1
    fi
    
    # Get current condition
    CURRENT_CONDITION=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
        --workload-identity-pool="$POOL_NAME" \
        --location="global" \
        --project="$PROJECT_ID" \
        --format="value(oidc.attributeCondition)" 2>/dev/null || echo "")
    
    print_info "Current attribute condition: ${CURRENT_CONDITION:-'(none)'}"
    print_info "New attribute condition: ${ATTRIBUTE_CONDITION}"
    
    if [ "$CURRENT_CONDITION" = "$ATTRIBUTE_CONDITION" ]; then
        print_info "Attribute condition is already correct. No update needed."
        return 0
    fi
    
    # Update the provider
    print_info "Updating WIF provider..."
    gcloud iam workload-identity-pools providers update-oidc "$PROVIDER_NAME" \
        --project="$PROJECT_ID" \
        --location="global" \
        --workload-identity-pool="$POOL_NAME" \
        --attribute-condition="$ATTRIBUTE_CONDITION" \
        --quiet
    
    print_info "✅ WIF provider updated successfully for ${ENV_NAME}"
    
    # Verify the update
    UPDATED_CONDITION=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
        --workload-identity-pool="$POOL_NAME" \
        --location="global" \
        --project="$PROJECT_ID" \
        --format="value(oidc.attributeCondition)" 2>/dev/null || echo "")
    
    if [ "$UPDATED_CONDITION" = "$ATTRIBUTE_CONDITION" ]; then
        print_info "✅ Verification passed: Attribute condition updated correctly"
    else
        print_warning "⚠️  Verification failed: Expected '${ATTRIBUTE_CONDITION}', got '${UPDATED_CONDITION}'"
    fi
}

main() {
    echo ""
    echo "=========================================="
    echo "  Fix WIF Attribute Condition"
    echo "  for fashion-web"
    echo "=========================================="
    echo ""
    echo "This script updates the WIF provider's attribute condition"
    echo "to allow all repositories under '${REPO_OWNER}' organization."
    echo ""
    echo "This fixes the error:"
    echo "  'The given credential is rejected by the attribute condition'"
    echo ""
    
    # Check prerequisites
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed."
        echo "Install it from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    # Update dev
    print_info "Updating DEV environment..."
    if ! update_wif_provider "$DEV_PROJECT" "DEV"; then
        print_error "Failed to update DEV WIF provider"
        exit 1
    fi
    
    echo ""
    
    # Update prod
    print_info "Updating PROD environment..."
    if ! update_wif_provider "$PROD_PROJECT" "PROD"; then
        print_error "Failed to update PROD WIF provider"
        exit 1
    fi
    
    echo ""
    echo "=========================================="
    print_info "✅ All WIF providers updated successfully!"
    echo "=========================================="
    echo ""
    print_info "The attribute condition now allows all repositories under '${REPO_OWNER}'"
    print_info "This should fix the authentication error in GitHub Actions."
    echo ""
    print_info "Next steps:"
    echo "  1. Re-run the failed GitHub Actions workflow"
    echo "  2. The authentication should now succeed"
    echo ""
}

# Run main function
main
