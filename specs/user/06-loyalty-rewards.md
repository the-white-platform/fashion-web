# Spec 06: Loyalty & Rewards System

## Summary

Points-based loyalty program where customers earn points from purchases and reviews, and redeem points for discounts.

## New Collection: `loyalty-accounts`

### New File: `src/collections/LoyaltyAccounts.ts`

One document per user:

| Field | Type | Description |
|-------|------|-------------|
| `user` | relationship (users), unique, required | Account owner |
| `points` | number | Current available points balance |
| `lifetimePoints` | number | Total points ever earned |
| `tier` | select | bronze, silver, gold, platinum | Current tier |
| `tierUpdatedAt` | date | When tier last changed |

**Admin config:**
- `useAsTitle`: user
- `defaultColumns`: user, points, tier, lifetimePoints
- `group`: { vi: 'Tiep thi', en: 'Marketing' }

**Access:**
- read: own + admin
- create: server-only (auto-created on first purchase)
- update: server-only (points modified by hooks only)
- delete: admin

## New Collection: `loyalty-transactions`

### New File: `src/collections/LoyaltyTransactions.ts`

Immutable log of all point changes:

| Field | Type | Description |
|-------|------|-------------|
| `user` | relationship (users), required | Account owner |
| `type` | select | earn_purchase, earn_review, earn_referral, redeem, expire, adjustment |
| `points` | number | Points change (positive = earn, negative = redeem) |
| `balance` | number | Balance after this transaction |
| `description` | text | Human-readable description |
| `order` | relationship (orders) | Related order (if applicable) |
| `review` | relationship (reviews) | Related review (if applicable) |
| `expiresAt` | date | When these earned points expire (optional) |

**Admin config:**
- `defaultColumns`: user, type, points, balance, createdAt
- `group`: { vi: 'Tiep thi', en: 'Marketing' }
- `timestamps`: true

**Access:**
- read: own + admin
- create: server-only
- update: nobody (immutable)
- delete: admin

## Points Rules

### Earning

| Action | Points | Condition |
|--------|--------|-----------|
| Purchase | 1 point per 10,000 VND spent | Order status = delivered |
| Write review | 50 points | Review approved |
| Write verified review | 100 points | Review approved + verified purchase |
| Referral | 200 points | Referred user's first order delivered |

### Redemption

- 100 points = 10,000 VND discount
- Minimum redemption: 100 points
- Cannot redeem more than order total
- Applied as a discount in checkout (alongside coupons)

### Tiers

| Tier | Lifetime Points | Perks |
|------|----------------|-------|
| Bronze | 0+ | Base earn rate |
| Silver | 1,000+ | 1.25x earn rate |
| Gold | 5,000+ | 1.5x earn rate + free shipping on orders > 500k VND |
| Platinum | 15,000+ | 2x earn rate + free shipping always + early access |

Tier is recalculated on every point earn based on `lifetimePoints`.

### Expiry

Points expire 12 months after earning if unused. A scheduled job (or `beforeChange` hook on order) checks and expires old points.

## Hooks

### New File: `src/collections/Orders/hooks/loyaltyEarn.ts`

`afterChange` hook — when order status changes to `delivered`:
1. Calculate points: `Math.floor(order.totals.total / 10000) * tierMultiplier`
2. Find or create `loyalty-accounts` for user
3. Create `loyalty-transactions` with type `earn_purchase`
4. Update account `points` and `lifetimePoints`
5. Recalculate tier

### New File: `src/collections/Reviews/hooks/loyaltyEarnReview.ts`

`afterChange` hook — when review status changes to `approved`:
1. Award 50 points (or 100 if verified)
2. Create transaction, update account

## Checkout Integration

### Modified File: Checkout ReviewStep or `useCheckout` hook

Add "Use Points" section in checkout review step:
- Show available points balance
- Input: number of points to redeem (slider or input)
- Auto-calculate discount: `points / 100 * 10000` VND
- Discount applied alongside coupon (stacks)
- Points deducted on order creation (`redeem` transaction)

### Modified File: `src/collections/Orders.ts`

Add fields to totals group:

| Field | Type | Description |
|-------|------|-------------|
| `pointsRedeemed` | number | Points used for this order |
| `pointsDiscount` | number | Discount amount from points (VND) |

## Frontend: Loyalty Dashboard

### New File: `src/app/(frontend)/[locale]/loyalty/page.tsx`

User's loyalty page:
- **Summary card**: current tier (with badge/icon), points balance, tier progress bar to next tier
- **Points history**: table of recent transactions (earn/redeem) with date, type, points, balance
- **Tier benefits**: explain perks of current and next tier
- **How to earn**: list of earning actions with points values

### Modified File: `src/app/(frontend)/[locale]/profile/page.tsx`

Add loyalty summary to profile page — points balance, tier badge, link to `/loyalty`.

## Files

### New Files
- `src/collections/LoyaltyAccounts.ts`
- `src/collections/LoyaltyTransactions.ts`
- `src/collections/Orders/hooks/loyaltyEarn.ts`
- `src/collections/Reviews/hooks/loyaltyEarnReview.ts`
- `src/app/(frontend)/[locale]/loyalty/page.tsx`

### Modified Files
- `src/collections/Orders.ts` — pointsRedeemed/pointsDiscount fields, redeem hook
- `src/payload.config.ts` — register collections
- Checkout components — points redemption UI
- `src/app/(frontend)/[locale]/profile/page.tsx` — loyalty summary

## Verification

- Place and deliver an order -> points earned based on total
- Check loyalty transaction log -> earn_purchase entry with correct points
- Write approved review -> 50/100 points earned
- Redeem points at checkout -> discount applied, points deducted
- Reach Silver tier threshold -> tier upgrades, earn rate increases
- View loyalty page -> correct balance, history, tier info
- Points expire after 12 months (test with backdated data)
