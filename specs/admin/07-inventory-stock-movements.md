# Spec 07: Stock Movements Collection

## Summary

Immutable log collection tracking all stock changes (sales, cancellations, returns, manual adjustments).

## Depends On

- Spec 02 (RBAC)

## New Collection: `stock-movements`

### New File: `src/collections/StockMovements.ts`

| Field | Type | Description |
|-------|------|-------------|
| `product` | relationship (products) | Which product |
| `variant` | text | Color variant name |
| `size` | text | Size |
| `type` | select | sale, cancellation, return, restock, adjustment |
| `quantity` | number | Change amount (negative for deductions) |
| `previousStock` | number | Stock before change |
| `newStock` | number | Stock after change |
| `order` | relationship (orders) | Related order (optional) |
| `performedBy` | relationship (users) | Who triggered it |
| `note` | text | Optional |

**Admin config:**
- `useAsTitle`: auto (id)
- `defaultColumns`: product, variant, size, type, quantity, createdAt
- `group`: Commerce (vi: 'Thuong mai')
- `timestamps`: true

**Access control:**
- read: staff+
- create: adminOrEditor
- update: nobody (immutable)
- delete: admin only

## Integration with Existing Hooks

### Modified File: `src/collections/Orders/hooks/stockManagement.ts`

Update `decrementStockAfterOrder`:
- After decrementing stock, create a stock-movement with type `sale`

Update `restoreStockOnCancel`:
- After restoring stock, create a stock-movement with type `cancellation`

Each movement records `previousStock`, `newStock`, related `order`, and `performedBy`.

## Files

- New: `src/collections/StockMovements.ts`
- Modified: `src/collections/Orders/hooks/stockManagement.ts` (or wherever stock hooks live)
- Modified: `src/payload.config.ts` — register collection

## Verification

- Place an order -> verify a `sale` stock movement is created per item
- Cancel an order -> verify a `cancellation` movement is created
- Check stock-movements list in admin — verify columns and data
- Verify movements cannot be edited (update returns 403)
- Verify staff can read movements but not create/delete
