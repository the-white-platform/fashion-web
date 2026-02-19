import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { RevenueTrendChart } from './components/RevenueTrendChart'
import { OrderStatusChart } from './components/OrderStatusChart'

const AccountingView = async () => {
  const payload = await getPayload({ config: configPromise })

  // 1. Total Orders
  const { totalDocs: totalOrders } = await payload.count({
    collection: 'orders',
  })

  // 2. Fetch all orders for revenue calculation (limit 10000 for now)
  const { docs: allOrders } = await payload.find({
    collection: 'orders',
    limit: 10000,
    pagination: false,
  })

  // Calculate Total Revenue (paid or delivered)
  const paidOrders = allOrders.filter(
    (order) => order.payment?.paymentStatus === 'paid' || order.status === 'delivered',
  )

  const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totals?.total || 0), 0)

  // Calculate Average Order Value
  const aov = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

  // 3. Recent Orders
  const { docs: recentOrders } = await payload.find({
    collection: 'orders',
    limit: 5,
    sort: '-createdAt',
  })

  // 4. Prepare Chart Data
  // Revenue by Payment Method
  const revenueByMethod: Record<string, number> = {}
  paidOrders.forEach((order) => {
    const method = order.payment?.method || 'unknown'
    revenueByMethod[method] = (revenueByMethod[method] || 0) + (order.totals?.total || 0)
  })

  const revenueChartData = Object.entries(revenueByMethod).map(([key, value]) => ({
    name: key,
    revenue: value,
  }))

  // Order Status Distribution
  const statusCounts: Record<string, number> = {}
  allOrders.forEach((order) => {
    const status = String(order.status || 'unknown')
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })

  const statusChartData = Object.entries(statusCounts).map(([key, value]) => ({
    name: key,
    value: value,
  }))

  return (
    <div className="gutter--left gutter--right py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Accounting Dashboard</h1>
        <p className="text-gray-500">Financial overview and recent activity.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">{totalRevenue.toLocaleString('vi-VN')}₫</p>
        </div>
        <div className="card p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>
        <div className="card p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Average Order Value</h3>
          <p className="text-3xl font-bold">{aov.toLocaleString('vi-VN')}₫</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Revenue by Payment Method</h3>
          <RevenueTrendChart data={revenueChartData} />
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Order Status Distribution</h3>
          <OrderStatusChart data={statusChartData} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Amount</th>
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
