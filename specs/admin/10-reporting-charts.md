# Spec 10: Reporting — New Charts & Metrics

## Summary

Enhance the Accounting Dashboard with new charts and metrics: revenue trend, sales by category, top products, order volume, and customer metrics.

## Depends On

- Spec 09 (date range filter — so charts respect the selected period)

## New Components

### 1. Revenue Trend Line — `components/RevenueTrendLine.tsx`

- Client component, Recharts `LineChart`
- X-axis: time periods (daily if range <= 31 days, weekly if <= 90 days, monthly otherwise)
- Y-axis: revenue (VND)
- Data: orders grouped by time period, sum of `totals.total` for paid/delivered orders

### 2. Sales by Category Bar Chart — `components/SalesByCategoryChart.tsx`

- Client component, Recharts `BarChart`
- X-axis: category names
- Y-axis: revenue
- Data: aggregate order items -> product -> category -> sum revenue

### 3. Top Products Table — `components/TopProductsTable.tsx`

- Server component (no Recharts needed)
- Top 10 products by quantity sold
- Columns: rank, product name, quantity sold, revenue generated

### 4. Order Volume Area Chart — `components/OrderVolumeTrend.tsx`

- Client component, Recharts `AreaChart`
- X-axis: time periods (same logic as revenue trend)
- Y-axis: order count
- Data: orders grouped by time period, count per period

### 5. Customer Metrics Cards — `components/CustomerMetrics.tsx`

- Server component
- Cards: New Customers (first order in period), Returning Customers (2+ orders), Repeat Rate (%)
- Data: count distinct `customerInfo.user` values from orders

## Updated Dashboard Layout

```
[Date Range Filter]

[Revenue] [Orders] [AOV] [New Customers]        <- cards row

[Revenue Trend Line Chart]                       <- full width

[Sales by Category]     [Order Status Pie]       <- 2 columns

[Top Products Table]    [Customer Metrics]       <- 2 columns

[Payment Method Bar]    [Order Volume Area]      <- 2 columns

[Recent Transactions]                            <- full width
```

## Data Computation

All data is computed server-side in `AccountingView/index.tsx` and passed as props to client chart components. This avoids exposing raw order data to the client.

## Files

- New: 5 component files in `src/admin/AccountingView/components/`
- Modified: `src/admin/AccountingView/index.tsx` — new data queries, updated layout

## Verification

- Create orders across different dates, categories, and products
- Verify revenue trend shows correct daily/weekly/monthly data
- Verify sales by category matches actual order data
- Verify top products table shows correct rankings
- Verify customer metrics distinguish new vs returning
- Verify all charts respect the date range filter
