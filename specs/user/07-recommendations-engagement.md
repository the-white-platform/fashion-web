# Spec 07: Recommendations, Re-Order & Engagement

## Summary

Personalized product recommendations, one-click re-order, and referral program to boost engagement and repeat purchases.

## 1. Personalized Recommendations

### Recommendation Engine

#### New File: `src/utilities/recommendations.ts`

Server-side utility that generates product recommendations based on signals:

**Signals (in priority order):**
1. **Purchase history** — products in the same category as past orders
2. **Browsing history** — recently viewed product categories (from localStorage, sent as query param)
3. **Similar products** — same category + similar price range as current product
4. **Popular products** — highest `reviewCount` and order frequency (fallback)

**Function:**
```
getRecommendations({ userId?, productId?, categoryIds?, limit }) => Product[]
```

Logic:
1. If `userId`: query orders for user, extract product categories, find other products in those categories not yet purchased
2. If `productId`: find products in same category, similar price (±30%), exclude current
3. If `categoryIds` (from browsing): find popular products in those categories
4. Fallback: products sorted by `reviewCount` desc + `featured: true`
5. Deduplicate, shuffle slightly for variety, limit results

### Display Locations

| Location | Signal | Label |
|----------|--------|-------|
| Home page (logged in) | Purchase history + browsing | "Goi y cho ban" / "Recommended for You" |
| Home page (guest) | Popular | "San pham pho bien" / "Popular Products" |
| Product detail | Similar products | "Co the ban cung thich" / "You May Also Like" |
| Cart page | Based on cart items' categories | "Ket hop voi" / "Goes Well With" |
| Post-checkout confirmation | Purchase history | "Mua tiep" / "Continue Shopping" |
| Empty cart | Browsing history or popular | "Kham pha" / "Explore" |

#### New File: `src/components/ecommerce/Recommendations.tsx`

Reusable component:
- Props: `type` (for-you | similar | cart-based | popular), `productId?`, `limit`
- Horizontal scrollable product card row
- Fetches recommendations via API or server component data passing
- Loading skeleton state

### API Route (for client-side fetching)

#### New File: `src/app/api/recommendations/route.ts`

`GET /api/recommendations?type=similar&productId=123&limit=8`

Server-side logic using `getRecommendations()`. Caches results for 5 minutes per unique query.

## 2. Re-Order (Buy Again)

### Order History Enhancement

#### Modified File: `src/app/(frontend)/[locale]/orders/page.tsx`

Add "Buy Again" button on each delivered order card.

#### Modified File: `src/app/(frontend)/[locale]/orders/[id]/page.tsx`

Add "Re-order" button on order detail page + "Buy Again" button per individual item.

### Behavior

**Re-order entire order:**
1. For each item in the order: add to cart with same variant/size/quantity
2. Skip items that are out of stock (show toast: "X items were out of stock")
3. Open cart drawer after adding
4. User proceeds to checkout normally

**Buy again single item:**
1. Add single item to cart with same variant/size
2. If out of stock: show "Out of stock" toast, disable button
3. Open cart drawer

### New Utility

#### New File: `src/utilities/reorder.ts`

```
reorderItems(orderItems[], addToCart) => { added: number, skipped: string[] }
```

Checks stock availability via product data before adding.

### Profile Quick Access

#### Modified File: `src/app/(frontend)/[locale]/profile/page.tsx`

In the Orders tab, add "Buy Again" button on each order row (same as orders page).

## 3. Referral Program

### New Collection: `referrals`

#### New File: `src/collections/Referrals.ts`

| Field | Type | Description |
|-------|------|-------------|
| `referrer` | relationship (users), required | User who shared the referral |
| `referee` | relationship (users) | User who signed up via referral |
| `referralCode` | text, unique | Referrer's unique code |
| `status` | select | pending, completed, expired |
| `referrerReward` | select | pending, credited | Whether referrer got points |
| `refereeReward` | select | pending, credited | Whether referee got discount |
| `completedAt` | date | When referee's first order was delivered |

**Admin config:**
- `defaultColumns`: referrer, referee, status, createdAt
- `group`: { vi: 'Tiep thi', en: 'Marketing' }

**Access:**
- read: own (referrer) + admin
- create: server-only
- update: server-only
- delete: admin

### Referral Code Generation

#### Modified File: `src/collections/Users/index.ts`

Add field:

| Field | Type | Description |
|-------|------|-------------|
| `referralCode` | text, unique, readOnly | Auto-generated on user creation (e.g., "TW-ABCD12") |

Hook: `beforeChange` on create — generate unique 8-char code.

### Referral Flow

1. **Share**: User gets their referral link from profile/loyalty page: `{SITE_URL}/register?ref=TW-ABCD12`
2. **Register**: New user signs up via referral link
   - `ref` code stored in cookie/localStorage
   - On registration: create `referrals` document with `referrer` + `referee`, status `pending`
   - Referee gets a welcome coupon (e.g., 10% off first order) — auto-created in `coupons` collection
3. **Complete**: When referee's first order is delivered:
   - Set referral status to `completed`
   - Award referrer 200 loyalty points (via loyalty system from Spec 06)
   - Mark `referrerReward: 'credited'`

### Referral UI

#### New Section in: `src/app/(frontend)/[locale]/loyalty/page.tsx`

Add "Refer a Friend" section:
- Show user's referral code and shareable link
- Copy link button
- Share buttons (WhatsApp, Zalo, Facebook, email)
- Stats: total referrals, successful referrals, points earned from referrals
- List of referral statuses (pending/completed)

#### Modified File: `src/app/(frontend)/[locale]/register/page.tsx`

- Read `ref` query param
- Store in localStorage
- Show "Referred by a friend — you'll get 10% off your first order!" banner
- Pass ref code to registration API

## Files

### New Files
- `src/utilities/recommendations.ts`
- `src/components/ecommerce/Recommendations.tsx`
- `src/app/api/recommendations/route.ts`
- `src/utilities/reorder.ts`
- `src/collections/Referrals.ts`

### Modified Files
- `src/app/(frontend)/[locale]/page.tsx` — add Recommendations section
- `src/app/(frontend)/[locale]/products/[id]/page.tsx` — add Recommendations
- `src/app/(frontend)/[locale]/orders/page.tsx` — add "Buy Again" button
- `src/app/(frontend)/[locale]/orders/[id]/page.tsx` — add "Re-order" + "Buy Again"
- `src/app/(frontend)/[locale]/profile/page.tsx` — add "Buy Again" on orders tab
- `src/app/(frontend)/[locale]/loyalty/page.tsx` — add referral section
- `src/app/(frontend)/[locale]/register/page.tsx` — handle ref code
- `src/collections/Users/index.ts` — add referralCode field
- `src/payload.config.ts` — register Referrals collection
- Cart/checkout components — recommendations in empty cart + post-checkout

## Verification

**Recommendations:**
- Logged-in user with orders -> "Recommended for You" shows relevant products
- Guest user -> "Popular Products" shows top-rated items
- Product detail page -> "You May Also Like" shows same-category products
- No duplicate products in recommendations

**Re-order:**
- Click "Buy Again" on delivered order -> all items added to cart
- Out-of-stock items skipped with toast notification
- Single item "Buy Again" -> only that item added

**Referral:**
- Copy referral link -> share -> new user registers via link
- Referee sees "10% off" banner on register page
- Referee gets welcome coupon
- Referee's first order delivered -> referrer gets 200 points
- Referral dashboard shows correct stats
