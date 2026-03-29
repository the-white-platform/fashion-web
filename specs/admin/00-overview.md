# Admin Missing Features — Overview

## Problem

The fashion-web admin panel (Payload CMS v3) has solid e-commerce foundations but lacks key operational features needed for a team of admins, editors, and staff to manage the store effectively.

## Scope

Four feature areas, ordered by dependency:

| # | Area | Specs | Depends On |
|---|------|-------|------------|
| 1 | [Roles & Permissions](./01-rbac-roles.md) + [Access Matrix](./02-rbac-access-matrix.md) | 2 files | Nothing |
| 2 | [Order Activity Log](./03-order-activity-log.md) + [Bulk Status Updates](./04-order-bulk-status.md) + [Returns/RMA](./05-order-returns.md) | 3 files | RBAC |
| 3 | [Stock Status Field](./06-inventory-stock-status.md) + [Stock Movements](./07-inventory-stock-movements.md) + [Alerts Dashboard](./08-inventory-alerts-dashboard.md) | 3 files | RBAC |
| 4 | [Date Range Filter](./09-reporting-date-filter.md) + [New Charts](./10-reporting-charts.md) + [CSV Export](./11-reporting-csv-export.md) | 3 files | Nothing |

## Implementation Order

1. RBAC (specs 01-02) — foundation for all access control
2. Order Management (specs 03-05) — can be done in parallel with Inventory
3. Inventory & Alerts (specs 06-08) — can be done in parallel with Orders
4. Reporting & Analytics (specs 09-11) — independent, can start anytime

Each spec is independently implementable and valuable once its dependencies are met.

## Post-Implementation Checklist

After each spec:
- `pnpm generate:types`
- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm dev` — verify admin panel loads
