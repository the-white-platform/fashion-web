#!/bin/bash

# Script to create and download Google Cloud Service Account key for GitHub Actions
# This service account will be used to trigger Cloud Build and deploy to Cloud Run

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
KEY_FILE="gcp-sa-key.json"

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
        "roles/artifactregistry.writer"      # Push images to Artifact Registry
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

create_key() {
    print_step "Creating and downloading service account key..."
    
    # Delete old key file if exists
    if [ -f "$KEY_FILE" ]; then
        print_warning "Old key file exists. Backing up to ${KEY_FILE}.backup"
        mv "$KEY_FILE" "${KEY_FILE}.backup"
    fi
    
    # Create new key
    gcloud iam service-accounts keys create "$KEY_FILE" \
        --iam-account="$SA_EMAIL" \
        --project="$PROJECT_ID"
    
    print_info "Key downloaded to: $KEY_FILE"
}

show_next_steps() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ Service Account Setup Complete!${NC}"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Add the key to GitHub Secrets:"
    echo "   - Go to: https://github.com/YOUR_REPO/settings/secrets/actions"
    echo "   - Click 'New repository secret'"
    echo "   - Name: GCP_SA_KEY"
    echo "   - Value: (paste the contents of $KEY_FILE)"
    echo ""
    echo "2. To get the key contents, run:"
    echo "   cat $KEY_FILE"
    echo ""
    echo "3. IMPORTANT: Keep this key file secure and DO NOT commit it to git!"
    echo "   The key file should be in .gitignore"
    echo ""
    echo "4. After adding to GitHub, you can delete the local key file:"
    echo "   rm $KEY_FILE"
    echo ""
    echo "Service Account Email: $SA_EMAIL"
    echo "Project: $PROJECT_ID"
    echo ""
}

main() {
    echo ""
    echo "=========================================="
    echo "  GCP Service Account Setup for GitHub Actions"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    set_project
    
    if ! check_service_account; then
        create_service_account
    fi
    
    grant_permissions
    create_key
    show_next_steps
    
    print_info "All done! 🎉"
}

# Run main function
main


