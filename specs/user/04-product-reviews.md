# Spec 04: Product Reviews

## Summary

Replace mock review data with a real backend collection. Users can submit reviews for purchased products, view verified reviews, vote helpful, and admins can moderate.

## New Collection: `reviews`

### New File: `src/collections/Reviews.ts`

| Field | Type | Description |
|-------|------|-------------|
| `product` | relationship (products), required | Reviewed product |
| `user` | relationship (users), required | Reviewer |
| `order` | relationship (orders) | The order containing this product (for verified badge) |
| `rating` | number, required | 1-5 stars |
| `title` | text | Review headline |
| `comment` | textarea, required | Review body |
| `fit` | select | tight, perfect, loose (optional) |
| `sizeOrdered` | text | Size the reviewer ordered |
| `height` | number | Reviewer's height in cm (optional) |
| `weight` | number | Reviewer's weight in kg (optional) |
| `images` | array of upload (media) | Review photos (max 5) |
| `verified` | checkbox, readOnly | True if order confirmed (computed by hook) |
| `helpfulCount` | number, readOnly | Number of helpful votes |
| `helpfulVoters` | array of relationship (users) | Who voted helpful (for dedup) |
| `status` | select | pending, approved, rejected | Moderation status |
| `adminReply` | textarea | Admin response to review |
| `adminReplyAt` | date | When admin replied |

**Admin config:**
- `useAsTitle`: title (or product name fallback)
- `defaultColumns`: product, user, rating, status, createdAt
- `group`: { vi: 'Thuong mai', en: 'Commerce' }
- `timestamps`: true

**Access:**
- read: anyone (only approved reviews shown on frontend)
- create: authenticated (must be logged in)
- update: own review (before approval) + admin
- delete: admin

### Hook: Verified Purchase Check

`beforeChange` hook on create:
1. Query orders where `user = reviewer` and `items.product = product` and `status in [delivered, confirmed]`
2. If found: set `verified: true` and `order: matchedOrder.id`
3. If not found: `verified: false`

### Hook: Auto-Approve (Optional)

`beforeChange` hook: if `verified === true`, auto-set `status: 'approved'`. Unverified reviews go to `pending` for moderation.

## Frontend: Submit Review

### Modified File: `src/components/ecommerce/ProductReviews.tsx`

Replace mock data with real API calls:

**Display reviews:**
- `GET /api/reviews?where[product][equals]={productId}&where[status][equals]=approved&sort=-createdAt`
- Paginate (10 per page)
- Filter by rating
- Sort by: recent, highest rating, most helpful

**Submit review form:**
- Visible only if user is authenticated
- Check if user already reviewed this product (hide form if yes)
- Fields: rating (star selector), title, comment, fit, sizeOrdered, height, weight, images (drag-drop upload)
- `POST /api/reviews` with product ID + form data
- On success: "Review submitted" (if verified: appears immediately; if unverified: "pending moderation")

**Helpful vote:**
- "Was this helpful?" button on each review
- `PATCH /api/reviews/{id}` to increment `helpfulCount` and add user to `helpfulVoters`
- One vote per user per review (check `helpfulVoters` includes current user)

**Admin reply display:**
- Show `adminReply` below the review with "Store Response" label and date

## Product Rating Summary

### Modified File: `src/collections/Products.ts`

Add computed fields (updated via hook when reviews change):

| Field | Type | Description |
|-------|------|-------------|
| `averageRating` | number, readOnly | Average of approved review ratings |
| `reviewCount` | number, readOnly | Count of approved reviews |

### New Hook: `src/collections/Reviews/hooks/updateProductRating.ts`

`afterChange` hook on review create/update/delete:
1. Query all approved reviews for the product
2. Calculate average rating and count
3. Update the product document

### Product Cards

Show rating stars + review count on product cards in listing/search results. Use `averageRating` and `reviewCount` from product document (no extra query needed).

## Admin Moderation

Reviews appear in admin panel under Commerce group. Admins can:
- Filter by status (pending/approved/rejected)
- Approve or reject reviews
- Reply to reviews (adminReply field)
- Delete inappropriate reviews

## Files

### New Files
- `src/collections/Reviews.ts`
- `src/collections/Reviews/hooks/verifyPurchase.ts`
- `src/collections/Reviews/hooks/updateProductRating.ts`

### Modified Files
- `src/collections/Products.ts` — add averageRating, reviewCount fields
- `src/components/ecommerce/ProductReviews.tsx` — real API integration
- `src/payload.config.ts` — register Reviews collection

## Verification

- Submit review for purchased product -> verified badge, auto-approved
- Submit review for non-purchased product -> pending moderation
- Admin approves review -> appears on product page
- Admin rejects review -> hidden from product page
- Vote helpful -> count increases, can't vote twice
- Product card shows average rating and count
- Admin replies to review -> reply visible on product page
- Delete all reviews -> product shows "No reviews yet"
