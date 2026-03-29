# Spec 11: Reporting — CSV Export

## Summary

Custom endpoint to export dashboard data as CSV files, with an export button on the dashboard.

## Depends On

- Spec 02 (RBAC — admin/editor only)
- Spec 09 (date range filter)

## Custom Endpoint: `GET /api/export-csv`

### New File: `src/endpoints/exportCsv.ts`

**Query params:**
- `type` — required: `orders`, `revenue-by-category`, `top-products`, `stock-movements`
- `from` — optional: start date (ISO 8601)
- `to` — optional: end date (ISO 8601)

**Access:** admin or editor role only (returns 403 otherwise)

**Response:**
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="{type}-{date}.csv"`

### Export Formats

**orders:**
```
Order #, Customer, Email, Phone, Status, Payment Method, Payment Status, Subtotal, Shipping, Discount, Total, Created At
```

**revenue-by-category:**
```
Category, Orders Count, Total Revenue, Average Order Value
```

**top-products:**
```
Product, Category, Quantity Sold, Revenue
```

**stock-movements:**
```
Date, Product, Variant, Size, Type, Quantity, Previous Stock, New Stock, Order #, Performed By
```

## Export Button

### New File: `src/admin/AccountingView/components/ExportButton.tsx`

- Client component (`'use client'`)
- Dropdown with export type options
- Triggers download via `window.location.href` to the CSV endpoint
- Passes current date range from URL params

## Files

- New: `src/endpoints/exportCsv.ts`
- New: `src/admin/AccountingView/components/ExportButton.tsx`
- Modified: `src/payload.config.ts` — register endpoint
- Modified: `src/admin/AccountingView/index.tsx` — add ExportButton to layout

## Verification

- Click export "Orders" -> CSV downloads with correct data
- Verify CSV respects current date range filter
- Verify admin can export, staff cannot
- Open CSV in spreadsheet app -> verify formatting is correct
- Test with Vietnamese characters in product/customer names -> verify UTF-8 encoding
