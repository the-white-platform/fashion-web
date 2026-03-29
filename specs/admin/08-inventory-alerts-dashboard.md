# Spec 08: Inventory Alerts Dashboard

## Summary

Custom admin view showing out-of-stock and low-stock products at a glance.

## Depends On

- Spec 06 (stockStatus computed field)

## Custom Admin View: `/admin/inventory-alerts`

### New File: `src/admin/InventoryAlerts/index.tsx`

Server component that fetches all products and analyzes their `colorVariants.sizeInventory`.

### Layout

**Summary cards (top row):**
- Total SKUs (count of all product-color-size combinations)
- Out of Stock (red) — count of SKUs with stock = 0
- Low Stock (yellow) — count of SKUs at or below threshold
- Healthy (green) — everything else

**Out of Stock table (red header):**
| Column | Description |
|--------|-------------|
| Product | Name, linked to product edit page |
| Color | Variant color name |
| Size | Size label |
| Last Movement | Date of last stock change (from StockMovements if available) |

**Low Stock table (yellow header):**
| Column | Description |
|--------|-------------|
| Product | Name, linked to product edit page |
| Color | Variant color name |
| Size | Size label |
| Current Stock | Current quantity |
| Threshold | Low stock threshold |

### Nav Link

### New File: `src/admin/InventoryAlertsLink.tsx`

Same pattern as `AccountingLink.tsx` — links to `/admin/inventory-alerts`.

## Files

- New: `src/admin/InventoryAlerts/index.tsx`
- New: `src/admin/InventoryAlertsLink.tsx`
- Modified: `src/payload.config.ts` — register view + nav link

## Verification

- Set some product variants to stock 0 -> verify they appear in Out of Stock table
- Set some to low stock -> verify they appear in Low Stock table
- Verify summary card counts are correct
- Verify product links navigate to the correct product edit page
- Verify the nav link appears in admin sidebar
