# Spec 09: Reporting — Date Range Filter

## Summary

Add date range filtering to the Accounting Dashboard so all metrics and charts can be scoped to a time period.

## Depends On

- Nothing (can be done independently)

## Component

### New File: `src/admin/AccountingView/components/DateRangeFilter.tsx`

Client component (`'use client'`).

### UI

- Two date inputs: From, To
- Preset buttons: Today, This Week, This Month, This Quarter, This Year
- Labels localized (vi/en)

### Behavior

- Stores selected range in URL search params: `?from=2026-01-01&to=2026-03-29`
- On change, navigates to same page with updated params (using `useRouter`)
- Presets calculate dates relative to current date

### Integration with Dashboard

The `AccountingView/index.tsx` server component reads `searchParams.from` and `searchParams.to`, then passes them as `where` clauses to all Payload queries:

```
where: {
  and: [
    { createdAt: { greater_than_equal: from } },
    { createdAt: { less_than_equal: to } },
  ]
}
```

Default (no params): show all-time data.

## Files

- New: `src/admin/AccountingView/components/DateRangeFilter.tsx`
- Modified: `src/admin/AccountingView/index.tsx` — accept searchParams, apply date filter to queries, render DateRangeFilter

## Verification

- Open accounting dashboard with no date params -> shows all-time data
- Select "This Month" -> URL updates, metrics reflect only current month's orders
- Select custom date range -> verify data filters correctly
- Verify presets calculate correct date ranges
