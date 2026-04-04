# The White — QA Testing Guide

**Hướng dẫn kiểm thử / QA & Testing Guide**

---

## Table of Contents

1. [E2E Test Suite](#e2e-test-suite)
2. [Test Matrix](#test-matrix)
   - [Authentication](#authentication-tests)
   - [Products](#product-tests)
   - [Cart](#cart-tests)
   - [Checkout](#checkout-tests)
   - [Orders](#order-tests)
   - [Reviews](#review-tests)
   - [Profile & Addresses](#profile--address-tests)
   - [Wishlist](#wishlist-tests)
   - [Loyalty](#loyalty-tests)
   - [Compare](#compare-tests)
   - [Recently Viewed](#recently-viewed-tests)
   - [Admin RBAC](#admin-rbac-tests)
   - [Security](#security-tests)
   - [i18n](#i18n-tests)
3. [Security Checklist](#security-checklist)
4. [Edge Cases](#edge-cases)
5. [Known Limitations](#known-limitations)

---

## E2E Test Suite

### Running Tests

```bash
# Run all E2E tests (starts dev server automatically)
pnpm exec playwright test

# Run a specific test file
pnpm exec playwright test e2e/auth/login.spec.ts

# Run with UI mode (interactive)
pnpm exec playwright test --ui

# Run in CI mode (no retries, single worker)
CI=true pnpm exec playwright test

# Show HTML report after run
pnpm exec playwright show-report
```

### Configuration

File: `playwright.config.ts`

| Setting | Value |
|---|---|
| Test directory | `./e2e` |
| Base URL | `http://localhost:3000` |
| Browser | Chromium (Desktop Chrome) |
| Locale | `vi-VN` |
| Parallel workers | 3 (local), 1 (CI) |
| Timeout per test | 60 seconds |
| Retries | 0 (local), 2 (CI) |
| Web server | `pnpm dev` (auto-started) |

### Test Structure

```
e2e/
├── auth/
│   ├── login.spec.ts
│   ├── logout.spec.ts
│   ├── register.spec.ts
│   └── forgot-password.spec.ts
├── products/
│   ├── listing.spec.ts
│   ├── detail.spec.ts
│   ├── search.spec.ts
│   ├── compare.spec.ts
│   └── recently-viewed.spec.ts
├── cart/
│   └── operations.spec.ts
├── checkout/
│   ├── flow.spec.ts
│   └── coupons.spec.ts
├── orders/
│   ├── history.spec.ts
│   └── detail.spec.ts
├── reviews/
│   ├── create.spec.ts
│   └── display.spec.ts
├── profile/
│   ├── edit.spec.ts
│   ├── addresses.spec.ts
│   └── wishlist.spec.ts
├── loyalty/
│   └── dashboard.spec.ts
├── admin/
│   └── rbac.spec.ts
├── security/
│   ├── auth-access.spec.ts
│   ├── api-access.spec.ts
│   └── injection.spec.ts
└── i18n/
    └── locale.spec.ts
```

Total test files: **18** across **14** categories. Total tests: approximately **159**.

---

## Test Matrix

### Authentication Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| AUTH-01 | Register with valid data | No existing account | Fill name, email, password, submit | Account created, success message shown |
| AUTH-02 | Register with duplicate email | Account with email exists | Submit form with same email | Error: email already in use |
| AUTH-03 | Register with short password | — | Submit with password < 8 chars | Validation error shown |
| AUTH-04 | Login with correct credentials | Account exists and verified | Enter email/password, submit | Redirect to homepage, user menu visible |
| AUTH-05 | Login with wrong password | Account exists | Enter correct email, wrong password | Error message, no redirect |
| AUTH-06 | Login with unregistered email | — | Enter unknown email | Error message shown |
| AUTH-07 | Logout | Logged in | Click logout in user menu | Session cleared, redirected to login |
| AUTH-08 | Forgot password — valid email | Account exists | Enter email, submit | Success message shown |
| AUTH-09 | Forgot password — unknown email | — | Enter unknown email | Error or generic message |
| AUTH-10 | Google OAuth redirect | — | Click "Login with Google" | Redirected to Google consent page |
| AUTH-11 | Facebook OAuth redirect | — | Click "Login with Facebook" | Redirected to Facebook consent page |

### Product Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| PROD-01 | Product listing page loads | Products seeded | Navigate to `/vi/products` | Product cards render with name and price |
| PROD-02 | Product detail page loads | Product exists | Navigate to `/vi/products/[slug]` | Name, price, gallery, color swatches visible |
| PROD-03 | Color variant selection | Product has multiple colors | Click color swatch | Images update to selected variant |
| PROD-04 | Size selection | Product has sizes | Click a size button | Size highlighted as selected |
| PROD-05 | Out-of-stock size disabled | Size has 0 quantity | Inspect size button | Button is disabled/visually indicated |
| PROD-06 | Search returns results | Products seeded | Search for known product name | Matching products shown |
| PROD-07 | Search with no results | — | Search for nonsense string | "No results" state shown |
| PROD-08 | Compare button adds product | — | Click compare on product card | Product added to compare bar |
| PROD-09 | Compare bar appears | 1+ items in compare | Add product to compare | Floating bar visible at bottom |
| PROD-10 | Recently viewed tracking | — | Visit 3 product pages | Products appear in recently viewed section |

### Cart Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| CART-01 | Add item to cart | Product available | Select size, click Add to Cart | Cart count increments, toast shown |
| CART-02 | Update quantity | Item in cart | Use +/− buttons | Quantity and line total update |
| CART-03 | Remove item | Item in cart | Click trash/remove icon | Item removed, cart count decrements |
| CART-04 | Cart persists after reload | Item in cart | Reload page | Cart items still present |
| CART-05 | Empty cart state | Empty cart | Open cart | "Giỏ hàng trống" (Empty cart) shown |
| CART-06 | Cannot add out-of-stock | Size is 0 stock | Select out-of-stock size | Add to Cart button disabled |

### Checkout Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| CHK-01 | Empty cart redirects | Empty cart | Navigate to `/vi/checkout` | "Giỏ hàng trống" shown |
| CHK-02 | Shipping step renders | Cart has items | Navigate to checkout | "Giao Hàng" step heading visible |
| CHK-03 | Progress bar shows steps | Cart has items | Open checkout | Giao Hàng, Thanh Toán, Xác Nhận steps visible |
| CHK-04 | Fill shipping form | Cart has items | Fill all required fields | Form accepts input |
| CHK-05 | Proceed to payment step | Shipping form valid | Click Tiếp Theo | "Thanh Toán" heading appears |
| CHK-06 | Payment options displayed | On payment step | — | COD and bank transfer options visible |
| CHK-07 | Apply valid coupon | Valid coupon in DB | Enter code, click Apply | Discount shown, total reduced |
| CHK-08 | Apply invalid coupon | — | Enter wrong code | Error message shown |
| CHK-09 | Apply expired coupon | Expired coupon in DB | Enter expired code | Error: coupon expired |
| CHK-10 | Redeem loyalty points | User has points | Enter point amount, apply | Points discount applied to total |
| CHK-11 | Order summary shows items | Cart has items | On any checkout step | Item names and total visible in sidebar |

### Order Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| ORD-01 | Order history page loads | Logged in, orders exist | Navigate to `/vi/orders` | Order list rendered |
| ORD-02 | Order detail page loads | Logged in, order exists | Click order in list | Items, address, status visible |
| ORD-03 | Order status badge shown | Order has status | View order list | Status badge colored and labeled correctly |
| ORD-04 | Return request form visible | Order status is delivered | Open order detail | Return request section visible |
| ORD-05 | Re-order adds items to cart | Logged in, past order | Click Buy Again | Cart populated with order items |
| ORD-06 | Cannot view other user's order | Logged in as customer | Request another user's order ID via API | 403 or 404 response |

### Review Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| REV-01 | Review form renders | Logged in, has delivered order | Visit product page | Review form visible |
| REV-02 | Submit valid review | Logged in | Fill rating, title, body, submit | Success message, review in moderation |
| REV-03 | Cannot review without purchase | Logged in, no purchase | Attempt to submit review | Error: purchase required |
| REV-04 | Verified badge on approved review | Review linked to order | View approved review | "Đã mua hàng" badge visible |
| REV-05 | Reviews display on product page | Approved reviews exist | Visit product page | Rating breakdown and review list shown |
| REV-06 | Helpful vote increments | Review visible | Click "Hữu ích" | Count increments |

### Profile & Address Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| PROF-01 | Profile page loads | Logged in | Navigate to `/vi/profile` | Name, email, phone visible |
| PROF-02 | Edit name and phone | Logged in | Update fields, save | Changes saved and reflected |
| PROF-03 | Add shipping address | Logged in | Fill address form, save | Address appears in address list |
| PROF-04 | Set default address | Multiple addresses | Click "Set as default" | Address marked as default |
| PROF-05 | Delete shipping address | Address exists | Click delete | Address removed from list |

### Wishlist Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| WISH-01 | Add to wishlist | — | Click heart icon on product | Icon fills, product added |
| WISH-02 | Wishlist page shows items | Items in wishlist | Navigate to `/vi/wishlist` | Products listed |
| WISH-03 | Remove from wishlist | Item in wishlist | Click heart again or remove | Item removed from list |
| WISH-04 | Wishlist persists for logged-in user | Logged in | Add item, log out, log in again | Item still in wishlist |
| WISH-05 | Empty wishlist state | Empty wishlist | View wishlist page | Empty state message shown |

### Loyalty Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| LOY-01 | Loyalty dashboard loads | Logged in | Navigate to `/vi/loyalty` | Points balance, tier, and history visible |
| LOY-02 | Points earned on delivered order | Order delivered | Check loyalty account | Points added per order total |
| LOY-03 | Tier upgrade on milestone | Sufficient lifetime points | Review loyalty account | Tier updated to Silver/Gold/Platinum |
| LOY-04 | Points redemption at checkout | User has points | Enter points at Step 3 | Discount applied and points deducted on order |
| LOY-05 | Cannot redeem more than balance | — | Enter amount > balance | Error shown, form blocked |

### Compare Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| CMP-01 | Add product to compare | — | Click Compare on product | Product added to compare bar |
| CMP-02 | Compare page loads | 2+ products added | Navigate to `/vi/compare` | Side-by-side comparison visible |
| CMP-03 | Remove product from compare | Products in compare | Click × on compare bar | Product removed |
| CMP-04 | Maximum 4 products | 4 products in compare | Try to add 5th | 5th product not added, error/warning shown |
| CMP-05 | Empty compare state | No products added | Navigate to `/vi/compare` | Empty state shown |

### Recently Viewed Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| RV-01 | Products tracked on visit | — | Visit 3 product pages | All 3 appear in recently viewed |
| RV-02 | Maximum 20 items tracked | — | Visit 21 different products | Oldest product removed, 20 remain |
| RV-03 | No duplicates | — | Visit same product twice | Product appears once (moved to front) |
| RV-04 | Persists on reload | Products viewed | Reload page | Recently viewed still present |

### Admin RBAC Tests

| ID | Description | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| RBAC-01 | Admin can read all users | Admin token | GET `/api/users` | Returns all user docs |
| RBAC-02 | Editor cannot read all users | Editor token | GET `/api/users` | Returns only own user |
| RBAC-03 | Staff can read all orders | Staff token | GET `/api/orders` | Returns all orders |
| RBAC-04 | Customer cannot access admin | Customer token | GET `/api/users` with another user's ID | 403 or filtered |
| RBAC-05 | Editor can create products | Editor token | POST `/api/products` | 201 Created |
| RBAC-06 | Staff cannot create products | Staff token | POST `/api/products` | 403 Forbidden |
| RBAC-07 | Admin can delete any collection | Admin token | DELETE request | 200 OK |
| RBAC-08 | Non-admin cannot change roles | Editor token | PATCH `/api/users/{id}` with role change | Role field not updated |
| RBAC-09 | Customer cannot read others' orders | Customer A token | GET `/api/orders?where[customerInfo.user][equals]={B-id}` | Empty results |
| RBAC-10 | Editor cannot export CSV | — | Staff token → GET `/api/export-csv` | 403 Forbidden |

### Security Tests

| ID | Description | Steps | Expected Result |
|---|---|---|---|
| SEC-01 | Unauthenticated checkout | No session, direct API POST to orders | 401 or blocked |
| SEC-02 | JWT forgery attempt | Submit malformed JWT header | 401 Unauthorized |
| SEC-03 | SQL injection in search | Enter `'; DROP TABLE--` in search field | Input sanitized, no DB error |
| SEC-04 | XSS in review body | Submit `<script>alert(1)</script>` in review | Content escaped, no script execution |
| SEC-05 | XSS in product name | Admin creates product with script tag | Content escaped in storefront |
| SEC-06 | Coupon enumeration | Brute-force coupon codes | Rate limiting or consistent response timing |
| SEC-07 | IDOR on order detail | Logged in as user A, request order ID belonging to user B | 404 or 403 |
| SEC-08 | Admin endpoint without auth | GET `/api/export-csv` without token | 403 Forbidden |
| SEC-09 | Mass assignment — role escalation | POST `/api/users` with `role: admin` as anonymous | Role set to `customer` |

### i18n Tests

| ID | Description | Steps | Expected Result |
|---|---|---|---|
| I18N-01 | Vietnamese locale route | Navigate to `/vi/products` | Page renders in Vietnamese |
| I18N-02 | English locale route | Navigate to `/en/products` | Page renders in English |
| I18N-03 | Locale switch persists | Switch language via switcher | All subsequent pages use selected locale |
| I18N-04 | Product name localized | View product in VI vs EN | Name changes per locale where translated |
| I18N-05 | Order status labels localized | View order in VI vs EN | Status labels show in correct language |
| I18N-06 | Date formatting locale | View dates on orders page | Dates formatted per locale convention |

---

## Security Checklist

### RBAC Enforcement

- [ ] Every API route that modifies data checks the authenticated user's role.
- [ ] The `role` field on `users` can only be updated by Admin role users (`adminFieldAccess`).
- [ ] `adminNotes`, `payment`, and `totals` fields on orders are restricted to Admin/Editor.
- [ ] Staff can read orders but cannot update payment or totals fields.

### Unauthenticated Access

- [ ] `/api/users` without auth returns 401.
- [ ] `/api/orders` without auth returns 401.
- [ ] `/api/loyalty-accounts` without auth returns 401.
- [ ] Product and category endpoints remain publicly readable (intentional).

### API Access Control

- [ ] `POST /api/bulk-order-status` requires Admin/Editor/Staff token.
- [ ] `GET /api/export-csv` requires Admin/Editor token.
- [ ] `POST /api/send-newsletter` requires Admin/Editor token.
- [ ] Chat stream endpoint validates conversation ownership or admin role.

### XSS Prevention

- [ ] All user-submitted text (reviews, notes, addresses) is escaped in the storefront.
- [ ] Rich text content from Lexical editor is sanitized on render.
- [ ] No `dangerouslySetInnerHTML` is used with user-supplied content without sanitization.

### SQL Injection

- [ ] All database queries use Payload's query builder (parameterized) — no raw SQL.
- [ ] Search inputs are passed through Payload's `where` clause, not string interpolation.

### Rate Limiting

- [ ] Checkout endpoint should not allow high-frequency coupon testing (enumeration protection).
- [ ] Password reset endpoint should limit repeated requests for the same email.

### Coupon Enumeration

- [ ] The coupon validation endpoint returns consistent response times regardless of whether a code exists.
- [ ] Expired and invalid codes return similar error messages (avoid leaking validity info).

---

## Edge Cases

### Out-of-Stock Checkout

| Scenario | Expected Behavior |
|---|---|
| Product goes out of stock while in cart | `validateStockBeforeOrder` hook throws an error before order is created |
| Checkout attempted with 0-stock item | Error returned, order not created, stock not decremented |
| Multiple simultaneous orders for last item | First order succeeds; second receives stock validation error |

### Expired Coupons

| Scenario | Expected Behavior |
|---|---|
| Coupon `validUntil` is in the past | Validation rejects the code with "coupon expired" error |
| Coupon `validFrom` is in the future | Validation rejects with "coupon not yet valid" |
| Coupon `usageLimit` reached | Rejected with "coupon usage limit reached" |
| Coupon `active = false` | Rejected as invalid |

### Compare — Maximum Items

| Scenario | Expected Behavior |
|---|---|
| Add 4th item to compare | Compare bar shows 4 items |
| Attempt to add 5th item | Action blocked; warning or toast shown |
| Compare page with 1 item | Comparison renders (single-column), no crash |

### Recently Viewed — Maximum Items

| Scenario | Expected Behavior |
|---|---|
| View 21 products sequentially | List contains 20 items; oldest dropped |
| View same product twice | Product moves to front; no duplicate |
| Clear localStorage | Recently viewed resets to empty |

### Loyalty — Insufficient Points

| Scenario | Expected Behavior |
|---|---|
| Attempt to redeem more than balance | Form validation blocks submission |
| Redeem 0 points | No error; no discount applied |
| Points balance is exactly sufficient | Redemption succeeds |
| Account has no loyalty record | Checkout does not crash; points section shows 0 |

---

## Known Limitations

### Email (Resend)

- All transactional emails (order confirmation, password reset, email verification, newsletter) require a valid `RESEND_API_KEY` environment variable.
- In local development without `RESEND_API_KEY`, email sending is silently skipped (no error) but the action completes.
- The sender domain `thewhite.vn` must be verified in the Resend dashboard for production use.

### Push Notifications (VAPID)

- Browser push notifications require `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` to be configured.
- Without VAPID keys, the push subscription registration will fail silently in the browser.
- Push notifications are not supported in all browsers (notably iOS Safari has limited support).
- The service worker must be served over HTTPS in production (works on `localhost` for development).

### Zalo Integration

- Chat conversations from Zalo require `ZALO_OA_ACCESS_TOKEN` and a registered Zalo OA (Official Account).
- The Zalo webhook (`/api/zalo/webhook`) must be publicly accessible and registered in the Zalo OA management portal.
- Without Zalo configuration, web chat still functions; Zalo channel is simply unavailable.

### Google / Facebook OAuth

- OAuth login requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, and `FACEBOOK_APP_SECRET`.
- Redirect URIs must be registered in the respective developer consoles.
- Without these keys, OAuth buttons will return a 500 error.

### Homepage and Product Listing SSR

- The homepage (`/vi/`) and product listing (`/vi/products`) are server-rendered and query the database on each request.
- In local development with a large dataset or slow PostgreSQL connection, initial page loads may be slow (3–10 seconds).
- Use `pnpm dev` with a local PostgreSQL instance for best performance during development.

### Vietnam Address Data

- The province/district/ward dropdowns depend on the `VietnamAddresses` collections being seeded.
- Run `GET /api/seed` (admin only) or the seed script to populate address data before testing checkout.
- Without address data, the shipping address form dropdowns will be empty and the form cannot be completed.
