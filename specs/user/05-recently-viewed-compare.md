# Spec 05: Recently Viewed Products & Product Comparison

## Summary

Track recently viewed products and allow side-by-side product comparison.

## 1. Recently Viewed Products

### New Context

#### New File: `src/contexts/RecentlyViewedContext.tsx`

**State:**
- `recentItems[]` — array of `{ productId, viewedAt }`, max 20 items

**Storage:** localStorage key `thewhite_recently_viewed`

**API:**
- `addViewed(productId)` — add to front of list, deduplicate, trim to 20
- `getRecentProducts()` — returns product IDs in order
- `clearRecent()` — clear all

### Integration: Product Detail Page

#### Modified File: `src/app/(frontend)/[locale]/products/[id]/page.tsx` (or client counterpart)

On mount: call `addViewed(productId)`.

### UI: Recently Viewed Section

#### New File: `src/components/ecommerce/RecentlyViewed.tsx`

- Horizontal scrollable row of product cards (4-6 visible)
- Shows on: product detail page (below related products), home page (if has items)
- Fetches product data: `GET /api/products?where[id][in]={ids}&limit=10`
- Empty state: hidden (don't show section if no items)

### Display Locations

| Page | Position | Max Items |
|------|----------|-----------|
| Product detail | Below related products | 10 |
| Home page | Before newsletter section | 6 |
| Cart (empty state) | Suggestion section | 4 |

### Provider Registration

#### Modified File: `src/providers/index.tsx`

Add `<RecentlyViewedProvider>` to provider hierarchy.

## 2. Product Comparison

### New Context

#### New File: `src/contexts/CompareContext.tsx`

**State:**
- `compareItems[]` — array of product IDs, max 4 items

**Storage:** localStorage key `thewhite_compare`

**API:**
- `addToCompare(productId)` — add (max 4, show toast if full)
- `removeFromCompare(productId)` — remove
- `isInCompare(productId)` — check
- `clearCompare()` — clear all

### UI: Compare Button on Product Cards

#### Modified Files: Product card components

Add a "Compare" icon button (scales icon) on product cards and product detail page:
- Toggle: adds/removes from compare list
- Active state: highlighted icon
- Disabled if 4 items already selected and this product isn't one of them

### UI: Compare Floating Bar

#### New File: `src/components/ecommerce/CompareBar.tsx`

Fixed bottom bar (visible when compareItems.length > 0):
- Shows thumbnail + name for each selected product (up to 4)
- "X" button on each to remove
- "Compare ({count})" button — navigates to `/compare`
- "Clear All" link
- Minimum 2 items required to compare

### Compare Page

#### New File: `src/app/(frontend)/[locale]/compare/page.tsx`

Side-by-side comparison table:

| Attribute | Product A | Product B | Product C | Product D |
|-----------|-----------|-----------|-----------|-----------|
| Image | thumbnail | thumbnail | thumbnail | thumbnail |
| Name | — | — | — | — |
| Price | — | — | — | — |
| Original Price | — | — | — | — |
| Category | — | — | — | — |
| Rating | stars | stars | stars | stars |
| Colors | swatches | swatches | swatches | swatches |
| Sizes | list | list | list | list |
| In Stock | yes/no | yes/no | yes/no | yes/no |
| Tag | — | — | — | — |
| Description | truncated | truncated | truncated | truncated |
| Features | key-value | key-value | key-value | key-value |

Features:
- "Add to Cart" button per product (with size selector)
- "Add to Wishlist" button per product
- "Remove" button per column
- Highlight differences (different values get a subtle background color)
- Responsive: on mobile, horizontal scroll with sticky first column (attribute names)
- Empty state: "Select at least 2 products to compare" with link to products page

Data fetched via: `GET /api/products?where[id][in]={ids}&depth=1`

### Provider Registration

#### Modified File: `src/providers/index.tsx`

Add `<CompareProvider>` to provider hierarchy.

## Files

### New Files
- `src/contexts/RecentlyViewedContext.tsx`
- `src/contexts/CompareContext.tsx`
- `src/components/ecommerce/RecentlyViewed.tsx`
- `src/components/ecommerce/CompareBar.tsx`
- `src/app/(frontend)/[locale]/compare/page.tsx`

### Modified Files
- `src/providers/index.tsx` — add both providers
- `src/app/(frontend)/[locale]/products/[id]/page.tsx` — track recently viewed, add compare button
- Product card components — add compare toggle button
- `src/app/(frontend)/[locale]/page.tsx` — add RecentlyViewed section

## Verification

- Visit 5 products -> RecentlyViewed shows them in reverse order (most recent first)
- Visit same product twice -> no duplicate
- Visit 21 products -> oldest dropped, only 20 stored
- Clear localStorage -> recently viewed empty, section hidden
- Add 2 products to compare -> floating bar appears
- Click "Compare" -> comparison page with side-by-side table
- Add 4 products -> 5th shows "max reached" toast
- Remove from compare -> floating bar updates
- Mobile: comparison table scrolls horizontally
- Compare page with 0-1 products -> shows "select at least 2" message
