# Image Promotion Pattern - Infrastructure Setup

## Overview

We're using the **Promotion Pattern** to copy Docker images from dev to prod. This requires specific IAM permissions to be configured in the infrastructure repository.

## Required Permissions

For the image promotion to work, the **prod service account** (`github-actions-deployer@the-white-prod-481217.iam.gserviceaccount.com`) needs:

1. **Read access to dev Artifact Registry** - to read the source image
2. **Write access to prod Artifact Registry** - to write the copied image

## Infrastructure Changes Needed

### Option 1: Grant Cross-Project Permissions (Recommended)

Add to your infrastructure Terraform configuration:

```hcl
# In terraform/environments/prod/main.tf or similar

# Grant prod service account read access to dev Artifact Registry
resource "google_artifact_registry_repository_iam_member" "prod_read_dev_images" {
  project    = "the-white-dev-481217"  # Dev project
  location   = "asia-southeast1"
  repository = "app-images"
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:github-actions-deployer@the-white-prod-481217.iam.gserviceaccount.com"
}

# Grant prod service account write access to prod Artifact Registry
resource "google_artifact_registry_repository_iam_member" "prod_write_prod_images" {
  project    = "the-white-prod-481217"  # Prod project
  location   = "asia-southeast1"
  repository = "app-images"
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:github-actions-deployer@the-white-prod-481217.iam.gserviceaccount.com"
}
```

### Option 2: Project-Level IAM (Alternative)

If you prefer project-level permissions:

```hcl
# Grant read access to dev project
resource "google_project_iam_member" "prod_read_dev_artifacts" {
  project = "the-white-dev-481217"
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:github-actions-deployer@the-white-prod-481217.iam.gserviceaccount.com"
}

# Grant write access to prod project
resource "google_project_iam_member" "prod_write_prod_artifacts" {
  project = "the-white-prod-481217"
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:github-actions-deployer@the-white-prod-481217.iam.gserviceaccount.com"
}
```

## Current Workflow Behavior

The workflow currently:
1. Authenticates to **dev** first (to read the image)
2. Copies image from dev → prod (requires both read and write permissions)
3. Authenticates to **prod** (to deploy)

## Verification

After applying the Terraform changes, verify permissions:

```bash
# Check if prod SA can read dev registry
gcloud artifacts docker images list \
  --repository=app-images \
  --location=asia-southeast1 \
  --project=the-white-dev-481217 \
  --impersonate-service-account=github-actions-deployer@the-white-prod-481217.iam.gserviceaccount.com

# Check if prod SA can write to prod registry
gcloud artifacts docker images describe \
  asia-southeast1-docker.pkg.dev/the-white-prod-481217/app-images/fashion-web:latest \
  --project=the-white-prod-481217 \
  --impersonate-service-account=github-actions-deployer@the-white-prod-481217.iam.gserviceaccount.com
```

## Notes

- The repository-level permissions (Option 1) are more secure and recommended
- The workflow uses `gcloud artifacts docker images copy` which handles cross-project copying
- Both dev and prod registries must exist (already configured in bootstrap/main.tf)

