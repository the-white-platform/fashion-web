# Cloud Build Trigger Configuration: Cancel Previous Builds

## Problem

When multiple commits are pushed in quick succession, Cloud Build queues multiple builds. By the time a build starts running (after waiting in queue), previous builds have already finished or are already running, making it impossible to cancel them from within the build itself.

## Solution

There are three ways to handle build cancellation, depending on how builds are triggered:

1. **For automatic Cloud Build triggers** (on push/tag): Configure `cancel_in_progress` in Terraform or manually
2. **For manual deployments via GitHub Actions**: Already handled in `.github/workflows/deploy.yml` ✅
3. **Quick fix**: Update triggers manually via gcloud CLI or Cloud Console

## Configuration Options

### Option 1: Using Terraform (Recommended for Automatic Triggers)

If your Cloud Build triggers are managed via Terraform in the infrastructure repo, add the `cancel_in_progress` field to your trigger resources. This is the **best solution** for automatic triggers that run on push/tag.

If your Cloud Build triggers are managed via Terraform in the infrastructure repo, add the `cancel_in_progress` field to your trigger resources:

```hcl
resource "google_cloudbuild_trigger" "dev_trigger" {
  name        = "fashion-web-dev-trigger"
  description = "Trigger for dev environment on push to main"
  project     = var.dev_project_id
  location    = var.region

  github {
    owner = "the-white-platform"
    name  = "fashion-web"
    push {
      branch = "^main$"
    }
  }

  filename = "cloudbuild.yaml"
  
  # ⭐ Add this to cancel previous builds
  cancel_in_progress = true

  substitutions = {
    _NEXT_PUBLIC_SERVER_URL = "https://fashion-web-dev-XXXXXX.run.app"
  }
}

resource "google_cloudbuild_trigger" "prod_trigger" {
  name        = "fashion-web-prod-trigger"
  description = "Trigger for prod environment on tag creation"
  project     = var.prod_project_id
  location    = var.region

  github {
    owner = "the-white-platform"
    name  = "fashion-web"
    push {
      tag = "^v[0-9]+\\.[0-9]+\\.[0-9]+$"
    }
  }

  filename = "cloudbuild.yaml"
  
  # ⭐ Add this to cancel previous builds
  cancel_in_progress = true

  substitutions = {
    _NEXT_PUBLIC_SERVER_URL = "https://fashion-web-XXXXXX.run.app"
  }
}
```

After adding this, run:
```bash
terraform plan
terraform apply
```

### Option 2: Using gcloud CLI (Quick Manual Fix)

If you need to update existing triggers manually without modifying Terraform:

```bash
# For dev trigger
gcloud builds triggers update <TRIGGER_ID> \
  --region=asia-southeast1 \
  --project=the-white-dev-481217 \
  --cancel-in-progress

# For prod trigger
gcloud builds triggers update <TRIGGER_ID> \
  --region=asia-southeast1 \
  --project=the-white-prod-481217 \
  --cancel-in-progress
```

To find trigger IDs:
```bash
gcloud builds triggers list --region=asia-southeast1 --project=the-white-dev-481217
gcloud builds triggers list --region=asia-southeast1 --project=the-white-prod-481217
```

### Option 3: Using Cloud Console (Quick Manual Fix)

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Select your project (dev or prod)
3. Click on the trigger you want to update
4. Click "Edit"
5. Check the box for **"Cancel in-progress builds when a new build is triggered"**
6. Click "Save"

### Option 4: GitHub Actions Workflow (Already Implemented ✅)

For **manual deployments** triggered via GitHub Actions (`.github/workflows/deploy.yml`), cancellation is already handled! The workflow cancels previous builds **before** triggering a new one.

This works because:
- The workflow runs **before** the build is queued
- It can cancel QUEUED and WORKING builds from the same branch/tag
- It's already implemented in the "Cancel previous builds for same branch" step

**Note**: This only works for manual deployments via the workflow. For automatic Cloud Build triggers (on push/tag), you still need to use Option 1, 2, or 3 above.

## How It Works

When `cancel_in_progress = true` is set on a trigger:

1. A new commit/tag triggers a build
2. Cloud Build automatically cancels any **in-progress** builds from the same trigger
3. The new build starts immediately (or enters the queue if other triggers have builds running)

## Important Notes

- **For automatic triggers** (Options 1-3): This only cancels builds from the **same trigger**, not all builds in the project
- **For manual deployments** (Option 4): The workflow cancels builds from the same branch/tag across all triggers
- Builds that are already **QUEUED** will be canceled
- Builds that are **WORKING** (running) will be canceled
- This happens **before** the build starts, not during execution
- Cancellation from within `cloudbuild.yaml` runs too late (builds already started), which is why it was removed

## Which Option Should I Use?

- **Automatic triggers** (push to main, tag creation): Use **Option 1 (Terraform)** for permanent solution, or **Option 2/3** for quick fix
- **Manual deployments** via GitHub Actions: Already handled ✅ (Option 4)
- **Both**: Configure triggers (Option 1-3) AND keep the workflow cancellation (Option 4) for maximum coverage

## Verification

After configuring, test by:

1. Push a commit to trigger a build
2. Immediately push another commit
3. Check Cloud Build console - the first build should be canceled and only the second should run

## References

- [Cloud Build Trigger Documentation](https://cloud.google.com/build/docs/triggers)
- [Terraform google_cloudbuild_trigger Resource](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloudbuild_trigger#cancel_in_progress)

