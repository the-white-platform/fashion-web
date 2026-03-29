# Spec 03: Address & Payment Method Persistence

## Summary

Fix address update/delete and payment method CRUD to persist to the backend instead of only updating local state.

## Current State

- `addShippingAddress()` — PATCHes to server (works)
- `updateShippingAddress()` — local state only (broken)
- `deleteShippingAddress()` — local state only (broken)
- All payment method operations — local state only with `crypto.randomUUID()` IDs (broken)

## Address Persistence Fix

### Modified File: `src/contexts/UserContext.tsx`

**`updateShippingAddress(id, data)`:**
1. Find address in local array by ID, update fields
2. PATCH `/api/users/{userId}` with full `shippingAddresses` array
3. On success: update local state
4. On failure: revert local state, show error toast

**`deleteShippingAddress(id)`:**
1. Filter address out of local array
2. PATCH `/api/users/{userId}` with filtered `shippingAddresses` array
3. On success: update local state
4. On failure: revert local state, show error toast
5. If deleting the default: auto-set first remaining address as default

**`setDefaultAddress(id)`:**
1. Update `isDefault` flags in local array
2. PATCH to server
3. Feedback via toast

### Profile Page: Address Edit UI

#### Modified File: `src/app/(frontend)/[locale]/profile/page.tsx`

Add to the Addresses tab:
- "Edit" button on each address card -> inline edit form or modal
- "Delete" button with confirmation dialog
- "Set as default" button
- "Add new address" button with the cascading province/district/ward form (reuse from checkout `ShippingStep`)
- Form fields: name, phone, address, province, district, ward, isDefault

## Payment Method Persistence Fix

### Modified File: `src/contexts/UserContext.tsx`

**`addPaymentMethod(data)`:**
1. Add to local array (Payload generates ID on server)
2. PATCH `/api/users/{userId}` with full `paymentMethods` array
3. On success: refresh user data from server (to get real ID)
4. On failure: revert, show error toast

**`updatePaymentMethod(id, data)`:**
1. Update in local array
2. PATCH to server with full array
3. On success: update local state

**`deletePaymentMethod(id)`:**
1. Filter from local array
2. PATCH to server
3. Handle default reassignment

### Profile Page: Payment Method UI

#### Modified File: `src/app/(frontend)/[locale]/profile/page.tsx`

Add to the Payment Methods tab:
- "Add payment method" button
- Add form: type select (COD, Bank Transfer, MoMo, VNPay), card/account number
- "Edit" / "Delete" / "Set as default" on each card
- Confirmation dialog for delete

## Checkout Integration

### Modified File: `src/app/(frontend)/[locale]/checkout/page.tsx` (or ShippingStep)

When a logged-in user adds a new address during checkout:
1. Save to user's `shippingAddresses` via `addShippingAddress()`
2. Address persists for future orders (currently it doesn't)

Same for payment methods added during checkout.

## Files

### Modified Files
- `src/contexts/UserContext.tsx` — fix all address/payment CRUD to PATCH server
- `src/app/(frontend)/[locale]/profile/page.tsx` — add edit/delete/add UI for addresses and payment methods
- Checkout components (ShippingStep, PaymentStep) — save new entries to user profile

## Verification

- Add address in profile -> refresh -> still there
- Edit address -> refresh -> changes persist
- Delete address -> refresh -> removed
- Set default address -> refresh -> correct default
- Same for payment methods
- Add address during checkout while logged in -> appears in profile
- Delete last address -> no crash, empty state shown
- Test with slow network -> optimistic UI + revert on failure
