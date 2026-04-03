import React from 'react'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import configPromise from '@payload-config'
import type { Order, Category, Product } from '@/payload-types'
import { RevenueTrendChart } from './components/RevenueTrendChart'
import { OrderStatusChart } from './components/OrderStatusChart'
import { DateRangeFilter } from './components/DateRangeFilter'
import { RevenueTrendLine } from './components/RevenueTrendLine'
import type { RevenueTrendPoint } from './components/RevenueTrendLine'
import { SalesByCategoryChart } from './components/SalesByCategoryChart'
import type { CategorySalesPoint } from './components/SalesByCategoryChart'
import { TopProductsTable } from './components/TopProductsTable'
import type { TopProduct } from './components/TopProductsTable'
import { OrderVolumeTrend } from './components/OrderVolumeTrend'
import type { OrderVolumePoint } from './components/OrderVolumeTrend'
import { CustomerMetrics } from './components/CustomerMetrics'
import type { CustomerMetricsData } from './components/CustomerMetrics'
import { ExportButton } from './components/ExportButton'

interface AccountingViewProps {
  searchParams?: {
    from?: string
    to?: string
    [key: string]: string | string[] | undefined
  }
}

function buildDateWhere(from?: string, to?: string): Where | undefined {
  const conditions: Where[] = []
  if (from) conditions.push({ createdAt: { greater_than_equal: from } })
  if (to) conditions.push({ createdAt: { less_than_equal: `${to}T23:59:59.999Z` } })
  if (conditions.length === 0) return undefined
  return { and: conditions }
}

/** Determine granularity from the date range span in days */
function getGranularity(from?: string, to?: string): 'daily' | 'weekly' | 'monthly' {
  if (!from || !to) return 'monthly'
  const diff = (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)
  if (diff <= 31) return 'daily'
  if (diff <= 90) return 'weekly'
  return 'monthly'
}

function getPeriodKey(date: Date, granularity: 'daily' | 'weekly' | 'monthly'): string {
  if (granularity === 'daily') {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  }
  if (granularity === 'weekly') {
    // ISO week: get Monday of the week
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  }
  // monthly
  return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
}

const AccountingView = async ({ searchParams }: AccountingViewProps) => {
  const from = searchParams?.from
  const to = searchParams?.to
  const dateWhere = buildDateWhere(from, to)
  const granularity = getGranularity(from, to)

  const payload = await getPayload({ config: configPromise })

  // 1. Total Orders (in range)
  const { totalDocs: totalOrders } = await payload.count({
    collection: 'orders',
    where: dateWhere,
  })

  // 2. Fetch all orders in range for revenue + charts
  const { docs: allOrders } = await payload.find({
    collection: 'orders',
    limit: 10000,
    pagination: false,
    depth: 1,
    where: dateWhere,
    sort: 'createdAt',
  })

  // Paid/delivered orders for revenue metrics
  const paidOrders = allOrders.filter(
    (order) => order.payment?.paymentStatus === 'paid' || order.status === 'delivered',
  )

  const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totals?.total || 0), 0)
  const aov = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

  // 3. Recent Orders
  const { docs: recentOrders } = await payload.find({
    collection: 'orders',
    limit: 5,
    sort: '-createdAt',
    where: dateWhere,
  })

  // 4. Revenue by Payment Method (existing chart)
  const revenueByMethod: Record<string, number> = {}
  paidOrders.forEach((order) => {
    const method = order.payment?.method || 'unknown'
    revenueByMethod[method] = (revenueByMethod[method] || 0) + (order.totals?.total || 0)
  })
  const revenueChartData = Object.entries(revenueByMethod).map(([key, value]) => ({
    name: key,
    revenue: value,
  }))

  // 5. Order Status Distribution (existing chart)
  const statusCounts: Record<string, number> = {}
  allOrders.forEach((order) => {
    const status = String(order.status || 'unknown')
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })
  const statusChartData = Object.entries(statusCounts).map(([key, value]) => ({
    name: key,
    value: value,
  }))

  // 6. Revenue Trend Line (new)
  const revenueTrendMap: Record<string, number> = {}
  paidOrders.forEach((order) => {
    const key = getPeriodKey(new Date(order.createdAt), granularity)
    revenueTrendMap[key] = (revenueTrendMap[key] || 0) + (order.totals?.total || 0)
  })
  const revenueTrendData: RevenueTrendPoint[] = Object.entries(revenueTrendMap).map(
    ([period, revenue]) => ({ period, revenue }),
  )

  // 7. Order Volume Trend (new)
  const orderVolumeMap: Record<string, number> = {}
  allOrders.forEach((order) => {
    const key = getPeriodKey(new Date(order.createdAt), granularity)
    orderVolumeMap[key] = (orderVolumeMap[key] || 0) + 1
  })
  const orderVolumeData: OrderVolumePoint[] = Object.entries(orderVolumeMap).map(
    ([period, orders]) => ({ period, orders }),
  )

  // 8. Sales by Category (new)
  const categoryRevenueMap: Record<number, { name: string; revenue: number }> = {}
  paidOrders.forEach((order) => {
    for (const item of order.items ?? []) {
      const product = item.product as Product | number
      if (typeof product === 'object' && product !== null) {
        const cats = (product.category ?? []) as (number | Category)[]
        for (const cat of cats) {
          const catId = typeof cat === 'object' ? cat.id : cat
          const catName = typeof cat === 'object' ? cat.title : `Category ${cat}`
          if (!categoryRevenueMap[catId]) {
            categoryRevenueMap[catId] = { name: catName, revenue: 0 }
          }
          categoryRevenueMap[catId].revenue += item.lineTotal ?? 0
        }
      }
    }
  })
  const salesByCategoryData: CategorySalesPoint[] = Object.values(categoryRevenueMap)
    .sort((a, b) => b.revenue - a.revenue)
    .map(({ name, revenue }) => ({ category: name, revenue }))

  // 9. Top Products Table (new)
  const productSalesMap: Record<
    string,
    { productName: string; category: string; quantitySold: number; revenue: number }
  > = {}
  allOrders.forEach((order) => {
    for (const item of order.items ?? []) {
      const key = item.productName
      if (!productSalesMap[key]) {
        const product = item.product as Product | number
        let catName = ''
        if (typeof product === 'object' && product !== null) {
          const cats = (product.category ?? []) as (number | Category)[]
          catName = cats.map((c) => (typeof c === 'object' ? c.title : String(c))).join(', ')
        }
        productSalesMap[key] = { productName: key, category: catName, quantitySold: 0, revenue: 0 }
      }
      productSalesMap[key].quantitySold += item.quantity ?? 0
      productSalesMap[key].revenue += item.lineTotal ?? 0
    }
  })
  const topProductsData: TopProduct[] = Object.values(productSalesMap)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 10)
    .map((p, index) => ({ rank: index + 1, ...p }))

  // 10. Customer Metrics (new)
  // Count per userId (or email for guests)
  const customerOrderCounts: Record<string, number> = {}
  allOrders.forEach((order) => {
    const userRef = order.customerInfo?.user
    const key =
      userRef != null
        ? `user:${typeof userRef === 'object' ? userRef.id : userRef}`
        : `guest:${order.customerInfo?.customerEmail}`
    customerOrderCounts[key] = (customerOrderCounts[key] || 0) + 1
  })
  const totalCustomers = Object.keys(customerOrderCounts).length
  const newCustomers = Object.values(customerOrderCounts).filter((c) => c === 1).length
  const returningCustomers = totalCustomers - newCustomers
  const repeatRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0

  const customerMetricsData: CustomerMetricsData = {
    newCustomers,
    returningCustomers,
    repeatRate,
    avgOrderValue: aov,
  }

  return (
    <div className="gutter--left gutter--right py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Accounting Dashboard</h1>
          <p className="text-gray-500">Financial overview and recent activity.</p>
        </div>
        <ExportButton />
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter from={from} to={to} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Tổng Doanh Thu</h3>
          <p className="text-3xl font-bold">{totalRevenue.toLocaleString('vi-VN')}₫</p>
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Tổng Đơn Hàng</h3>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Giá Trị TB/Đơn</h3>
          <p className="text-3xl font-bold">{aov.toLocaleString('vi-VN')}₫</p>
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Khách Hàng Mới</h3>
          <p className="text-3xl font-bold">{newCustomers}</p>
        </div>
      </div>

      {/* Revenue Trend — full width */}
      <div className="p-6 border rounded-lg bg-card shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">
          Xu Hướng Doanh Thu
          <span className="ml-2 text-xs font-normal text-muted-foreground capitalize">
            (
            {granularity === 'daily'
              ? 'theo ngày'
              : granularity === 'weekly'
                ? 'theo tuần'
                : 'theo tháng'}
            )
          </span>
        </h3>
        <RevenueTrendLine data={revenueTrendData} />
      </div>

      {/* Sales by Category + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Doanh Thu Theo Danh Mục</h3>
          <SalesByCategoryChart data={salesByCategoryData} />
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Phân Bổ Trạng Thái Đơn</h3>
          <OrderStatusChart data={statusChartData} />
        </div>
      </div>

      {/* Top Products + Customer Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top 10 Sản Phẩm Bán Chạy</h3>
          <TopProductsTable products={topProductsData} />
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Chỉ Số Khách Hàng</h3>
          <CustomerMetrics data={customerMetricsData} />
        </div>
      </div>

      {/* Payment Method Bar + Order Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Doanh Thu Theo PTTT</h3>
          <RevenueTrendChart data={revenueChartData} />
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-6">
            Lượng Đơn Hàng
            <span className="ml-2 text-xs font-normal text-muted-foreground capitalize">
              (
              {granularity === 'daily'
                ? 'theo ngày'
                : granularity === 'weekly'
                  ? 'theo tuần'
                  : 'theo tháng'}
              )
            </span>
          </h3>
          <OrderVolumeTrend data={orderVolumeData} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Giao Dịch Gần Đây</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Ngày</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-mono">{order.orderNumber}</td>
                  <td className="p-4">{order.customerInfo?.customerName}</td>
                  <td className="p-4">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium">
                    {order.totals?.total?.toLocaleString('vi-VN')}₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AccountingView
