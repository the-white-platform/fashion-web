# Spec 03: Order Activity Log

## Summary

Add an auto-populated activity log (timeline) to the Orders collection that tracks all status changes, payment updates, and admin notes.

## Depends On

- Spec 02 (RBAC access matrix)

## New Field: `activityLog` (array on Orders)

| Sub-field | Type | Description |
|-----------|------|-------------|
| `action` | select | created, status_change, payment_update, note, return_requested, refund |
| `timestamp` | date (dayAndTime) | When the action occurred |
| `fromValue` | text | Previous value |
| `toValue` | text | New value |
| `performedBy` | relationship (users) | Who made the change |
| `note` | text | Optional comment |

**Admin config:**
- Read-only (users cannot manually edit)
- Localized labels (vi/en)

## Hook: `beforeChange`

### New File: `src/collections/Orders/hooks/activityLog.ts`

Logic:
1. On **create** operation: append `{ action: 'created', timestamp: now, performedBy: req.user.id }`
2. On **update** operation, compare `previousDoc` with `data`:
   - `status` changed -> append `{ action: 'status_change', from: old, to: new }`
   - `payment.paymentStatus` changed -> append `{ action: 'payment_update', from: old, to: new }`
   - `adminNotes` changed -> append `{ action: 'note', toValue: new note content }`

All entries auto-set `timestamp` and `performedBy` from `req.user`.

## Files to Modify

- `src/collections/Orders.ts` — add `activityLog` field, register hook
- New: `src/collections/Orders/hooks/activityLog.ts`

## Verification

- Create an order -> verify "created" entry in log
- Change order status -> verify "status_change" with from/to values
- Update payment status -> verify "payment_update" entry
- Verify log entries are read-only in admin UI
- Verify `performedBy` is populated with the acting user
