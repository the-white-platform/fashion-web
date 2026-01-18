---
name: deploy-gcp
description: DevOps principles for production lifecycle management, GitOps, and reliability
---

# Cloud Run Deployment Strategy

This skill defines the DevOps principles for the `fashion-web` application on Google Cloud Platform. This is not just "how to run a command", but "how to maintain a production lifecycle".

## 🏛️ Infrastructure as Code (IaC)

- **Principle**: The Cloud Console is for _observability_, not _configuration_.
- **Source of Truth**: All infrastructure changes (Memory limits, concurrency, environment variables) must be defined in the Terraform configs (`../infrastructure`), NOT changed manually via CLI or UI, as they will be overwritten by the next apply.

## 🔄 CI/CD Pipeline Strategy

We utilize a **GitOps** workflow via GitHub Actions.

- **Continuous Integration (CI)**:
  - Runs on every PR.
  - **Mandatory**: Build check, Lint, Type check, Unit Tests.
  - **Goal**: Fail fast. Don't let bad code merge to main.

- **Continuous Delivery (CD)**:
  - **Dev**: Deploys automatically on merge to `main`.
  - **Prod**: Gated deployment via **Tags** (`v*`). This ensures production releases are deliberate and traceable snapshots in time.

## 🛡️ Secrets & Security

- **Secret Manager**: NEVER commit `.env` files. Secrets are injected at runtime via GCP Secret Manager.
- **Least Privilege**: The Cloud Run service account should only have permissions it strictly needs (e.g., `cloudsql.client`, `storage.objectViewer`).

## 👁️ Observability & Reliability

- **Structured Logging**: Ensure various log levels (INFO, WARN, ERROR) are properly emitted so GCP Cloud Logging can filter them.
- **Health Checks**: Next.js (or Payload) must expose a lightweight `/health` endpoint.
- **Cold Starts**: Mitigate with `min-instances` if traffic requires it, but balance with cost.

## 🚢 Deployment Safety Checklist

Before a production tag push:

- [ ] **Database Migrations**: are they backward compatible? (The code deploys _after_ the migration usually, or parallel).
- [ ] **Environment Variables**: Are new secrets added to Secret Manager?
- [ ] **Rollback Plan**: Do we know the previous working image tag?

## Reference: Environment Matrix

| Env      | Trigger     | Strategy                   | Secrets Source       |
| -------- | ----------- | -------------------------- | -------------------- |
| **Dev**  | `main` push | Mutable, rapid iteration   | `PAYLOAD_SECRET_DEV` |
| **Prod** | `v*` tag    | Immutable, stability first | `PAYLOAD_SECRET`     |
