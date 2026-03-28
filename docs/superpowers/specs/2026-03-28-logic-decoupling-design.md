# Logic Decoupling (Phase 2A) — Design Spec

**Date**: 2026-03-28
**Scope**: Phase 2A of 4 — Auth fix, checkout decomposition, Coupons collection, connect checkout to Payload Orders
**Goal**: Replace mock auth/checkout with real Payload-backed flows, decompose the 1222-line checkout into focused components and hooks, and build a manageable coupon system.

## Context

The fashion-web checkout flow currently saves orders exclusively to localStorage via a mock UserContext. The Payload Orders collection exists with full schema, stock management hooks, and admin UI — but receives zero orders from the frontend. Auth is also mock (localStorage-only email/password), though social login (Google/Facebook) correctly creates Payload users. This phase connects the frontend to the real backend.

**Depends on**: Phase 1 (component centralization) — completed.
**Deferred to Phase 2B**: Cart persistence, wishlist unification.

---

## 1. Auth Fix (Track 1)

### Problem

- `register()` stores credentials in `localStorage('thewhite-users')` — users vanish on storage clear
- `login()` accepts any non-empty password against localStorage records
- Profile mutations (`addShippingAddress`, etc.) update local state only — social login users lose changes on refresh
- Users collection has `access.create: authenticated`, blocking public registration

### Solution

Make UserContext a thin wrapper around Payload's REST API.

**UserContext changes:**

| Method | Before (mock) | After (Payload) |
|---|---|---|
| `register(name, email, password, phone)` | localStorage write | `POST /api/users` (public) |
| `login(email, password)` | localStorage read, any password works | `POST /api/users/login` (returns JWT, sets `payload-token` cookie) |
| `logout()` | Clear local state + localStorage | `POST /api/users/logout` (clears cookie) + clear local state |
| `updateProfile(data)` | `setUser()` + localStorage | `PATCH /api/users/:id` (with auth cookie) + update local state |
| `addShippingAddress(addr)` | Append to local array | `PATCH /api/users/:id` (append to `shippingAddresses` array) |
| `addPaymentMethod(method)` | Append to local array | `PATCH /api/users/:id` (append to `paymentMethods` array) |
| Init (mount) | `fetch('/api/users/me')` then localStorage fallback | `fetch('/api/users/me')` only — no localStorage fallback |

**Users collection changes (`src/collections/Users/index.ts`):**
- Add `phone` field (`text`, optional) — needed for registration and order contact
- Change `access.create` to `() => true` (allow public registration)
- Keep `access.read/update/delete` as `authenticated`

**Remove localStorage keys:** `thewhite-users`, `thewhite-user-data`, `thewhite-user` — all mock auth storage eliminated.

**Login/Register page updates:**
- `login/page.tsx`: Call `login()` which now hits Payload. On success, redirect. On failure, show Payload's error message.
- `register/page.tsx`: Call `register()` which now hits Payload. On success, auto-login and redirect.
- Both pages already have social login buttons — those continue working as-is.

**Profile page updates:**
- `profile/page.tsx`: All profile mutations now call the Payload-backed UserContext methods. Data persists across sessions.

---

## 2. Checkout Decomposition (Track 2)

### Problem

`checkout/page.tsx` is 1,222 lines containing 4 step views, all state management, address cascade logic, coupon logic, and order submission — all in one file.

### Solution

Extract into focused components and hooks.

**New file structure:**
```
src/app/(frontend)/[locale]/checkout/
├── page.tsx                        # Slim orchestrator (~80 lines)
├── components/
│   ├── ShippingStep.tsx            # Address selection + new address form
│   ├── PaymentStep.tsx             # Payment method selection + new method form
│   ├── ReviewStep.tsx              # Order summary, coupon, notes, place order button
│   ├── ConfirmationStep.tsx        # Success screen with order number
│   ├── CheckoutProgress.tsx        # Step indicator bar (shipping → payment → review)
│   └── AddressSelect.tsx           # Province/district/ward cascading combobox
├── hooks/
│   ├── useCheckout.ts              # Central orchestrator: step, address, payment, submission
│   ├── useAddressCascade.ts        # Province → district → ward fetching + state
│   └── useCoupon.ts                # Coupon application/removal
└── layout.tsx                      # Existing (hides header)
```

### Hook Interfaces

**`useCheckout`** — central orchestrator:
```tsx
interface UseCheckoutReturn {
  step: CheckoutStep
  setStep: (step: CheckoutStep) => void
  selectedAddress: ShippingAddress | null
  setSelectedAddress: (addr: ShippingAddress | null) => void
  selectedPayment: PaymentMethod | null
  setSelectedPayment: (method: PaymentMethod | null) => void
  orderNotes: string
  setOrderNotes: (notes: string) => void
  totals: { subtotal: number; shipping: number; discount: number; total: number }
  completeOrder: () => Promise<void>
  isSubmitting: boolean
  orderError: string | null
  orderResult: PayloadOrder | null  // returned order from API
}
```

**`useAddressCascade`** — province/district/ward cascade:
```tsx
interface UseAddressCascadeReturn {
  provinces: Array<{ id: string; code: string; name: string }>
  districts: Array<{ id: string; code: string; name: string }>
  wards: Array<{ id: string; code: string; name: string }>
  selectedProvince: { id: string; name: string } | null
  selectedDistrict: { id: string; name: string } | null
  selectedWard: { id: string; name: string } | null
  setProvince: (code: string) => void
  setDistrict: (code: string) => void
  setWard: (code: string) => void
  isLoading: boolean
}
```

**`useCoupon`** — coupon validation:
```tsx
interface UseCouponReturn {
  couponCode: string
  setCouponCode: (code: string) => void
  appliedCoupon: AppliedCoupon | null
  couponError: string
  applyCoupon: (subtotal: number) => Promise<void>
  removeCoupon: () => void
}
```

### Component Props

Each step component receives only what it needs:
- `ShippingStep`: `user`, `selectedAddress`, `onSelectAddress`, `onNext`
- `PaymentStep`: `user`, `selectedPayment`, `onSelectPayment`, `onBack`, `onNext`
- `ReviewStep`: `cartItems`, `totals`, `coupon hooks`, `orderNotes`, `onBack`, `onComplete`, `isSubmitting`
- `ConfirmationStep`: `orderResult`

---

## 3. Coupons Collection (Track 3)

### New Collection: `src/collections/Coupons.ts`

| Field | Type | Notes |
|---|---|---|
| `code` | text, unique, required, uppercase | e.g. `WELCOME10` |
| `type` | select: `percentage` / `fixed` / `shipping` | |
| `value` | number, required | % for percentage, VND for fixed, 0 for shipping |
| `description` | text, localized | Display text (Vietnamese + English) |
| `minOrderAmount` | number, default: 0 | Minimum subtotal to apply |
| `maxDiscount` | number | Cap for percentage coupons |
| `usageLimit` | number, default: 0 | 0 = unlimited |
| `usageCount` | number, default: 0 | Incremented on order creation |
| `validFrom` | date | |
| `validUntil` | date | |
| `active` | checkbox, default: true | Admin toggle |

**Access control:**
- `read: () => true` — anyone can validate a coupon
- `create/update/delete: authenticated` — admin only

**Seed data:** Migrate the 3 existing mock coupons (WELCOME10, FREESHIP, SAVE50K) as Payload documents.

**Validation flow in `useCoupon` hook:**
1. `GET /api/coupons?where[code][equals]=CODE&where[active][equals]=true`
2. Check `validFrom <= now <= validUntil`
3. Check `usageCount < usageLimit` (if usageLimit > 0)
4. Check `subtotal >= minOrderAmount`
5. Calculate discount: cap percentage coupons at `maxDiscount`

**Usage increment:** In Orders `afterChange` hook, when a new order is created with a `couponCode`, increment the coupon's `usageCount`.

---

## 4. Address Model Fix

### ShippingAddress Interface (shared across UserContext, checkout, orders)

```tsx
interface ShippingAddress {
  id: string              // unique identifier
  name: string            // recipient name
  phone: string           // recipient phone
  address: string         // street line
  province: { id: string; name: string }  // Payload province relationship + display name
  district: { id: string; name: string }  // Payload district relationship + display name
  ward: { id: string; name: string }      // Payload ward relationship + display name
  isDefault: boolean
}
```

This replaces the old `{ city: string, district: string, ward: string }` format.

**Where this impacts:**
- `UserContext` — `user.shippingAddresses` array shape
- `useAddressCascade` — returns `{ id, name }` objects instead of plain strings
- `ShippingStep` — stores and displays address objects
- `useCheckout.completeOrder()` — maps `province.id` / `district.id` / `ward.id` to Payload Order fields
- Users collection `shippingAddresses` sub-fields — already have `city/district/ward` as relationships, just need to ensure the frontend sends IDs

---

## 5. Convergence — Connect Checkout to Payload Orders

After tracks 1-3 complete, `useCheckout.completeOrder()` calls `POST /api/orders`:

```tsx
const orderData = {
  customerInfo: {
    customerName: user.fullName || selectedAddress.name,
    customerEmail: user.email,
    customerPhone: user.phone || selectedAddress.phone,
    user: user.id,  // relationship to Users collection
  },
  shippingAddress: {
    address: selectedAddress.address,
    city: selectedAddress.province.id,      // relationship ID
    district: selectedAddress.district.id,  // relationship ID
    ward: selectedAddress.ward.id,          // relationship ID
    notes: orderNotes,
  },
  items: cartItems.map(item => ({
    product: item.id,           // relationship to Products
    productName: item.name,     // snapshot
    variant: item.color || '',  // color variant name
    size: item.size,
    quantity: item.quantity,
    unitPrice: item.price,
    lineTotal: item.price * item.quantity,
    productImage: item.image,   // snapshot
  })),
  payment: {
    method: selectedPayment.type,  // mapped to Payload select options
    paymentStatus: 'pending',
  },
  totals: {
    subtotal: totals.subtotal,
    shippingFee: totals.shipping,
    discount: totals.discount,
    total: totals.total,
    couponCode: appliedCoupon?.code || '',
  },
}
```

**Payload handles:**
- `beforeChange`: `validateStockBeforeOrder` (check stock), auto-generate `orderNumber`
- `afterChange`: `decrementStockAfterOrder` (reduce stock), increment coupon usage count

**Error handling:**
- Stock insufficient → show specific error with product/size that's out of stock
- Network error → generic retry message
- Validation error → show Payload's error messages

**Remove `user.orderHistory` JSON field:** Orders are now in the Orders collection. The profile/orders pages query `GET /api/orders?where[customerInfo.user][equals]=userId` instead of reading from the user object.

---

## 6. Verification Plan

### Automated
1. `npx tsc --noEmit` — no new type errors
2. `pnpm lint` — no new lint errors
3. `pnpm build` — production build succeeds
4. `pnpm generate:types` — after Coupons collection is added

### Manual
1. Register a new user (email/password) → user appears in Payload admin
2. Login with registered credentials → session persists across refresh
3. Social login (Google) → still works, user record updated
4. Add shipping address in profile → saved to Payload, persists on refresh
5. Add products to cart → proceed to checkout
6. In checkout: select address, select payment, apply coupon code
7. Place order → order appears in Payload admin Orders list
8. Verify stock decremented for ordered products
9. Verify order appears in user's orders page (`GET /api/orders`)
10. Verify accounting dashboard shows the new order
11. Try placing order with out-of-stock item → proper error shown
12. Apply invalid coupon → error shown
13. Apply expired coupon → error shown

---

## 7. Out of Scope

- **Cart persistence** — deferred to Phase 2B
- **Wishlist unification** — deferred to Phase 2B
- **Payment gateway integration** — all payments stay as "pending" status
- **Email notifications** — no order confirmation emails yet
- **Order status updates from frontend** — admin-only for now
