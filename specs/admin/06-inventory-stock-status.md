# Spec 06: Computed Stock Status Field

## Summary

Add a computed `stockStatus` field to Products that auto-calculates from color variant inventory, providing quick visibility in the product list.

## Depends On

- Spec 02 (RBAC — for consistent access control)

## New Field: `stockStatus` (on Products)

```
name: stockStatus
type: select
options: in_stock, low_stock, out_of_stock
admin.position: sidebar
admin.readOnly: true
labels: localized (vi/en)
```

## Computation Logic

### New File: `src/collections/Products/hooks/computeStockStatus.ts`

`beforeChange` hook that examines `colorVariants[].sizeInventory[]`:

| Condition | Status |
|-----------|--------|
| Total stock across all variant-sizes = 0 | `out_of_stock` |
| Any variant-size has `stock <= lowStockThreshold` and `stock > 0` | `low_stock` |
| All variant-sizes above their thresholds | `in_stock` |

Also sets `inStock = (stockStatus !== 'out_of_stock')` so the existing checkbox stays in sync.

## Product List Update

Add `stockStatus` to `admin.defaultColumns`:
```
defaultColumns: ['name', 'category', 'price', 'stockStatus', 'tag', 'inStock']
```

## Files to Modify

- `src/collections/Products.ts` — add `stockStatus` field, update defaultColumns, register hook
- New: `src/collections/Products/hooks/computeStockStatus.ts`

## Verification

- Edit a product, set all variant stock to 0 -> save -> verify `stockStatus` = out_of_stock
- Set one variant stock to 3 with threshold 5 -> save -> verify `stockStatus` = low_stock
- Set all stocks above thresholds -> verify `stockStatus` = in_stock
- Verify product list shows the stock status column
- Verify `inStock` checkbox stays in sync
