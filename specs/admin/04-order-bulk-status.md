# Spec 04: Bulk Order Status Updates

## Summary

Custom admin view allowing staff+ to select multiple orders and change their status in one action.

## Depends On

- Spec 02 (RBAC)
- Spec 03 (activity log — so bulk changes are tracked)

## Custom Admin View: `/admin/bulk-orders`

### UI Components

1. **Filter bar**: dropdown to filter orders by current status
2. **Orders table**: checkbox column, order number, customer name, current status, total, date
3. **Action bar**: "Change Status To" dropdown + "Apply" button
4. **Confirmation**: show count of selected orders before applying

### Behavior

- Fetches orders via Payload REST API with status filter
- Selected order IDs sent to custom endpoint
- After success, table refreshes and shows result summary
- Errors shown per-order if any fail

## Custom Endpoint: `POST /api/bulk-order-status`

### New File: `src/endpoints/bulkOrderStatus.ts`

**Request:**
```json
{
  "orderIds": [1, 2, 3],
  "newStatus": "shipping"
}
```

**Logic:**
- Verify user has staff+ role
- Process orders sequentially (not parallel — avoids stock race conditions)
- Each update goes through normal Payload `update()` so all hooks fire (activity log, stock management)
- Return `{ success: number[], failed: { id, error }[] }`

**Response:**
```json
{
  "success": [1, 2],
  "failed": [{ "id": 3, "error": "Cannot transition from cancelled to shipping" }]
}
```

## New Files

- `src/admin/BulkOrderStatus/index.tsx` — custom view (use client)
- `src/admin/BulkOrderStatusLink.tsx` — nav link component
- `src/endpoints/bulkOrderStatus.ts` — custom endpoint

## Modified Files

- `src/payload.config.ts` — register view, nav link, endpoint

## Verification

- Navigate to `/admin/bulk-orders`
- Filter by "pending" status
- Select multiple orders, change to "confirmed"
- Verify all selected orders updated
- Verify activity log entries created for each
- Verify staff role can access, customer role cannot
