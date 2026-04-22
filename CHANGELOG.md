# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [0.57.0](https://github.com/the-white-platform/fashion-web/compare/v0.56.0...v0.57.0) (2026-04-22)


### Features

* **zalo:** map ZNS order + OTP templates to real data ([ef8004a](https://github.com/the-white-platform/fashion-web/commit/ef8004ab44bdc12902d1e4629adaeb9811a74f3d))
* **zalo:** self-service token renewal + dashboard expiry warning ([394885d](https://github.com/the-white-platform/fashion-web/commit/394885df3d099b9d9ed8bcb34ecb028c3afb37d1))

## [0.56.0](https://github.com/the-white-platform/fashion-web/compare/v0.55.0...v0.56.0) (2026-04-22)


### Features

* **orders:** enable email + Zalo ZNS notifications on status transitions ([a52c670](https://github.com/the-white-platform/fashion-web/commit/a52c6709b2d87febb4c8b1664467bd35f9f2da66))
* **zalo:** one-shot OA OAuth flow for capturing refresh token ([f1dfa6f](https://github.com/the-white-platform/fashion-web/commit/f1dfa6f43dbefa8d16b42ce65b6800c2fe58d482))

## [0.55.0](https://github.com/the-white-platform/fashion-web/compare/v0.54.4...v0.55.0) (2026-04-22)


### Features

* **auth:** browser-side Zalo /me fallback when server IP geo-blocked ([32a70a6](https://github.com/the-white-platform/fashion-web/commit/32a70a63a0452297fd77b9c108bcbaa967f2e9f8))

### [0.54.4](https://github.com/the-white-platform/fashion-web/compare/v0.54.3...v0.54.4) (2026-04-22)


### Bug Fixes

* **auth:** fall back to id-only Zalo /me when personal info is geo-blocked ([a28f684](https://github.com/the-white-platform/fashion-web/commit/a28f684396e770b131bf3492085736ff91a7666d))

### [0.54.3](https://github.com/the-white-platform/fashion-web/compare/v0.54.2...v0.54.3) (2026-04-22)


### Bug Fixes

* **ux:** surface upstream order-submission error on checkout ([1c7187b](https://github.com/the-white-platform/fashion-web/commit/1c7187b56f2e006ed31f6aa2a6f775b7c078cdb7))

### [0.54.2](https://github.com/the-white-platform/fashion-web/compare/v0.54.1...v0.54.2) (2026-04-22)


### Bug Fixes

* **ux:** surface upstream error detail on register / reset / verify ([b70143e](https://github.com/the-white-platform/fashion-web/commit/b70143e844eb916bc32bf40634f879a2c9baf22a))

### [0.54.1](https://github.com/the-white-platform/fashion-web/compare/v0.54.0...v0.54.1) (2026-04-22)


### Bug Fixes

* **auth:** surface Zalo upstream error message on login page ([120fdb3](https://github.com/the-white-platform/fashion-web/commit/120fdb3c04a721c2a36f01eba9bca3d9ca6ec749))

## [0.54.0](https://github.com/the-white-platform/fashion-web/compare/v0.53.0...v0.54.0) (2026-04-22)


### Features

* **auth:** email-or-phone signup + Zalo OAuth login ([b21113a](https://github.com/the-white-platform/fashion-web/commit/b21113a6c2975c0f5239f8d56649081157eefcd7))
* **auth:** polish Zalo/email-or-phone UI on login + register ([32f73da](https://github.com/the-white-platform/fashion-web/commit/32f73da2219d8e592f3b0c99a7cec48a42e07a19))

## [0.53.0](https://github.com/the-white-platform/fashion-web/compare/v0.52.1...v0.53.0) (2026-04-22)


### Features

* **admin:** password-gated VTO result-image preview ([86e7b2a](https://github.com/the-white-platform/fashion-web/commit/86e7b2ae5700574d35da3cb064846a673ea9a56d))
* **auth:** email OTP — request + verify, bilingual template ([6d45f63](https://github.com/the-white-platform/fashion-web/commit/6d45f6333ffde622dc3d8963c1c31e3ec19ad2eb))
* **email:** combined THE WHITE ACTIVE logo + CompanyInfo footer across all templates ([3b2e8a4](https://github.com/the-white-platform/fashion-web/commit/3b2e8a45850033f001bcea6f50aee401a46d4bbc))
* **email:** shared brand header/footer + CompanyInfo-driven contact block ([0e04b85](https://github.com/the-white-platform/fashion-web/commit/0e04b8555b2884898169d18fedd65f546043b173))


### Bug Fixes

* **email:** switch sender + support addresses to thewhite.cool ([d23f2f3](https://github.com/the-white-platform/fashion-web/commit/d23f2f3e7b62add1d6e7b4653b390902686349ab))


### Code Refactoring

* **email:** pass CompanyInfo into OTP template, keep template sync ([ce67f92](https://github.com/the-white-platform/fashion-web/commit/ce67f92c2047f887061a1b52f6721610dda61acc))

### [0.52.1](https://github.com/the-white-platform/fashion-web/compare/v0.52.0...v0.52.1) (2026-04-22)


### Bug Fixes

* **auth:** prune expired sessions on every user write ([df56fb8](https://github.com/the-white-platform/fashion-web/commit/df56fb8bd01359d6565f6d1b8305df4151e17752))

## [0.52.0](https://github.com/the-white-platform/fashion-web/compare/v0.51.0...v0.52.0) (2026-04-22)


### Features

* **loyalty:** surface loyalty across header, mobile menu, checkout, and home ([263c2a0](https://github.com/the-white-platform/fashion-web/commit/263c2a0a762d219268639c97ea4d9f47a9363476))

## [0.51.0](https://github.com/the-white-platform/fashion-web/compare/v0.50.2...v0.51.0) (2026-04-22)


### Features

* **loyalty:** finish referral payout — both sides get 200 points on first confirmed order ([2a37212](https://github.com/the-white-platform/fashion-web/commit/2a37212646590026e34afebbd726198198f83795))

### [0.50.2](https://github.com/the-white-platform/fashion-web/compare/v0.50.1...v0.50.2) (2026-04-22)


### Bug Fixes

* **vto:** log every successful try-on, stop silent row drops ([dd496e0](https://github.com/the-white-platform/fashion-web/commit/dd496e0830d9303656354f7617648ac029d3d2b1))

### [0.50.1](https://github.com/the-white-platform/fashion-web/compare/v0.50.0...v0.50.1) (2026-04-21)


### Bug Fixes

* **i18n:** force default vi locale on root requests ([0ec7119](https://github.com/the-white-platform/fashion-web/commit/0ec71190c2d4b8031acfb4ed597aeca5346d2028))

## [0.50.0](https://github.com/the-white-platform/fashion-web/compare/v0.49.1...v0.50.0) (2026-04-20)


### Features

* **seo,analytics:** GA4 ecommerce events + image alt fixes ([02d5391](https://github.com/the-white-platform/fashion-web/commit/02d5391699db028ab74ad378b60e62b10d8641ec))

### [0.49.1](https://github.com/the-white-platform/fashion-web/compare/v0.49.0...v0.49.1) (2026-04-19)


### Bug Fixes

* **seo:** static robots.txt instead of dynamic ([898ead6](https://github.com/the-white-platform/fashion-web/commit/898ead652c10dac33a6bf7c3c3bf6c5ff0598bfe))

## [0.49.0](https://github.com/the-white-platform/fashion-web/compare/v0.48.0...v0.49.0) (2026-04-19)


### Features

* **seo:** sitemap, robots, hreflang, expanded VN keywords ([62a9af7](https://github.com/the-white-platform/fashion-web/commit/62a9af777e8349cfd17103da7c411d48cc9e29eb))

## [0.48.0](https://github.com/the-white-platform/fashion-web/compare/v0.47.2...v0.48.0) (2026-04-19)


### Features

* add Google Analytics 4 via @next/third-parties ([a486e05](https://github.com/the-white-platform/fashion-web/commit/a486e051944ec8800ba021cf1a46febe547a0692))

### [0.47.2](https://github.com/the-white-platform/fashion-web/compare/v0.47.1...v0.47.2) (2026-04-18)


### Bug Fixes

* remove quotes ([86979fc](https://github.com/the-white-platform/fashion-web/commit/86979fceb0c76bc418c1db9b1375f93c4ab0a480))

### [0.47.1](https://github.com/the-white-platform/fashion-web/compare/v0.47.0...v0.47.1) (2026-04-18)


### Code Refactoring

* **icons:** extract shared ZaloIcon, use it on contact page Zalo Official ([3e9ccdd](https://github.com/the-white-platform/fashion-web/commit/3e9ccdd74a6611b222d03a7d3d872f9b76a0cfe4))

## [0.47.0](https://github.com/the-white-platform/fashion-web/compare/v0.46.1...v0.47.0) (2026-04-18)


### Features

* **company-info:** add legal entity, tax, address, authority fields for MoIT disclosure ([b506721](https://github.com/the-white-platform/fashion-web/commit/b50672100ebb61f3ae9abc8abbdfd408769fc86a))
* **footer,contact:** MoIT legal disclosure, Zalo OA icon, drop Products column ([4a4a467](https://github.com/the-white-platform/fashion-web/commit/4a4a4672d3ac79daf3b74fb4e108579cacbd2d2d))


### Bug Fixes

* **recently-viewed:** prevent hydration mismatch by deferring localStorage read ([8323585](https://github.com/the-white-platform/fashion-web/commit/8323585aef4448b55821db51229f6e23ca5f5023))

### [0.46.1](https://github.com/the-white-platform/fashion-web/compare/v0.46.0...v0.46.1) (2026-04-17)


### Bug Fixes

* **orders:** accept any-locale color name for variant matching ([ba107d8](https://github.com/the-white-platform/fashion-web/commit/ba107d8fb95c896f784437f9d95384f3f62df868))

## [0.46.0](https://github.com/the-white-platform/fashion-web/compare/v0.45.0...v0.46.0) (2026-04-17)


### Features

* **i18n+catalog:** full i18n overhaul, CMS tags + FAQs, admin display order ([#35](https://github.com/the-white-platform/fashion-web/issues/35)) ([2727147](https://github.com/the-white-platform/fashion-web/commit/272714721d042859d1f8366023950f7b4c780952))

## [0.45.0](https://github.com/the-white-platform/fashion-web/compare/v0.44.7...v0.45.0) (2026-04-17)


### Features

* **seo:** fix OG image 500 + enrich link-preview metadata ([0ed9d8a](https://github.com/the-white-platform/fashion-web/commit/0ed9d8a0c8201e3209a75a4dc62bea9ecff56e98))

### [0.44.7](https://github.com/the-white-platform/fashion-web/compare/v0.44.6...v0.44.7) (2026-04-17)


### Bug Fixes

* **checkout:** mobile overflow + save-address visibility + payment label wrap ([946cdb8](https://github.com/the-white-platform/fashion-web/commit/946cdb8c3295d4241bfab7240c29a23a0c7ebee9))

### [0.44.6](https://github.com/the-white-platform/fashion-web/compare/v0.44.5...v0.44.6) (2026-04-17)


### Bug Fixes

* **quickview:** use flex-col on mobile so image + details stack cleanly ([fc96711](https://github.com/the-white-platform/fashion-web/commit/fc967118593f6e4389001412135f304db9404a20))

### [0.44.5](https://github.com/the-white-platform/fashion-web/compare/v0.44.4...v0.44.5) (2026-04-17)


### Bug Fixes

* **quickview:** mobile image + scroll ([95591f8](https://github.com/the-white-platform/fashion-web/commit/95591f859ea9ecd5fdd72d37473de92d187f9e84))

### [0.44.4](https://github.com/the-white-platform/fashion-web/compare/v0.44.3...v0.44.4) (2026-04-17)


### Bug Fixes

* **ui:** mobile horizontal overflow + header logo wrap ([d9480d4](https://github.com/the-white-platform/fashion-web/commit/d9480d49873600829451a180897580ca6535b381))

### [0.44.3](https://github.com/the-white-platform/fashion-web/compare/v0.44.2...v0.44.3) (2026-04-17)


### Bug Fixes

* **checkout:** prevent 400 on order submit + mobile overflow ([2202c3e](https://github.com/the-white-platform/fashion-web/commit/2202c3e420b44a04258b8d0fd77552bc384329ad))

### [0.44.2](https://github.com/the-white-platform/fashion-web/compare/v0.44.1...v0.44.2) (2026-04-17)


### Bug Fixes

* **checkout:** saved-address selection + rendering ([c85209e](https://github.com/the-white-platform/fashion-web/commit/c85209e545906bcf94142b2111429b0308c2e200))

### [0.44.1](https://github.com/the-white-platform/fashion-web/compare/v0.44.0...v0.44.1) (2026-04-16)


### Bug Fixes

* **migration:** idempotent DROP for size-chart FK + index ([6156f38](https://github.com/the-white-platform/fashion-web/commit/6156f38fe27d19e5b3c1c4863d8bb88762babcd3))

## [0.44.0](https://github.com/the-white-platform/fashion-web/compare/v0.43.0...v0.44.0) (2026-04-16)


### Features

* **catalog:** structured size charts, company info global, mobile filter parity ([67a5dfc](https://github.com/the-white-platform/fashion-web/commit/67a5dfcac752d69bb57236da8b23063e7449a126))

## [0.43.0](https://github.com/the-white-platform/fashion-web/compare/v0.42.10...v0.43.0) (2026-04-16)


### Features

* **sizing:** real size chart measurements from Drive ([4016b3e](https://github.com/the-white-platform/fashion-web/commit/4016b3ee54881f829214e972c33783681b0ea779))

### [0.42.10](https://github.com/the-white-platform/fashion-web/compare/v0.42.9...v0.42.10) (2026-04-16)


### Bug Fixes

* **size-picker:** modal stacks on mobile — explicit grid-cols-1 base ([0119bda](https://github.com/the-white-platform/fashion-web/commit/0119bda4fec9a053cc733fc98bc8c3e5e844d07e))

### [0.42.9](https://github.com/the-white-platform/fashion-web/compare/v0.42.8...v0.42.9) (2026-04-16)

### [0.42.8](https://github.com/the-white-platform/fashion-web/compare/v0.42.7...v0.42.8) (2026-04-16)


### Bug Fixes

* **header:** restore useTranslations + Link imports used by cart/profile icons ([20fec5f](https://github.com/the-white-platform/fashion-web/commit/20fec5f5886ea12c8cb8a6075dc7a007f34cf0c0))

### [0.42.7](https://github.com/the-white-platform/fashion-web/compare/v0.42.6...v0.42.7) (2026-04-16)


### Code Refactoring

* **header:** remove in-code navItems fallback — CMS is the only source ([e9ef5aa](https://github.com/the-white-platform/fashion-web/commit/e9ef5aaff686f5a054d63a040714d90f64888dde))

### [0.42.6](https://github.com/the-white-platform/fashion-web/compare/v0.42.5...v0.42.6) (2026-04-16)

### [0.42.5](https://github.com/the-white-platform/fashion-web/compare/v0.42.4...v0.42.5) (2026-04-16)


### Bug Fixes

* **mobile-nav:** point 'Theo dõi đơn hàng' at /orders (route /order-tracking doesn't exist) ([d8f2d6d](https://github.com/the-white-platform/fashion-web/commit/d8f2d6d9674020c359585af9a12150b26d4c721b))

### [0.42.4](https://github.com/the-white-platform/fashion-web/compare/v0.42.3...v0.42.4) (2026-04-16)


### Bug Fixes

* **size-picker:** use ?sizes= (plural) to match products page filter param ([99bea52](https://github.com/the-white-platform/fashion-web/commit/99bea52b947e8fdf0be92bef234813a396486abd))

### [0.42.3](https://github.com/the-white-platform/fashion-web/compare/v0.42.2...v0.42.3) (2026-04-16)


### Bug Fixes

* **orders:** always stack QR + bank-info vertically in payment card ([0d20e22](https://github.com/the-white-platform/fashion-web/commit/0d20e22d852ed00fc9b74b0106b4b10f8a0dee9e))

### [0.42.2](https://github.com/the-white-platform/fashion-web/compare/v0.42.1...v0.42.2) (2026-04-16)

### [0.42.1](https://github.com/the-white-platform/fashion-web/compare/v0.42.0...v0.42.1) (2026-04-16)


### Bug Fixes

* **i18n,orders:** common.X translations + squeezed QR layout ([8eeaec0](https://github.com/the-white-platform/fashion-web/commit/8eeaec02cd730f0d0fdd0410347bf4d9254e4afa))

## [0.42.0](https://github.com/the-white-platform/fashion-web/compare/v0.41.0...v0.42.0) (2026-04-16)


### Features

* **size:** reusable SmartSizePicker — Vertex AI + modal on PDP + bug fixes ([f934335](https://github.com/the-white-platform/fashion-web/commit/f934335e2e2fb19737aadd51d025f854439b0b62))

## [0.41.0](https://github.com/the-white-platform/fashion-web/compare/v0.40.0...v0.41.0) (2026-04-16)


### Features

* **ai:** route all Gemini calls through Vertex (trial-credit only) ([3b74b52](https://github.com/the-white-platform/fashion-web/commit/3b74b520fdb7e0112cda3d4b1a07ea7f771d2307))

## [0.40.0](https://github.com/the-white-platform/fashion-web/compare/v0.39.0...v0.40.0) (2026-04-16)


### Features

* **chatbot:** expand context pack — product features + site capabilities ([8b1b6a1](https://github.com/the-white-platform/fashion-web/commit/8b1b6a1184ec29654daefd5af382becf265db862))

## [0.39.0](https://github.com/the-white-platform/fashion-web/compare/v0.38.3...v0.39.0) (2026-04-16)


### Features

* **chatbot:** ground Wolfies with CMS-editable brand + catalog context ([79430fc](https://github.com/the-white-platform/fashion-web/commit/79430fcff70b03fd5c2a1942903c2336deb565d0))

### [0.38.3](https://github.com/the-white-platform/fashion-web/compare/v0.38.2...v0.38.3) (2026-04-16)


### Bug Fixes

* **orders:** 400 on checkout — email optional + drop empty strings ([7f5da2c](https://github.com/the-white-platform/fashion-web/commit/7f5da2c6365ea1d7edebf50076488f341cc471d1))

### [0.38.2](https://github.com/the-white-platform/fashion-web/compare/v0.38.1...v0.38.2) (2026-04-16)

### [0.38.1](https://github.com/the-white-platform/fashion-web/compare/v0.38.0...v0.38.1) (2026-04-16)

## [0.38.0](https://github.com/the-white-platform/fashion-web/compare/v0.37.2...v0.38.0) (2026-04-16)


### Features

* **orders:** Zalo ZNS notifications on confirmed + shipping transitions ([b30112b](https://github.com/the-white-platform/fashion-web/commit/b30112ba7fd4ae709762dc2a569f8cf43b45c439))

### [0.37.2](https://github.com/the-white-platform/fashion-web/compare/v0.37.1...v0.37.2) (2026-04-16)


### Bug Fixes

* **vto:** bump resultData max + log which provider served the request ([f491818](https://github.com/the-white-platform/fashion-web/commit/f491818310ea1c2c24331ee46eba47fba102e19a))

### [0.37.1](https://github.com/the-white-platform/fashion-web/compare/v0.37.0...v0.37.1) (2026-04-16)

## [0.37.0](https://github.com/the-white-platform/fashion-web/compare/v0.36.0...v0.37.0) (2026-04-16)


### Features

* **vto:** try Vertex AI first, fall back to Gemini Dev API ([6ce360f](https://github.com/the-white-platform/fashion-web/commit/6ce360fd43b7b5633a0f4b858947ed238f9502a6))

## [0.36.0](https://github.com/the-white-platform/fashion-web/compare/v0.35.0...v0.36.0) (2026-04-16)


### Features

* **vto:** hash-cache repeats, drop quota to 5, surface count in UI ([e132837](https://github.com/the-white-platform/fashion-web/commit/e1328378a695afcf9ef3aa29534b13db772d219c))

## [0.35.0](https://github.com/the-white-platform/fashion-web/compare/v0.34.0...v0.35.0) (2026-04-16)


### Features

* **products:** mirror search query to ?q= as the user types ([b9e631d](https://github.com/the-white-platform/fashion-web/commit/b9e631d1e0a829ea508f8ab91866808aeee248f9))

## [0.34.0](https://github.com/the-white-platform/fashion-web/compare/v0.33.0...v0.34.0) (2026-04-16)


### Features

* **vto:** cap Virtual Try-On at 10 per user per day (DB-backed) ([a6d3e0f](https://github.com/the-white-platform/fashion-web/commit/a6d3e0fafaf585172351e9ec2282565defa9d443))

## [0.33.0](https://github.com/the-white-platform/fashion-web/compare/v0.32.8...v0.33.0) (2026-04-16)


### Features

* **catalog:** wire HOT (and any tag) filter via /products?tag= ([2adda16](https://github.com/the-white-platform/fashion-web/commit/2adda16e012dc663bcc90742527ed38842401fc2))

### [0.32.8](https://github.com/the-white-platform/fashion-web/compare/v0.32.7...v0.32.8) (2026-04-16)

### [0.32.7](https://github.com/the-white-platform/fashion-web/compare/v0.32.6...v0.32.7) (2026-04-16)


### Bug Fixes

* **search,reviews:** wire header search; raw-SQL product-rating writes ([bb53030](https://github.com/the-white-platform/fashion-web/commit/bb530304cabead620d5f7d0f5c3fe9b3f2147600))

### [0.32.6](https://github.com/the-white-platform/fashion-web/compare/v0.32.5...v0.32.6) (2026-04-16)


### Bug Fixes

* **homepage:** hide "Shop By Activity" section when no categories configured ([504430a](https://github.com/the-white-platform/fashion-web/commit/504430a2028cb026276293dbeaef9367f67faee3))

### [0.32.5](https://github.com/the-white-platform/fashion-web/compare/v0.32.4...v0.32.5) (2026-04-16)

### [0.32.4](https://github.com/the-white-platform/fashion-web/compare/v0.32.3...v0.32.4) (2026-04-16)


### Bug Fixes

* **chatbot:** pass systemInstruction to getGenerativeModel, not startChat ([96ead71](https://github.com/the-white-platform/fashion-web/commit/96ead718cb9502498ce44473c6a8b79bf2277ae2))

### [0.32.3](https://github.com/the-white-platform/fashion-web/compare/v0.32.2...v0.32.3) (2026-04-16)


### Bug Fixes

* **auth:** don't bounce logged-in users to /login on refresh ([c7ff543](https://github.com/the-white-platform/fashion-web/commit/c7ff54382263ca5b4f66037aea1eaf45a8f6d1e0))

### [0.32.2](https://github.com/the-white-platform/fashion-web/compare/v0.32.1...v0.32.2) (2026-04-16)

### [0.32.1](https://github.com/the-white-platform/fashion-web/compare/v0.32.0...v0.32.1) (2026-04-16)


### Bug Fixes

* **checkout:** equal gaps between progress-step icons ([c0f829d](https://github.com/the-white-platform/fashion-web/commit/c0f829d574dd67314b3b71776dd4084c71e870a1))

## [0.32.0](https://github.com/the-white-platform/fashion-web/compare/v0.31.2...v0.32.0) (2026-04-16)


### Features

* **checkout:** allow removing line items from the order summary sidebar ([2f78862](https://github.com/the-white-platform/fashion-web/commit/2f788626c5711d7b7da6423c4cb1111ef0e566fb))

### [0.31.2](https://github.com/the-white-platform/fashion-web/compare/v0.31.1...v0.31.2) (2026-04-16)


### Bug Fixes

* **checkout:** order summary on left (desktop) / on top (mobile) ([e2f16de](https://github.com/the-white-platform/fashion-web/commit/e2f16def0b5332f9e93a4e0366ce1dc17a0100b3))

### [0.31.1](https://github.com/the-white-platform/fashion-web/compare/v0.31.0...v0.31.1) (2026-04-16)


### Bug Fixes

* **quickview:** hover-zoom only the image, not the carousel arrows/dots ([1356496](https://github.com/the-white-platform/fashion-web/commit/1356496c1a7578cd467eb5cf4b58c885a2263ecb))

## [0.31.0](https://github.com/the-white-platform/fashion-web/compare/v0.30.0...v0.31.0) (2026-04-16)


### Features

* **quickview:** collapse long descriptions with same Show More toggle ([3d8fa9b](https://github.com/the-white-platform/fashion-web/commit/3d8fa9b6f66904f85f89aae92e5e155b530cb28f))
* **quickview:** give product image more room + collapse long descriptions ([a110e19](https://github.com/the-white-platform/fashion-web/commit/a110e1915382ea38af161feb7fe5e3a1614bb913))

## [0.30.0](https://github.com/the-white-platform/fashion-web/compare/v0.29.0...v0.30.0) (2026-04-16)


### Features

* **homepage:** admin-editable feature highlights via PayloadCMS ([96135ab](https://github.com/the-white-platform/fashion-web/commit/96135ab1e17635c87f19bbd6f280f779adc8be94))

## [0.29.0](https://github.com/the-white-platform/fashion-web/compare/v0.28.3...v0.29.0) (2026-04-16)


### Features

* **vto:** remove the Tư Vấn Outfit AI mode switcher ([36e28ee](https://github.com/the-white-platform/fashion-web/commit/36e28ee67e712c496111ddcf66d3377183a89beb))

### [0.28.3](https://github.com/the-white-platform/fashion-web/compare/v0.28.2...v0.28.3) (2026-04-16)


### Bug Fixes

* **cart:** pass item.color to remove + quantity buttons ([71f0c27](https://github.com/the-white-platform/fashion-web/commit/71f0c2787eb74c52d2a03fbda1f0f096b7989a75))

### [0.28.2](https://github.com/the-white-platform/fashion-web/compare/v0.28.1...v0.28.2) (2026-04-16)


### Bug Fixes

* **orders:** empty variant 500 — server backfill + client variant tracking ([88b0947](https://github.com/the-white-platform/fashion-web/commit/88b09474a4f4e97c561e701dc81ef1144eb6222c))

### [0.28.1](https://github.com/the-white-platform/fashion-web/compare/v0.28.0...v0.28.1) (2026-04-16)


### Bug Fixes

* **checkout:** COD note text contrast on warning-tinted background ([6aff757](https://github.com/the-white-platform/fashion-web/commit/6aff75783269f1647fb1e7a19ffd025b70547b08))

## [0.28.0](https://github.com/the-white-platform/fashion-web/compare/v0.27.0...v0.28.0) (2026-04-16)


### Features

* **product:** wire Chia Sẻ button via Web Share API + clipboard fallback ([71c9089](https://github.com/the-white-platform/fashion-web/commit/71c9089afe7da69072e18a4dad62f95b585c59d5))

## [0.27.0](https://github.com/the-white-platform/fashion-web/compare/v0.26.0...v0.27.0) (2026-04-16)


### Features

* **footer:** drive Products column from real categories, not hardcoded i18n ([6535ede](https://github.com/the-white-platform/fashion-web/commit/6535ede041f1bd3e5bcd251316c00bc60046da74))

## [0.26.0](https://github.com/the-white-platform/fashion-web/compare/v0.25.1...v0.26.0) (2026-04-16)


### Features

* **checkout:** show QR only on confirmation; bank info also in order detail ([a49a187](https://github.com/the-white-platform/fashion-web/commit/a49a187eb279f7b829e8a74e77a7231cf38faeda))

### [0.25.1](https://github.com/the-white-platform/fashion-web/compare/v0.25.0...v0.25.1) (2026-04-16)


### Bug Fixes

* **checkout:** use one orderNumber across PaymentStep QR and ConfirmationStep ([cb2eaff](https://github.com/the-white-platform/fashion-web/commit/cb2eaffc2ad02ddccb755a65767c8ab77a3b7c28))

## [0.25.0](https://github.com/the-white-platform/fashion-web/compare/v0.24.0...v0.25.0) (2026-04-16)


### Features

* **homepage:** drop defaultProducts + defaultFilters fallback ([3242b53](https://github.com/the-white-platform/fashion-web/commit/3242b53811c4c6fd4df7d50c58dc52c27e1b5e25))

## [0.24.0](https://github.com/the-white-platform/fashion-web/compare/v0.23.6...v0.24.0) (2026-04-16)


### Features

* **checkout:** read bank details from PaymentMethods global (no fallback) ([3b3adc9](https://github.com/the-white-platform/fashion-web/commit/3b3adc9ae36a3988a7d9ed36a98bd90988585db7))

### [0.23.6](https://github.com/the-white-platform/fashion-web/compare/v0.23.5...v0.23.6) (2026-04-16)


### Bug Fixes

* **checkout:** let confirmation screen render after cart is cleared ([b69d004](https://github.com/the-white-platform/fashion-web/commit/b69d0040f1006c49d3c4e46315599547bc852bd1))

### [0.23.5](https://github.com/the-white-platform/fashion-web/compare/v0.23.4...v0.23.5) (2026-04-16)


### Code Refactoring

* **carousel:** CMS slides only, drop hardcoded fallback ([52f69ea](https://github.com/the-white-platform/fashion-web/commit/52f69ea06ec274edf9770b6e254b32fd04c4f2d8))

### [0.23.4](https://github.com/the-white-platform/fashion-web/compare/v0.23.3...v0.23.4) (2026-04-16)


### Performance Improvements

* **images:** serve Payload's 900px variant, not the 21 MB original ([eb8255c](https://github.com/the-white-platform/fashion-web/commit/eb8255c67ae9283bc35dc0f57c494f0206bfed18))

### [0.23.3](https://github.com/the-white-platform/fashion-web/compare/v0.23.2...v0.23.3) (2026-04-16)

### [0.23.2](https://github.com/the-white-platform/fashion-web/compare/v0.23.1...v0.23.2) (2026-04-16)

### [0.23.1](https://github.com/the-white-platform/fashion-web/compare/v0.23.0...v0.23.1) (2026-04-16)


### Bug Fixes

* **orders:** stock-decrement SQL — _locale is enum, use ::text IN ([3e0d6a2](https://github.com/the-white-platform/fashion-web/commit/3e0d6a2b262174bd6ddca60575fac13eaceaf812))

## [0.23.0](https://github.com/the-white-platform/fashion-web/compare/v0.22.27...v0.23.0) (2026-04-16)


### Features

* **orders:** decrement stock via raw SQL update (fast + deadlock-free) ([b0b1e1d](https://github.com/the-white-platform/fashion-web/commit/b0b1e1d109fa3a956ed5d9f37bca8f3e0dcb2788))

### [0.22.27](https://github.com/the-white-platform/fashion-web/compare/v0.22.26...v0.22.27) (2026-04-16)


### Bug Fixes

* **orders:** skip decrementStockAfterOrder — it was deadlocking the POST ([6ae3598](https://github.com/the-white-platform/fashion-web/commit/6ae3598ab79f3e49e35db881025a60d53806467a))

### [0.22.26](https://github.com/the-white-platform/fashion-web/compare/v0.22.25...v0.22.26) (2026-04-16)

### [0.22.25](https://github.com/the-white-platform/fashion-web/compare/v0.22.24...v0.22.25) (2026-04-16)

### [0.22.24](https://github.com/the-white-platform/fashion-web/compare/v0.22.23...v0.22.24) (2026-04-16)


### Bug Fixes

* **orders:** disable sendOrderEmails hook (was deadlocking the POST) ([90cd5f8](https://github.com/the-white-platform/fashion-web/commit/90cd5f8aebbf0364470c969cdd8368e265981ab0))

### [0.22.23](https://github.com/the-white-platform/fashion-web/compare/v0.22.22...v0.22.23) (2026-04-16)

### [0.22.22](https://github.com/the-white-platform/fashion-web/compare/v0.22.21...v0.22.22) (2026-04-16)

### [0.22.21](https://github.com/the-white-platform/fashion-web/compare/v0.22.20...v0.22.21) (2026-04-16)


### Bug Fixes

* **vto:** resolve Payload media URLs to GCS directly ([ba1dcfd](https://github.com/the-white-platform/fashion-web/commit/ba1dcfd5716f07be1e49123d3699e06cc7d4689c))

### [0.22.20](https://github.com/the-white-platform/fashion-web/compare/v0.22.19...v0.22.20) (2026-04-16)

### [0.22.19](https://github.com/the-white-platform/fashion-web/compare/v0.22.18...v0.22.19) (2026-04-15)


### Bug Fixes

* **vto:** portal to body + z-[200] so it overlays QuickView dialog ([764df7f](https://github.com/the-white-platform/fashion-web/commit/764df7f890a093d8bfc3ffaf96fea47bb3957324))

### [0.22.18](https://github.com/the-white-platform/fashion-web/compare/v0.22.17...v0.22.18) (2026-04-15)


### Bug Fixes

* **checkout:** drop duplicate user destructure from useUser in ShippingStep ([7aee1a7](https://github.com/the-white-platform/fashion-web/commit/7aee1a7a7bc6f4f8fed2b9fc198e3132575d307c))

### [0.22.17](https://github.com/the-white-platform/fashion-web/compare/v0.22.16...v0.22.17) (2026-04-15)

### [0.22.16](https://github.com/the-white-platform/fashion-web/compare/v0.22.15...v0.22.16) (2026-04-15)


### Bug Fixes

* **admin-bar:** staff-only + hidden on checkout/auth routes ([719f257](https://github.com/the-white-platform/fashion-web/commit/719f257a2299c96ff6e7b24090c458dce5d8af44))

### [0.22.15](https://github.com/the-white-platform/fashion-web/compare/v0.22.14...v0.22.15) (2026-04-15)

### [0.22.14](https://github.com/the-white-platform/fashion-web/compare/v0.22.13...v0.22.14) (2026-04-15)


### Bug Fixes

* **checkout/vto:** auto-fill name/phone from user, surface VTO error ([7f731c8](https://github.com/the-white-platform/fashion-web/commit/7f731c88c2075681baadc82c01dc20c30baf214d))

### [0.22.13](https://github.com/the-white-platform/fashion-web/compare/v0.22.12...v0.22.13) (2026-04-15)

### [0.22.12](https://github.com/the-white-platform/fashion-web/compare/v0.22.11...v0.22.12) (2026-04-15)


### Bug Fixes

* **i18n:** real contact info + missing common.edit key ([276022d](https://github.com/the-white-platform/fashion-web/commit/276022df88d70f126634127e988fca226189c551))

### [0.22.11](https://github.com/the-white-platform/fashion-web/compare/v0.22.10...v0.22.11) (2026-04-15)


### Bug Fixes

* **orders:** stop hanging the POST on email send when no provider configured ([6773a00](https://github.com/the-white-platform/fashion-web/commit/6773a00508e5e22a75bf1a3514af5df261254c09))

### [0.22.10](https://github.com/the-white-platform/fashion-web/compare/v0.22.9...v0.22.10) (2026-04-15)


### Bug Fixes

* **checkout:** address render, coupon i18n key + unlimited-uses logic ([54f8156](https://github.com/the-white-platform/fashion-web/commit/54f8156bd4b43ac5879b8f95ceba64e94b229c2a))

### [0.22.9](https://github.com/the-white-platform/fashion-web/compare/v0.22.8...v0.22.9) (2026-04-15)


### Bug Fixes

* **product:** extract description text from nested Lexical nodes ([6634f62](https://github.com/the-white-platform/fashion-web/commit/6634f62615ccb9f1e55a992218aadde4e5065bf6))

### [0.22.8](https://github.com/the-white-platform/fashion-web/compare/v0.22.7...v0.22.8) (2026-04-15)


### Bug Fixes

* **seed:** VI color locale, image ordering + SEED_SKIP_WIPE escape hatch ([5728f40](https://github.com/the-white-platform/fashion-web/commit/5728f406c36f91b513bb0467a78544badd8cfb0f))

### [0.22.7](https://github.com/the-white-platform/fashion-web/compare/v0.22.6...v0.22.7) (2026-04-15)

### [0.22.6](https://github.com/the-white-platform/fashion-web/compare/v0.22.5...v0.22.6) (2026-04-15)


### Bug Fixes

* **seed:** fall back to SEED_ASSETS_URL for gitignored images + preserve VI color translations ([04cf26c](https://github.com/the-white-platform/fashion-web/commit/04cf26c9525c229dcead27ca2595eddde8781618))

### [0.22.5](https://github.com/the-white-platform/fashion-web/compare/v0.22.4...v0.22.5) (2026-04-15)

### [0.22.4](https://github.com/the-white-platform/fashion-web/compare/v0.22.3...v0.22.4) (2026-04-15)

### [0.22.3](https://github.com/the-white-platform/fashion-web/compare/v0.22.2...v0.22.3) (2026-04-15)


### Bug Fixes

* **admin:** add GcsClientUploadHandler to importMap ([4ea1f5c](https://github.com/the-white-platform/fashion-web/commit/4ea1f5c9ff3e1dbe33532555b2636373da95389f))

### [0.22.2](https://github.com/the-white-platform/fashion-web/compare/v0.22.1...v0.22.2) (2026-04-15)

### [0.22.1](https://github.com/the-white-platform/fashion-web/compare/v0.22.0...v0.22.1) (2026-04-15)


### Bug Fixes

* **seed:** serialize per-variant image uploads to avoid sharp race ([ce57fc0](https://github.com/the-white-platform/fashion-web/commit/ce57fc0d4809673befdd9bec18a43b716b4029ce))

## [0.22.0](https://github.com/the-white-platform/fashion-web/compare/v0.21.0...v0.22.0) (2026-04-15)


### Features

* **seed:** align launch inventory, translate EN copy, add launch coupon ([bc46fda](https://github.com/the-white-platform/fashion-web/commit/bc46fdae7b1f854847822dfc1f3d1c00caa9731d))

## [0.21.0](https://github.com/the-white-platform/fashion-web/compare/v0.20.1...v0.21.0) (2026-04-15)


### Features

* **seed:** ship initial Payload migration for prod bootstrap ([885ac9e](https://github.com/the-white-platform/fashion-web/commit/885ac9e5776d3e5b3c2707fbac09f4da219409ad))

### [0.20.1](https://github.com/the-white-platform/fashion-web/compare/v0.20.0...v0.20.1) (2026-04-15)


### Bug Fixes

* **seed:** move drizzle-kit to prod deps for bootstrap schema push ([ccb702c](https://github.com/the-white-platform/fashion-web/commit/ccb702c85f6b98fc13b592e1472ae1d6c9f41a24))

## [0.20.0](https://github.com/the-white-platform/fashion-web/compare/v0.19.0...v0.20.0) (2026-04-15)


### Features

* **seed:** push Drizzle schema before seeding in bootstrap mode ([efeea00](https://github.com/the-white-platform/fashion-web/commit/efeea0057d4b8702c8c3e204682c6a085c642aac))

## [0.19.0](https://github.com/the-white-platform/fashion-web/compare/v0.18.0...v0.19.0) (2026-04-15)


### Features

* **seed:** add one-off bootstrap token path for empty-prod seeding ([452733b](https://github.com/the-white-platform/fashion-web/commit/452733ba107262b65f1b7c0c8a6f2d442a846364))

## [0.18.0](https://github.com/the-white-platform/fashion-web/compare/v0.17.2...v0.18.0) (2026-04-15)


### Features

* **seed:** clean media names, doc-sourced content, 8 SKU taxonomy ([01be51d](https://github.com/the-white-platform/fashion-web/commit/01be51ddca5e8d02a1e53fe77ad60819fdf1d1c3))


### Bug Fixes

* **auth:** add Payload v3 session to OAuth JWTs ([d4f735a](https://github.com/the-white-platform/fashion-web/commit/d4f735a0cd42acc96e011add4532a1aadac8e086))
* **ui:** align checkout payload, cart hydration, and product modal ([d452d91](https://github.com/the-white-platform/fashion-web/commit/d452d91f4227bc7045ad5d3bfcfbda3913d400da))

### [0.17.2](https://github.com/the-white-platform/fashion-web/compare/v0.17.1...v0.17.2) (2026-04-15)


### Bug Fixes

* **auth:** pass ID-token sub (not JWT) to fetchUserInfo ([8959a0d](https://github.com/the-white-platform/fashion-web/commit/8959a0de8183ed46c9b7a1a5c4a8bfababd30913))

### [0.17.1](https://github.com/the-white-platform/fashion-web/compare/v0.17.0...v0.17.1) (2026-04-15)


### Bug Fixes

* **auth:** pin Google OAuth redirect_uri to canonical server URL ([3197d42](https://github.com/the-white-platform/fashion-web/commit/3197d420a26d5c9c3ad2d6e7a91976a171c0156d))

## [0.17.0](https://github.com/the-white-platform/fashion-web/compare/v0.16.2...v0.17.0) (2026-04-15)


### Features

* implement all 25 feature specs (admin + user) ([787bd84](https://github.com/the-white-platform/fashion-web/commit/787bd840efd3ed71997eeda582302569bc36e856))
* v1 production readiness — real catalog, Gemini VTO, landing imagery, bug fixes ([cf10a5e](https://github.com/the-white-platform/fashion-web/commit/cf10a5e18b493b074869be3e8f21528ea76768da))


### Documentation

* add user guide, admin guide, QA guide, and architecture docs ([85d41b5](https://github.com/the-white-platform/fashion-web/commit/85d41b554325d8a0fae75cf20c00855f8f75910f))

### [0.16.2](https://github.com/the-white-platform/fashion-web/compare/v0.16.1...v0.16.2) (2026-03-29)


### Bug Fixes

* remove old migrations for fresh Neon DB setup ([71f71d5](https://github.com/the-white-platform/fashion-web/commit/71f71d5a1851740e992f2a164614805354897fe7))

### [0.16.1](https://github.com/the-white-platform/fashion-web/compare/v0.16.0...v0.16.1) (2026-03-29)


### Bug Fixes

* add @google/generative-ai to dependencies ([93b3778](https://github.com/the-white-platform/fashion-web/commit/93b3778e9481bfc68952d9efec7d448e207fce4e))

## [0.16.0](https://github.com/the-white-platform/fashion-web/compare/v0.15.0...v0.16.0) (2026-03-29)


### Documentation

* add admin missing features specs (RBAC, orders, inventory, reporting) ([4aeb6e5](https://github.com/the-white-platform/fashion-web/commit/4aeb6e51de7ea5a545f96ce5040d923a2970fa32))
* add notification and chat specs (admin inbox, email, push, newsletter, chat dashboard, live support, Zalo) ([5163d45](https://github.com/the-white-platform/fashion-web/commit/5163d45be56bcacb0db1a7237c0b0f76068112e3))
* add user-facing feature specs (account, reviews, compare, loyalty, recommendations) ([4b77cc5](https://github.com/the-white-platform/fashion-web/commit/4b77cc5911e168618256ca46a788de15449ceaa4))

## [0.15.0](https://github.com/the-white-platform/fashion-web/compare/v0.14.2...v0.15.0) (2026-03-28)


### Features

* add Gemini AI chat and VTO API routes ([4d064be](https://github.com/the-white-platform/fashion-web/commit/4d064becd8ad6f5b1fa121b8ed9375c60616625b))
* add multi-garment AI Outfit Advisor to VTO modal ([f4725ec](https://github.com/the-white-platform/fashion-web/commit/f4725ec36b1c4a51933221a96fe9615c1cc093a4))

### [0.14.2](https://github.com/the-white-platform/fashion-web/compare/v0.14.1...v0.14.2) (2026-03-28)


### Performance Improvements

* statically bundle Vietnamese translations for faster default locale ([aa0713f](https://github.com/the-white-platform/fashion-web/commit/aa0713fb03e806004a3dc61cab9818abd5ca0423))

### [0.14.1](https://github.com/the-white-platform/fashion-web/compare/v0.14.0...v0.14.1) (2026-03-28)


### Bug Fixes

* replace raw color classes with semantic theme tokens ([2509498](https://github.com/the-white-platform/fashion-web/commit/25094986daecd7bcf43d4c36b4acc4801025f25c))

## [0.14.0](https://github.com/the-white-platform/fashion-web/compare/v0.13.0...v0.14.0) (2026-03-28)


### Features

* add checkout hooks (useCheckout, useAddressCascade, useCoupon) ([468a134](https://github.com/the-white-platform/fashion-web/commit/468a134127a40a048831894dfd9994819b758321))
* add Coupons Payload collection ([01bb14c](https://github.com/the-white-platform/fashion-web/commit/01bb14cfe42069d6cec4124bbd88d63abacacdd7))
* add JSON-LD structured data to product detail pages ([d9243d8](https://github.com/the-white-platform/fashion-web/commit/d9243d876b2d68a9bed632858218fcea52747b87))
* add loading.tsx skeleton screens for key routes ([9a97fe1](https://github.com/the-white-platform/fashion-web/commit/9a97fe1d539e20aea9c5f444c306ece6e7183f63))
* add PageContainer layout component ([1969782](https://github.com/the-white-platform/fashion-web/commit/1969782ea4aad407ca2a53d4c95058dd348529b2))
* add shared checkout types and update Users collection ([f4b8ce9](https://github.com/the-white-platform/fashion-web/commit/f4b8ce908b3bd5b1c7635d87623fbd524ea67c86))
* add shared FeaturesBadges component ([2db14b5](https://github.com/the-white-platform/fashion-web/commit/2db14b576d8c6cc3bf1d35ca3be27229d956ec54))
* add shared ProductCard component ([70f70a9](https://github.com/the-white-platform/fashion-web/commit/70f70a9704ffb6c9b2039609cfa1429f3a54f385))
* create WishlistContext and unify wishlist state ([f4c5749](https://github.com/the-white-platform/fashion-web/commit/f4c5749ccdca63a157fd9e1361ac0923abb1dae4))
* increment coupon usage count on order creation ([9172bef](https://github.com/the-white-platform/fashion-web/commit/9172bef320103c20805f6c21ff93bd3fdb927043))
* persist cart to localStorage ([9a063f4](https://github.com/the-white-platform/fashion-web/commit/9a063f4fdd6ac270fefa9f238192846f57fb6ec8))


### Bug Fixes

* add image loading effect and remove GlobalModals double-fetch ([a7e23ce](https://github.com/the-white-platform/fashion-web/commit/a7e23ce504955b7446144f7d6a8bc3692217fcbc))
* replace next/link with locale-aware @/i18n/Link ([96db952](https://github.com/the-white-platform/fashion-web/commit/96db952c8865bd45fade53cbccbd31ea91febd5e))
* resolve react-hooks lint errors in orders and checkout pages ([67eeb97](https://github.com/the-white-platform/fashion-web/commit/67eeb978d5eecbae7ad4536a444f3349538806a2))
* update login and register pages for Payload auth ([e48e853](https://github.com/the-white-platform/fashion-web/commit/e48e8534825939934179c118fbed4bb1eacb0149))
* update Payload importMap.js with new admin component paths ([5a9083e](https://github.com/the-white-platform/fashion-web/commit/5a9083ec6fb508a62ff02a68b157202622c7f9f6))
* update remaining relative imports after shared component move ([0a33e18](https://github.com/the-white-platform/fashion-web/commit/0a33e18140cedfac93a3befe3e9fb40fda6a3a3f))


### Performance Improvements

* add dynamic imports for heavy modal components ([a5f325e](https://github.com/the-white-platform/fashion-web/commit/a5f325e327deeef1687da8c5777363f3111aab69))


### Documentation

* add Phase 2A logic decoupling design spec ([056c7ca](https://github.com/the-white-platform/fashion-web/commit/056c7cace425237506a816fb2676397c32cfa71d))


### Code Refactoring

* adopt PageContainer across inner pages ([9b03663](https://github.com/the-white-platform/fashion-web/commit/9b03663363cdd0b09fccdd321b9025a57356eb5d))
* adopt shared ProductCard in consumer components ([f038752](https://github.com/the-white-platform/fashion-web/commit/f038752e855ff3612171c4e3bb706af7da4e9a06))
* consolidate Product type to ProductForFrontend ([4c8e7b0](https://github.com/the-white-platform/fashion-web/commit/4c8e7b0294b80a54ba408282f8bf0986bfe5b17b))
* extract checkout step components into separate files ([e9231a4](https://github.com/the-white-platform/fashion-web/commit/e9231a4931c050f02170121f0e0f0b627484951c))
* fetch orders from Payload API instead of localStorage ([49849bf](https://github.com/the-white-platform/fashion-web/commit/49849bfe7e693f79abddb44b1f63bcb662cc7b92))
* move admin components to src/admin/ ([7a5f18f](https://github.com/the-white-platform/fashion-web/commit/7a5f18f28b1fe721c6a3cc8b86ddeb5ea681c750))
* move GlobalModals to src/components/ecommerce/ ([296c567](https://github.com/the-white-platform/fashion-web/commit/296c567bb35969d34d11bb9d40ee63faabf94fc1))
* move Header, Footer, AlternatingSection to components/layout/ ([a310437](https://github.com/the-white-platform/fashion-web/commit/a3104371034fda17de847e2e51177b39d900c0db))
* move shared components to src/components/shared/ ([6dac412](https://github.com/the-white-platform/fashion-web/commit/6dac412ecdadd87c28cf67e14da8f88b6fe0879a))
* rewrite checkout page as slim orchestrator ([ed89fc7](https://github.com/the-white-platform/fashion-web/commit/ed89fc7866d43f0152d938c5b8c3d84ad6b7151f))
* rewrite UserContext to use Payload REST API ([019dbaa](https://github.com/the-white-platform/fashion-web/commit/019dbaaf826dd7eaae0281e3cfe1593a560eab65))

## [0.13.0](https://github.com/the-white-platform/fashion-web/compare/v0.12.2...v0.13.0) (2026-03-04)


### Features

* **vto:** upgrade to virtual-try-on-001 model and improve image handling ([#34](https://github.com/the-white-platform/fashion-web/issues/34)) ([6753638](https://github.com/the-white-platform/fashion-web/commit/6753638b1c5e0caf9591bfdcef8484e70576ef2e))

### [0.12.2](https://github.com/the-white-platform/fashion-web/compare/v0.12.1...v0.12.2) (2026-03-04)


### Bug Fixes

* set turbopack.root to absolute path ([#33](https://github.com/the-white-platform/fashion-web/issues/33)) ([990c721](https://github.com/the-white-platform/fashion-web/commit/990c72104033be353e5a356f1c8ebbaf3138fe53))

### [0.12.1](https://github.com/the-white-platform/fashion-web/compare/v0.12.0...v0.12.1) (2026-03-03)

## [0.12.0](https://github.com/the-white-platform/fashion-web/compare/v0.11.1...v0.12.0) (2026-03-02)


### Features

* integrate Vertex AI Virtual Try-On with rate limiting ([#31](https://github.com/the-white-platform/fashion-web/issues/31)) ([234c941](https://github.com/the-white-platform/fashion-web/commit/234c9417edf2494514b6f35a52519f69a2284ea8))

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
