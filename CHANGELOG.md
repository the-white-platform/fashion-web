# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
### [0.11.1](https://github.com/the-white-platform/fashion-web/compare/v0.11.0...v0.11.1) (2026-02-19)


### Code Refactoring

* migrate to NextJs 16 ([#30](https://github.com/the-white-platform/fashion-web/issues/30)) ([380db64](https://github.com/the-white-platform/fashion-web/commit/380db64f81750dc73ea7d564ea5904a74a26dcaa))

## [0.11.0](https://github.com/the-white-platform/fashion-web/compare/v0.10.1...v0.11.0) (2026-02-19)


### Features

* implement accounting dashboard, order management, and admin UI ([#29](https://github.com/the-white-platform/fashion-web/issues/29)) ([5d48eee](https://github.com/the-white-platform/fashion-web/commit/5d48eee8a76406782019af253e32312a86957990))

### [0.10.1](https://github.com/the-white-platform/fashion-web/compare/v0.10.0...v0.10.1) (2026-02-12)


### Bug Fixes

* skip revalidateTag during migration to prevent startup crash ([#28](https://github.com/the-white-platform/fashion-web/issues/28)) ([0f0aee5](https://github.com/the-white-platform/fashion-web/commit/0f0aee59a543d5d726fb1008368b0c3cfc47429b))

## [0.10.0](https://github.com/the-white-platform/fashion-web/compare/v0.9.1...v0.10.0) (2026-02-11)


### Features

* add bootstrap migration for essential production data ([#27](https://github.com/the-white-platform/fashion-web/issues/27)) ([b28abcc](https://github.com/the-white-platform/fashion-web/commit/b28abcc79eb0b14eb6871e531e0e2400b20cb9f3))

### [0.9.1](https://github.com/the-white-platform/fashion-web/compare/v0.9.0...v0.9.1) (2026-02-11)


### Bug Fixes

* use GitHub Actions variable for NEXT_PUBLIC_SERVER_URL build arg ([#26](https://github.com/the-white-platform/fashion-web/issues/26)) ([6c5cca4](https://github.com/the-white-platform/fashion-web/commit/6c5cca47d00f82b2299bd3ac01b6c8aa105cda63))

## [0.9.0](https://github.com/the-white-platform/fashion-web/compare/v0.8.3...v0.9.0) (2026-02-10)


### Features

* extract price formatting and slug generation into new utilities and refactor posts display into a dedicated layout component. ([#24](https://github.com/the-white-platform/fashion-web/issues/24)) ([67da6e3](https://github.com/the-white-platform/fashion-web/commit/67da6e322505fc922f7305b3cbb18ed2854f7d0c))


### Bug Fixes

* remove deprecated installation-id from app token action ([#25](https://github.com/the-white-platform/fashion-web/issues/25)) ([9dbbdf8](https://github.com/the-white-platform/fashion-web/commit/9dbbdf89659e4158d0a8bea22ce525c5d18ffadd))

### [0.8.3](https://github.com/the-white-platform/fashion-web/compare/v0.8.2...v0.8.3) (2026-02-09)


### Performance Improvements

* enable ISR caching by removing force-dynamic from pages ([#23](https://github.com/the-white-platform/fashion-web/issues/23)) ([cfa959c](https://github.com/the-white-platform/fashion-web/commit/cfa959c671d464ba16baacd02106a8677392e70c))

### [0.8.2](https://github.com/the-white-platform/fashion-web/compare/v0.8.1...v0.8.2) (2026-02-09)


### Code Refactoring

* split release and deploy into separate triggers ([#22](https://github.com/the-white-platform/fashion-web/issues/22)) ([2353e11](https://github.com/the-white-platform/fashion-web/commit/2353e11da689239fb0e5d6ec7c58fc7112fe188c))

### [0.8.1](https://github.com/the-white-platform/fashion-web/compare/v0.8.0...v0.8.1) (2026-02-08)


### Bug Fixes

* prevent release commit from canceling deploy workflow ([#21](https://github.com/the-white-platform/fashion-web/issues/21)) ([5884bb7](https://github.com/the-white-platform/fashion-web/commit/5884bb72b23fc70e8ae69ca45379e7f108e1f077))

## [0.8.0](https://github.com/the-white-platform/fashion-web/compare/v0.7.0...v0.8.0) (2026-02-08)


### Features

* data seeder and minor UI improves ([#20](https://github.com/the-white-platform/fashion-web/issues/20)) ([9e2e1a5](https://github.com/the-white-platform/fashion-web/commit/9e2e1a5aa7093d37d154f1ae5a52ff600b2c12b5))

## [0.7.0](https://github.com/the-white-platform/fashion-web/compare/v0.6.1...v0.7.0) (2025-12-28)

### Features

- add beast scratch logo animation and redesign TakeActionHero ([#19](https://github.com/the-white-platform/fashion-web/issues/19)) ([69c4d90](https://github.com/the-white-platform/fashion-web/commit/69c4d902ffee9736725f127e7ad3aee40a633116))

### [0.6.1](https://github.com/the-white-platform/fashion-web/compare/v0.6.0...v0.6.1) (2025-12-27)

### Bug Fixes

- **ci:** add HTTP 307/308 to health check for locale redirects ([#18](https://github.com/the-white-platform/fashion-web/issues/18)) ([21d5a37](https://github.com/the-white-platform/fashion-web/commit/21d5a37e21dc74e676ffef941295068c4c629195))

## [0.6.0](https://github.com/the-white-platform/fashion-web/compare/v0.5.0...v0.6.0) (2025-12-27)

### Features

- UI improvements, theming and translations ([#17](https://github.com/the-white-platform/fashion-web/issues/17)) ([4a50cb1](https://github.com/the-white-platform/fashion-web/commit/4a50cb150888cbb6dd2cc7193c79e5df9e1dbc18))

## [0.5.0](https://github.com/the-white-platform/fashion-web/compare/v0.4.0...v0.5.0) (2025-12-20)

### Features

- add missing pages and enhance UI components ([#16](https://github.com/the-white-platform/fashion-web/issues/16)) ([2053764](https://github.com/the-white-platform/fashion-web/commit/20537646513885db86b15385803886d684306e3a))

## [0.4.0](https://github.com/the-white-platform/fashion-web/compare/v0.3.1...v0.4.0) (2025-12-18)

### Features

- init pages and components ([#15](https://github.com/the-white-platform/fashion-web/issues/15)) ([fd21784](https://github.com/the-white-platform/fashion-web/commit/fd2178493e6c233dd0f98e6ffd0cd35394335aaf))

### [0.3.1](https://github.com/the-white-platform/fashion-web/compare/v0.3.0...v0.3.1) (2025-12-17)

### Bug Fixes

- address code review comments ([#14](https://github.com/the-white-platform/fashion-web/issues/14)) ([1274c30](https://github.com/the-white-platform/fashion-web/commit/1274c303e505fc3e7f284d9a9777100feb8da33e))
- replace invalid gcloud artifacts copy command with docker pull/push ([#13](https://github.com/the-white-platform/fashion-web/issues/13)) ([1c60860](https://github.com/the-white-platform/fashion-web/commit/1c60860379576ccfccbaa9b036adf9d04711fe8a))

## [0.3.0](https://github.com/the-white-platform/fashion-web/compare/v0.1.0...v0.3.0) (2025-12-17)

### Features

- configure GitHub Actions WIF and build-once-deploy-anywhere ([#11](https://github.com/the-white-platform/fashion-web/issues/11)) ([42eb9c4](https://github.com/the-white-platform/fashion-web/commit/42eb9c4fb5bb52ac8dc0708bf637ddbfd1b7ec64))

### Bug Fixes

- add WIF authentication verification steps and fix script ([#12](https://github.com/the-white-platform/fashion-web/issues/12)) ([e51d315](https://github.com/the-white-platform/fashion-web/commit/e51d3154ac535fec43252093d61730f404b1f59d))

## [0.2.0](https://github.com/the-white-platform/fashion-web/compare/v0.1.0...v0.2.0) (2025-12-17)

### Features

- configure GitHub Actions WIF and build-once-deploy-anywhere ([#11](https://github.com/the-white-platform/fashion-web/issues/11)) ([42eb9c4](https://github.com/the-white-platform/fashion-web/commit/42eb9c4fb5bb52ac8dc0708bf637ddbfd1b7ec64))

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
