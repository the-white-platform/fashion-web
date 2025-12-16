# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
### 0.0.1 (2025-12-16)


### Features

* add comprehensive multi-stage CI/CD pipeline ([a840253](https://github.com/the-white-platform/fashion-web/commit/a8402536e799104e8575698125426390f8329034))
* add workflow to cancel previous builds on push ([5006415](https://github.com/the-white-platform/fashion-web/commit/5006415716ade733aeca1d7d81a50f3db9594df1))
* cancel previous builds when new commit is pushed ([4703e9d](https://github.com/the-white-platform/fashion-web/commit/4703e9d4b1ec6a05ee9851ac7196ad5c599c3d42))
* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* correct health check and notification job dependencies ([e10488b](https://github.com/the-white-platform/fashion-web/commit/e10488b2ae0d739be03c78e7e710d463196d473d))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* improve build cancellation to handle queued builds ([4a86b21](https://github.com/the-white-platform/fashion-web/commit/4a86b213449d389cd2c49f2fa441a9bd3c07ba0b))
* only cancel builds from same branch, not all builds ([2d7d8a0](https://github.com/the-white-platform/fashion-web/commit/2d7d8a05715be9ded7cda85186b2d9fe33fa5786))
* prevent infinite loop of release commits ([4edd605](https://github.com/the-white-platform/fashion-web/commit/4edd605d616f1f1126c968e5f067e2d4541c252b))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* prevent unnecessary release commits ([075f0d3](https://github.com/the-white-platform/fashion-web/commit/075f0d3568e86135e1b90147955226795874ba85))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* remove useless build cancellation from cloudbuild.yaml ([6dca183](https://github.com/the-white-platform/fashion-web/commit/6dca183a01e0dd31d58961718aba61f164bc9231))
* reset version to 0.0.1 ([e10dfe4](https://github.com/the-white-platform/fashion-web/commit/e10dfe4d15b3f7acc8a39761d8b0f7b87885b62c))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))


### Documentation

* clarify all three options for build cancellation ([c16d3d3](https://github.com/the-white-platform/fashion-web/commit/c16d3d37b7cec8e92a0ef391dafcade8f53cd12b))
* update to include workflow-based cancellation option ([3195afc](https://github.com/the-white-platform/fashion-web/commit/3195afc47e7e643727b224dae6d1a888b02d7332))

### 0.0.1 (2025-12-16)


### Features

* add comprehensive multi-stage CI/CD pipeline ([a840253](https://github.com/the-white-platform/fashion-web/commit/a8402536e799104e8575698125426390f8329034))
* add workflow to cancel previous builds on push ([5006415](https://github.com/the-white-platform/fashion-web/commit/5006415716ade733aeca1d7d81a50f3db9594df1))
* cancel previous builds when new commit is pushed ([4703e9d](https://github.com/the-white-platform/fashion-web/commit/4703e9d4b1ec6a05ee9851ac7196ad5c599c3d42))
* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* correct health check and notification job dependencies ([e10488b](https://github.com/the-white-platform/fashion-web/commit/e10488b2ae0d739be03c78e7e710d463196d473d))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* improve build cancellation to handle queued builds ([4a86b21](https://github.com/the-white-platform/fashion-web/commit/4a86b213449d389cd2c49f2fa441a9bd3c07ba0b))
* only cancel builds from same branch, not all builds ([2d7d8a0](https://github.com/the-white-platform/fashion-web/commit/2d7d8a05715be9ded7cda85186b2d9fe33fa5786))
* prevent infinite loop of release commits ([4edd605](https://github.com/the-white-platform/fashion-web/commit/4edd605d616f1f1126c968e5f067e2d4541c252b))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* remove useless build cancellation from cloudbuild.yaml ([6dca183](https://github.com/the-white-platform/fashion-web/commit/6dca183a01e0dd31d58961718aba61f164bc9231))
* reset version to 0.0.1 ([e10dfe4](https://github.com/the-white-platform/fashion-web/commit/e10dfe4d15b3f7acc8a39761d8b0f7b87885b62c))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))


### Documentation

* clarify all three options for build cancellation ([c16d3d3](https://github.com/the-white-platform/fashion-web/commit/c16d3d37b7cec8e92a0ef391dafcade8f53cd12b))
* update to include workflow-based cancellation option ([3195afc](https://github.com/the-white-platform/fashion-web/commit/3195afc47e7e643727b224dae6d1a888b02d7332))

### 0.0.1 (2025-12-16)


### Features

* add workflow to cancel previous builds on push ([5006415](https://github.com/the-white-platform/fashion-web/commit/5006415716ade733aeca1d7d81a50f3db9594df1))
* cancel previous builds when new commit is pushed ([4703e9d](https://github.com/the-white-platform/fashion-web/commit/4703e9d4b1ec6a05ee9851ac7196ad5c599c3d42))
* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* improve build cancellation to handle queued builds ([4a86b21](https://github.com/the-white-platform/fashion-web/commit/4a86b213449d389cd2c49f2fa441a9bd3c07ba0b))
* only cancel builds from same branch, not all builds ([2d7d8a0](https://github.com/the-white-platform/fashion-web/commit/2d7d8a05715be9ded7cda85186b2d9fe33fa5786))
* prevent infinite loop of release commits ([4edd605](https://github.com/the-white-platform/fashion-web/commit/4edd605d616f1f1126c968e5f067e2d4541c252b))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* remove useless build cancellation from cloudbuild.yaml ([6dca183](https://github.com/the-white-platform/fashion-web/commit/6dca183a01e0dd31d58961718aba61f164bc9231))
* reset version to 0.0.1 ([e10dfe4](https://github.com/the-white-platform/fashion-web/commit/e10dfe4d15b3f7acc8a39761d8b0f7b87885b62c))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))


### Documentation

* clarify all three options for build cancellation ([c16d3d3](https://github.com/the-white-platform/fashion-web/commit/c16d3d37b7cec8e92a0ef391dafcade8f53cd12b))
* update to include workflow-based cancellation option ([3195afc](https://github.com/the-white-platform/fashion-web/commit/3195afc47e7e643727b224dae6d1a888b02d7332))

### 0.0.1 (2025-12-16)


### Features

* cancel previous builds when new commit is pushed ([4703e9d](https://github.com/the-white-platform/fashion-web/commit/4703e9d4b1ec6a05ee9851ac7196ad5c599c3d42))
* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* improve build cancellation to handle queued builds ([4a86b21](https://github.com/the-white-platform/fashion-web/commit/4a86b213449d389cd2c49f2fa441a9bd3c07ba0b))
* only cancel builds from same branch, not all builds ([2d7d8a0](https://github.com/the-white-platform/fashion-web/commit/2d7d8a05715be9ded7cda85186b2d9fe33fa5786))
* prevent infinite loop of release commits ([4edd605](https://github.com/the-white-platform/fashion-web/commit/4edd605d616f1f1126c968e5f067e2d4541c252b))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* remove useless build cancellation from cloudbuild.yaml ([6dca183](https://github.com/the-white-platform/fashion-web/commit/6dca183a01e0dd31d58961718aba61f164bc9231))
* reset version to 0.0.1 ([e10dfe4](https://github.com/the-white-platform/fashion-web/commit/e10dfe4d15b3f7acc8a39761d8b0f7b87885b62c))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))


### Documentation

* clarify all three options for build cancellation ([c16d3d3](https://github.com/the-white-platform/fashion-web/commit/c16d3d37b7cec8e92a0ef391dafcade8f53cd12b))

### 0.0.1 (2025-12-16)


### Features

* cancel previous builds when new commit is pushed ([4703e9d](https://github.com/the-white-platform/fashion-web/commit/4703e9d4b1ec6a05ee9851ac7196ad5c599c3d42))
* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* improve build cancellation to handle queued builds ([4a86b21](https://github.com/the-white-platform/fashion-web/commit/4a86b213449d389cd2c49f2fa441a9bd3c07ba0b))
* only cancel builds from same branch, not all builds ([2d7d8a0](https://github.com/the-white-platform/fashion-web/commit/2d7d8a05715be9ded7cda85186b2d9fe33fa5786))
* prevent infinite loop of release commits ([4edd605](https://github.com/the-white-platform/fashion-web/commit/4edd605d616f1f1126c968e5f067e2d4541c252b))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* remove useless build cancellation from cloudbuild.yaml ([6dca183](https://github.com/the-white-platform/fashion-web/commit/6dca183a01e0dd31d58961718aba61f164bc9231))
* reset version to 0.0.1 ([e10dfe4](https://github.com/the-white-platform/fashion-web/commit/e10dfe4d15b3f7acc8a39761d8b0f7b87885b62c))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

### 0.0.1 (2025-12-16)


### Features

* cancel previous builds when new commit is pushed ([4703e9d](https://github.com/the-white-platform/fashion-web/commit/4703e9d4b1ec6a05ee9851ac7196ad5c599c3d42))
* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* improve build cancellation to handle queued builds ([4a86b21](https://github.com/the-white-platform/fashion-web/commit/4a86b213449d389cd2c49f2fa441a9bd3c07ba0b))
* only cancel builds from same branch, not all builds ([2d7d8a0](https://github.com/the-white-platform/fashion-web/commit/2d7d8a05715be9ded7cda85186b2d9fe33fa5786))
* prevent infinite loop of release commits ([4edd605](https://github.com/the-white-platform/fashion-web/commit/4edd605d616f1f1126c968e5f067e2d4541c252b))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* reset version to 0.0.1 ([e10dfe4](https://github.com/the-white-platform/fashion-web/commit/e10dfe4d15b3f7acc8a39761d8b0f7b87885b62c))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

### 0.0.1 (2025-12-16)


### Features

* cancel previous builds when new commit is pushed ([4703e9d](https://github.com/the-white-platform/fashion-web/commit/4703e9d4b1ec6a05ee9851ac7196ad5c599c3d42))
* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* improve build cancellation to handle queued builds ([4a86b21](https://github.com/the-white-platform/fashion-web/commit/4a86b213449d389cd2c49f2fa441a9bd3c07ba0b))
* only cancel builds from same branch, not all builds ([2d7d8a0](https://github.com/the-white-platform/fashion-web/commit/2d7d8a05715be9ded7cda85186b2d9fe33fa5786))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* reset version to 0.0.1 ([e10dfe4](https://github.com/the-white-platform/fashion-web/commit/e10dfe4d15b3f7acc8a39761d8b0f7b87885b62c))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

### 0.0.1 (2025-12-16)


### Features

* cancel previous builds when new commit is pushed ([4703e9d](https://github.com/the-white-platform/fashion-web/commit/4703e9d4b1ec6a05ee9851ac7196ad5c599c3d42))
* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* only cancel builds from same branch, not all builds ([2d7d8a0](https://github.com/the-white-platform/fashion-web/commit/2d7d8a05715be9ded7cda85186b2d9fe33fa5786))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* reset version to 0.0.1 ([e10dfe4](https://github.com/the-white-platform/fashion-web/commit/e10dfe4d15b3f7acc8a39761d8b0f7b87885b62c))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

### 0.0.1 (2025-12-16)


### Features

* cancel previous builds when new commit is pushed ([4703e9d](https://github.com/the-white-platform/fashion-web/commit/4703e9d4b1ec6a05ee9851ac7196ad5c599c3d42))
* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* reset version to 0.0.1 ([e10dfe4](https://github.com/the-white-platform/fashion-web/commit/e10dfe4d15b3f7acc8a39761d8b0f7b87885b62c))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

### 0.0.1 (2025-12-16)


### Features

* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* reset version to 0.0.1 ([e10dfe4](https://github.com/the-white-platform/fashion-web/commit/e10dfe4d15b3f7acc8a39761d8b0f7b87885b62c))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

## 0.7.0 (2025-12-16)


### Features

* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* prevent infinite version bump loop in PR workflow ([4356349](https://github.com/the-white-platform/fashion-web/commit/4356349ee657e40f909ea7be722b553255a046ab))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

## 0.7.0 (2025-12-16)


### Features

* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

## 0.6.0 (2025-12-16)


### Features

* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

## 0.5.0 (2025-12-16)


### Features

* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

## 0.4.0 (2025-12-16)


### Features

* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

## 0.3.0 (2025-12-16)


### Features

* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

## 0.2.0 (2025-12-16)


### Features

* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

## 0.1.0 (2025-12-16)


### Features

* setup automatic changelog generation and release workflow ([e3f20ff](https://github.com/the-white-platform/fashion-web/commit/e3f20ff2b41fcf815c9591d9d002cfd1c9159730))


### Bug Fixes

* add manual deployment workflows and fix pnpm setup ([#5](https://github.com/the-white-platform/fashion-web/issues/5)) ([3aa41b1](https://github.com/the-white-platform/fashion-web/commit/3aa41b107ae39ff3c3fd3f9c2728673e645defb2))
* escape Cloud Build substitution variables with double dollar signs ([c28909c](https://github.com/the-white-platform/fashion-web/commit/c28909c6a19c985f0fc140a288f9e1bfe092b4e5))
* handle protected branch when pushing version bump ([#7](https://github.com/the-white-platform/fashion-web/issues/7)) ([fbd6e2e](https://github.com/the-white-platform/fashion-web/commit/fbd6e2e9c8915b111969ce178e16f483e347bbe5))
* remove unused Cloud Build substitution variables ([9f71731](https://github.com/the-white-platform/fashion-web/commit/9f71731d5a5f26e098b48c5f18318276494a2c6d))
* resolve pnpm lockfile mismatch and update pnpm version ([#6](https://github.com/the-white-platform/fashion-web/issues/6)) ([f65df81](https://github.com/the-white-platform/fashion-web/commit/f65df81a477cdadffb0aa532040ca565f275573e))
* use Cloud Build substitution variables correctly without double dollar signs ([574dd0f](https://github.com/the-white-platform/fashion-web/commit/574dd0fd57232cf7bc5d4cc22eabc5fc7eaacf36))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup
- Payload CMS integration
- Next.js frontend
- Cloud Build deployment configuration
- Artifact Registry setup for production

### Changed

### Deprecated

### Removed

### Fixed

### Security
