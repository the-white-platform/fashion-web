# User-Facing Missing Features — Overview

## Problem

The storefront has a complete e-commerce flow but several features are incomplete (profile edit, address/payment persistence, reviews mock data) or missing entirely (recently viewed, loyalty, recommendations). These gaps affect user retention and conversion.

## Scope

| # | Area | Specs | Depends On |
|---|------|-------|------------|
| 1 | [Profile & Auth](./01-account-profile-auth.md) + [Cart & Wishlist Sync](./02-account-cart-wishlist-sync.md) + [Address & Payment Persistence](./03-account-address-payment.md) | 3 files | Nothing |
| 2 | [Product Reviews](./04-product-reviews.md) | 1 file | Nothing |
| 3 | [Recently Viewed & Compare](./05-recently-viewed-compare.md) | 1 file | Nothing |
| 4 | [Loyalty & Rewards](./06-loyalty-rewards.md) + [Recommendations & Engagement](./07-recommendations-engagement.md) | 2 files | Reviews (for recommendation signals) |

## Implementation Order

1. Account fixes (specs 01-03) — fixes broken persistence, high impact
2. Product reviews (spec 04) — replaces mock data with real backend
3. Recently viewed & compare (spec 05) — lightweight, independent
4. Loyalty & engagement (specs 06-07) — largest scope, builds on orders + reviews data

All specs are independently valuable. Specs 01-03 are bug-fix level priority.

## Post-Implementation Checklist

After each spec:
- `pnpm generate:types`
- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm dev` — test affected user flows end-to-end
