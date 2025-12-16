# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [0.1.1](https://github.com/the-white-platform/fashion-web/compare/v0.1.0...v0.1.1) (2025-12-16)

## 0.1.0 (2025-12-16)

### Features

- setup automatic changelog generation and release workflow ([#8](https://github.com/the-white-platform/fashion-web/issues/8)) ([d20ee20](https://github.com/the-white-platform/fashion-web/commit/d20ee20ca7d7409f9decc82fa9f8017c7a12882f))

### Bug Fixes

- add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
- escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
- handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
- remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
- resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
- use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

## [0.0.1] - 2025-12-16

### Added

- Comprehensive multi-stage CI/CD pipeline with quality checks, build, deploy, and health checks
- GitHub Actions concurrency to auto-cancel previous workflow runs
- Automatic changelog generation and release workflow using standard-version
- Auto-fix formatting issues in CI/CD pipeline
- Manual deployment workflow for dev and prod environments
- Cloud Build cancellation for previous builds on same branch/tag
- Image promotion pattern: reuse dev Docker images for production deployments
- Cross-project IAM permissions for image copying between dev and prod

### Changed

- Moved changelog generation to after PR merge (release workflow)
- Consolidated workflows from 5 to 3 (ci-cd, create-release, deploy)
- Optimized workflow execution with parallel jobs
- Quality checks and build only run on PRs (not on main push)
- Main push only handles version bump and tag creation
- Deployment only happens on tag push (ensures app has new version in code)

### Fixed

- Fix Cloud Build cancellation filter syntax (use parentheses for proper grouping)
- Prevent infinite loop of release commits
- Prevent infinite version bump loop in PR workflow
- Handle protected branch when pushing version bump
- Only cancel builds from same branch, not all builds
- Improve build cancellation to handle queued builds
- Remove cancel-builds dependency from deploy job
- Correct health check and notification job dependencies
- Add token for PR commits and improve formatting commit logic
- Escape Cloud Build substitution variables correctly
- Resolve pnpm lockfile mismatch and update pnpm version
- Remove unused Cloud Build substitution variables
- Remove useless build cancellation from cloudbuild.yaml
- Use version tag instead of SHA for dev image lookup in prod copy

### Documentation

- Clarify all three options for build cancellation
- Update to include workflow-based cancellation option
- Add infrastructure setup guide for image promotion pattern

[Unreleased]: https://github.com/the-white-platform/fashion-web/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/the-white-platform/fashion-web/releases/tag/v0.0.1
