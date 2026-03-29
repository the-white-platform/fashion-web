# Spec 02: RBAC — Collection Access Matrix

## Summary

Update all collection access controls to use the role-based functions from `src/access/roles.ts`.

## Depends On

- Spec 01 (roles.ts + User role field)

## Access Matrix

| Collection | read | create | update | delete |
|---|---|---|---|---|
| **Products** | anyone | adminOrEditor | adminOrEditor | admin |
| **Orders** | own (customer) / all (staff+) | anyone | staff+ (status only for staff) | admin |
| **Coupons** | staff+ | adminOrEditor | adminOrEditor | admin |
| **Pages** | authenticatedOrPublished | adminOrEditor | adminOrEditor | admin |
| **Posts** | authenticatedOrPublished | adminOrEditor | adminOrEditor | admin |
| **Media** | anyone | adminOrEditor | adminOrEditor | admin |
| **Categories** | anyone | adminOrEditor | adminOrEditor | admin |
| **Users** | self + admin | public (API) / admin (panel) | self + admin | admin |
| **Provinces** | anyone | admin | admin | admin |
| **Districts** | anyone | admin | admin | admin |
| **Wards** | anyone | admin | admin | admin |

## Orders — Field-Level Access

Staff can only update:
- `status` field

Admin/editor only:
- `payment` group (paymentStatus, transactionId, paidAt)
- `totals` group (subtotal, shippingFee, discount, total)
- `adminNotes`
- `fulfillment` group (carrier, trackingNumber, shippedAt, deliveredAt)

## Files to Modify

- `src/collections/Products.ts`
- `src/collections/Orders.ts`
- `src/collections/Coupons.ts`
- `src/collections/Pages.ts`
- `src/collections/Posts/index.ts`
- `src/collections/Media.ts`
- `src/collections/Categories.ts`
- `src/collections/Users/index.ts`
- `src/collections/VietnamAddresses.ts` (Provinces, Districts, Wards)

## Verification

- Log in as each role (admin, editor, staff, customer)
- Verify admin panel access is denied for customer
- Verify staff can read orders but only update status
- Verify editor cannot delete products or manage users
- Verify admin has full access
