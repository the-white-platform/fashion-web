# Spec 05: Returns / RMA

## Summary

Add a return request field group on Orders for managing product returns and refunds.

## Depends On

- Spec 02 (RBAC)
- Spec 03 (activity log — return changes are logged)

## New Field Group: `returnRequest` (on Orders)

**Visibility condition:** only shown when order status is `delivered` or `refunded`.

| Sub-field | Type | Description |
|-----------|------|-------------|
| `returnStatus` | select | none, requested, approved, rejected, received, refunded |
| `returnReason` | textarea | Customer's reason for return |
| `returnItems` | array | Items being returned |
| `returnItems.product` | relationship (products) | Product |
| `returnItems.variant` | text | Color variant |
| `returnItems.size` | text | Size |
| `returnItems.quantity` | number (min 1) | Quantity |
| `refundAmount` | number | Amount to refund |
| `returnRequestedAt` | date (dayAndTime) | When return was requested |

All labels localized (vi/en).

## Hook: Return Management

### New File: `src/collections/Orders/hooks/returnManagement.ts`

`beforeChange` hook — triggers when `returnRequest.returnStatus` changes:

| Transition | Action |
|------------|--------|
| -> `received` | Restore stock for each item in `returnItems` (reuse logic from `restoreStockOnCancel`) |
| -> `refunded` | Set `order.status = 'refunded'`, `payment.paymentStatus = 'refunded'` |

All transitions append to `activityLog` with action `return_requested` or `refund`.

## Files to Modify

- `src/collections/Orders.ts` — add `returnRequest` group, register hook
- New: `src/collections/Orders/hooks/returnManagement.ts`

## Verification

- Create a delivered order
- Set `returnStatus` to `requested` -> verify activity log entry
- Set to `approved`, then `received` -> verify stock restored
- Set to `refunded` -> verify order status changes to refunded, payment status changes
- Verify `returnRequest` group is hidden for non-delivered orders
