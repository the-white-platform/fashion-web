#!/bin/bash

# GCP Deployment Script for Fashion Web
# This script helps deploy the application to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="fashion-web"
MEMORY="2Gi"
CPU="2"
MIN_INSTANCES="1"
MAX_INSTANCES="10"

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        echo "Visit: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    print_info "Prerequisites check passed ✓"
}

set_project() {
    if [ -z "$PROJECT_ID" ]; then
        print_warning "GCP_PROJECT_ID not set. Please enter your GCP Project ID:"
        read -r PROJECT_ID
    fi
    
    print_info "Setting GCP project to: $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"
}

build_and_push() {
    print_info "Building Docker image..."
    
    # Get commit SHA or use 'local'
    COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
    IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:$COMMIT_SHA"
    IMAGE_LATEST="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"
    
    # Build image
    docker build \
        -t "$IMAGE_TAG" \
        -t "$IMAGE_LATEST" \
        .
    
    print_info "Pushing Docker image to GCR..."
    
    # Configure Docker for GCR
    gcloud auth configure-docker --quiet
    
    # Push images
    docker push "$IMAGE_TAG"
    docker push "$IMAGE_LATEST"
    
    print_info "Image pushed successfully ✓"
}

deploy_to_cloud_run() {
    print_info "Deploying to Cloud Run..."
    
    COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
    IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:$COMMIT_SHA"
    
    # Get NEXT_PUBLIC_SERVER_URL from user or use default
    if [ -z "$NEXT_PUBLIC_SERVER_URL" ]; then
        print_warning "NEXT_PUBLIC_SERVER_URL not set. Using placeholder."
        NEXT_PUBLIC_SERVER_URL="https://$SERVICE_NAME-XXXXXX.run.app"
    fi
    
    gcloud run deploy "$SERVICE_NAME" \
        --image "$IMAGE_TAG" \
        --region "$REGION" \
        --platform managed \
        --allow-unauthenticated \
        --port 3000 \
        --memory "$MEMORY" \
        --cpu "$CPU" \
        --min-instances "$MIN_INSTANCES" \
        --max-instances "$MAX_INSTANCES" \
        --set-env-vars "NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1,NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL" \
        --set-secrets "DATABASE_URI=DATABASE_URI:latest,PAYLOAD_SECRET=PAYLOAD_SECRET:latest"
    
    print_info "Deployment successful ✓"
}

get_service_url() {
    print_info "Getting service URL..."
    
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
        --region "$REGION" \
        --format 'value(status.url)')
    
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🚀 Deployment Complete!${NC}"
    echo "=========================================="
    echo "Service URL: $SERVICE_URL"
    echo "Region: $REGION"
    echo "=========================================="
    echo ""
    
    print_info "You can view logs with:"
    echo "  gcloud run services logs tail $SERVICE_NAME --region $REGION"
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --project PROJECT_ID    GCP Project ID"
    echo "  -r, --region REGION          GCP Region (default: us-central1)"
    echo "  -h, --help                   Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  GCP_PROJECT_ID               GCP Project ID"
    echo "  GCP_REGION                   GCP Region"
    echo "  NEXT_PUBLIC_SERVER_URL       Public server URL"
    echo ""
    echo "Example:"
    echo "  $0 -p my-project -r us-central1"
    echo "  GCP_PROJECT_ID=my-project $0"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project)
            PROJECT_ID="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo ""
    echo "=========================================="
    echo "  Fashion Web - GCP Deployment Script"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    set_project
    build_and_push
    deploy_to_cloud_run
    get_service_url
    
    print_info "All done! 🎉"
}

# Run main function
main
