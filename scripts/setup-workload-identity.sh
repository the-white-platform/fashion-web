#!/bin/bash

# Script to set up Workload Identity Federation for GitHub Actions
# This is the recommended (and more secure) way to authenticate GitHub Actions with GCP
# It doesn't require service account keys

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
SA_NAME="github-actions-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-actions-provider"
GITHUB_REPO="${GITHUB_REPO:-}" # Format: owner/repo-name

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

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed."
        echo "Install it from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    print_info "Prerequisites check passed ✓"
}

set_project() {
    if [ -z "$PROJECT_ID" ]; then
        print_warning "GCP_PROJECT_ID not set. Please enter your GCP Project ID:"
        echo "Available projects:"
        gcloud projects list --format="table(projectId,name)"
        echo ""
        read -r PROJECT_ID
    fi
    
    print_info "Setting GCP project to: $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"
    
    # Update SA email with project ID
    SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
}

get_github_repo() {
    if [ -z "$GITHUB_REPO" ]; then
        print_warning "GITHUB_REPO not set. Please enter your GitHub repository (format: owner/repo-name):"
        echo "Example: kanetran29/fashion-web"
        read -r GITHUB_REPO
    fi
    
    print_info "GitHub repository: $GITHUB_REPO"
}

check_service_account() {
    print_step "Checking if service account exists..."
    
    if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
        print_info "Service account already exists: $SA_EMAIL"
        return 0
    else
        print_warning "Service account does not exist. Will create it."
        return 1
    fi
}

create_service_account() {
    print_step "Creating service account: $SA_NAME"
    
    gcloud iam service-accounts create "$SA_NAME" \
        --display-name="GitHub Actions Deployer" \
        --description="Service account for GitHub Actions to trigger Cloud Build and deploy to Cloud Run" \
        --project="$PROJECT_ID"
    
    print_info "Service account created: $SA_EMAIL"
}

grant_permissions() {
    print_step "Granting necessary permissions..."
    
    # Required roles for the workflow
    ROLES=(
        "roles/cloudbuild.builds.editor"      # Trigger Cloud Build
        "roles/run.admin"                     # Deploy to Cloud Run
        "roles/iam.serviceAccountUser"        # Use service accounts
        "roles/secretmanager.secretAccessor"  # Access secrets
        "roles/storage.admin"                 # Access Artifact Registry
        "roles/artifactregistry.writer"       # Push images to Artifact Registry
    )
    
    for ROLE in "${ROLES[@]}"; do
        print_info "Granting $ROLE..."
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:$SA_EMAIL" \
            --role="$ROLE" \
            --condition=None \
            --quiet || print_warning "Failed to grant $ROLE (may already be granted)"
    done
    
    print_info "Permissions granted ✓"
}

create_workload_identity_pool() {
    print_step "Creating Workload Identity Pool..."
    
    if gcloud iam workload-identity-pools describe "$POOL_NAME" \
        --location="global" \
        --project="$PROJECT_ID" &>/dev/null; then
        print_info "Workload Identity Pool already exists: $POOL_NAME"
    else
        gcloud iam workload-identity-pools create "$POOL_NAME" \
            --project="$PROJECT_ID" \
            --location="global" \
            --display-name="GitHub Actions Pool"
        print_info "Workload Identity Pool created: $POOL_NAME"
    fi
}

create_workload_identity_provider() {
    print_step "Creating Workload Identity Provider..."
    
    if gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
        --workload-identity-pool="$POOL_NAME" \
        --location="global" \
        --project="$PROJECT_ID" &>/dev/null; then
        print_info "Workload Identity Provider already exists: $PROVIDER_NAME"
    else
        gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
            --project="$PROJECT_ID" \
            --location="global" \
            --workload-identity-pool="$POOL_NAME" \
            --display-name="GitHub Actions Provider" \
            --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
            --attribute-condition="assertion.repository == \"$GITHUB_REPO\"" \
            --issuer-uri="https://token.actions.githubusercontent.com"
        print_info "Workload Identity Provider created: $PROVIDER_NAME"
    fi
}

get_pool_id() {
    POOL_ID=$(gcloud iam workload-identity-pools describe "$POOL_NAME" \
        --location="global" \
        --project="$PROJECT_ID" \
        --format="value(name)")
    echo "$POOL_ID"
}

allow_github_to_impersonate() {
    print_step "Allowing GitHub Actions to impersonate service account..."
    
    POOL_ID=$(get_pool_id)
    PROVIDER_ID="$POOL_ID/providers/$PROVIDER_NAME"
    
    # Allow GitHub Actions from the specific repository to impersonate the service account
    gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
        --project="$PROJECT_ID" \
        --role="roles/iam.workloadIdentityUser" \
        --member="principalSet://iam.googleapis.com/$POOL_ID/attribute.repository/$GITHUB_REPO" \
        --quiet || print_warning "Policy binding may already exist"
    
    print_info "GitHub Actions can now impersonate: $SA_EMAIL"
}

show_next_steps() {
    POOL_ID=$(get_pool_id)
    PROVIDER_ID="$POOL_ID/providers/$PROVIDER_NAME"
    
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ Workload Identity Federation Setup Complete!${NC}"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Update your GitHub Actions workflow to use Workload Identity:"
    echo ""
    echo "   Replace the 'Authenticate to Google Cloud' step in .github/workflows/deploy.yml:"
    echo ""
    echo "   - name: Authenticate to Google Cloud"
    echo "     uses: google-github-actions/auth@v2"
    echo "     with:"
    echo "       workload_identity_provider: '$PROVIDER_ID'"
    echo "       service_account: '$SA_EMAIL'"
    echo ""
    echo "2. The workflow will now authenticate without needing a service account key!"
    echo ""
    echo "Service Account: $SA_EMAIL"
    echo "Workload Identity Pool: $POOL_ID"
    echo "Provider: $PROVIDER_ID"
    echo "GitHub Repository: $GITHUB_REPO"
    echo ""
    echo "Note: This setup is more secure than using service account keys."
    echo ""
}

main() {
    echo ""
    echo "=========================================="
    echo "  GCP Workload Identity Federation Setup"
    echo "  for GitHub Actions"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    set_project
    get_github_repo
    
    if ! check_service_account; then
        create_service_account
    fi
    
    grant_permissions
    create_workload_identity_pool
    create_workload_identity_provider
    allow_github_to_impersonate
    show_next_steps
    
    print_info "All done! 🎉"
}

# Run main function
main

