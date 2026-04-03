'use client'

import React, { useState, useCallback } from 'react'

interface Order {
  id: number
  orderNumber: string
  status: string
  totals?: { total?: number }
  customerInfo?: { customerName?: string }
  createdAt: string
}

interface BulkResult {
  success: number[]
  failed: { id: number; error: string }[]
}

const ORDER_STATUSES = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipping', value: 'shipping' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
]

const TARGET_STATUSES = ORDER_STATUSES.filter((s) => s.value !== '')

const BulkOrderStatus = () => {
  const [filterStatus, setFilterStatus] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [targetStatus, setTargetStatus] = useState('confirmed')
  const [applying, setApplying] = useState(false)
  const [result, setResult] = useState<BulkResult | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setResult(null)
    try {
      const where = filterStatus ? `&where[status][equals]=${filterStatus}` : ''
      const res = await fetch(`/api/orders?limit=100&sort=-createdAt${where}`, {
        credentials: 'include',
      })
      const json = await res.json()
      setOrders(json.docs || [])
      setSelectedIds(new Set())
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)))
    }
  }

  const applyStatus = async () => {
    if (selectedIds.size === 0) return
    setApplying(true)
    setResult(null)
    try {
      const res = await fetch('/api/bulk-order-status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: Array.from(selectedIds), newStatus: targetStatus }),
      })
      const json: BulkResult = await res.json()
      setResult(json)
      await fetchOrders()
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="gutter--left gutter--right py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Bulk Order Status</h1>
        <p className="text-gray-500">Select orders and update their status in one action.</p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Status</label>
          <select
            className="border rounded px-3 py-2 text-sm bg-card"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="px-4 py-2 text-sm rounded border bg-card hover:bg-muted transition-colors"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load Orders'}
        </button>
      </div>

      {/* Orders table */}
      {orders.length > 0 && (
        <>
          <div className="border rounded-lg overflow-hidden mb-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === orders.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="p-4 font-medium">Order #</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Total</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-t hover:bg-muted/50 transition-colors ${
                      selectedIds.has(order.id) ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                      />
                    </td>
                    <td className="p-4 font-mono">{order.orderNumber}</td>
                    <td className="p-4">{order.customerInfo?.customerName ?? '—'}</td>
                    <td className="p-4 capitalize">{order.status}</td>
                    <td className="p-4 text-right">
                      {order.totals?.total?.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="p-4">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action bar */}
          <div className="flex gap-4 items-center mb-6">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} order{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <div>
              <label className="block text-xs font-medium mb-1">Change Status To</label>
              <select
                className="border rounded px-3 py-2 text-sm bg-card"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
              >
                {TARGET_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={applyStatus}
              disabled={applying || selectedIds.size === 0}
            >
              {applying
                ? 'Applying...'
                : `Apply to ${selectedIds.size} order${selectedIds.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </>
      )}

      {orders.length === 0 && !loading && (
        <p className="text-muted-foreground text-sm">
          Click &quot;Load Orders&quot; to fetch orders.
        </p>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-3">
          {result.success.length > 0 && (
            <div className="p-4 rounded border border-green-200 bg-green-50 text-green-800 text-sm">
              {result.success.length} order{result.success.length !== 1 ? 's' : ''} updated
              successfully (IDs: {result.success.join(', ')})
            </div>
          )}
          {result.failed.length > 0 && (
            <div className="p-4 rounded border border-red-200 bg-red-50 text-red-800 text-sm">
              <p className="font-medium mb-2">
                {result.failed.length} order{result.failed.length !== 1 ? 's' : ''} failed:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {result.failed.map((f) => (
                  <li key={f.id}>
                    Order #{f.id}: {f.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BulkOrderStatus
