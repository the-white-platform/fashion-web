# Cloud Build Trigger Configuration: Cancel Previous Builds

## Problem

When multiple commits are pushed in quick succession, Cloud Build queues multiple builds. By the time a build starts running (after waiting in queue), previous builds have already finished or are already running, making it impossible to cancel them from within the build itself.

## Solution

Configure Cloud Build triggers to automatically cancel previous builds when a new one is triggered. This must be done at the **trigger level**, not in the build configuration.

## Configuration Options

### Option 1: Using Terraform (Recommended)

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

### Option 2: Using gcloud CLI

If you need to update existing triggers manually:

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

### Option 3: Using Cloud Console

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Select your project (dev or prod)
3. Click on the trigger you want to update
4. Click "Edit"
5. Check the box for **"Cancel in-progress builds when a new build is triggered"**
6. Click "Save"

## How It Works

When `cancel_in_progress = true` is set on a trigger:

1. A new commit/tag triggers a build
2. Cloud Build automatically cancels any **in-progress** builds from the same trigger
3. The new build starts immediately (or enters the queue if other triggers have builds running)

## Important Notes

- This only cancels builds from the **same trigger**, not all builds in the project
- Builds that are already **QUEUED** will be canceled
- Builds that are **WORKING** (running) will be canceled
- This happens **before** the build starts, not during execution
- This is the **only** reliable way to cancel builds, as cancellation from within `cloudbuild.yaml` runs too late

## Verification

After configuring, test by:

1. Push a commit to trigger a build
2. Immediately push another commit
3. Check Cloud Build console - the first build should be canceled and only the second should run

## References

- [Cloud Build Trigger Documentation](https://cloud.google.com/build/docs/triggers)
- [Terraform google_cloudbuild_trigger Resource](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloudbuild_trigger#cancel_in_progress)

