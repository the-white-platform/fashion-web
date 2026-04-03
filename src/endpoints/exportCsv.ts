import type { PayloadHandler, Where } from 'payload'
import { hasRole } from '@/access/roles'
import type { Order, StockMovement, Category, Product } from '@/payload-types'

type ExportType = 'orders' | 'revenue-by-category' | 'top-products' | 'stock-movements'

function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function rowToCsv(row: (string | number | null | undefined)[]): string {
  return row.map(escapeCsvField).join(',')
}

function buildDateFilter(from?: string | null, to?: string | null): Where | undefined {
  const conditions: Where[] = []
  if (from) conditions.push({ createdAt: { greater_than_equal: from } })
  if (to) conditions.push({ createdAt: { less_than_equal: `${to}T23:59:59.999Z` } })
  if (conditions.length === 0) return undefined
  return { and: conditions }
}

export const exportCsvHandler: PayloadHandler = async (req) => {
  const user = req.user

  if (!user || !hasRole(user, ['admin', 'editor'])) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(req.url ?? '', 'http://localhost')
  const type = url.searchParams.get('type') as ExportType | null
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  const validTypes: ExportType[] = [
    'orders',
    'revenue-by-category',
    'top-products',
    'stock-movements',
  ]
  if (!type || !validTypes.includes(type)) {
    return new Response(
      JSON.stringify({
        error: 'type must be one of: orders, revenue-by-category, top-products, stock-movements',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `${type}-${dateStr}.csv`
  const dateWhere = buildDateFilter(from, to)

  let csvLines: string[] = []

  // ── orders ──────────────────────────────────────────────────────────────────
  if (type === 'orders') {
    csvLines.push(
      rowToCsv([
        'Order #',
        'Customer',
        'Email',
        'Phone',
        'Status',
        'Payment Method',
        'Payment Status',
        'Subtotal',
        'Shipping',
        'Discount',
        'Total',
        'Created At',
      ]),
    )

    const { docs } = await req.payload.find({
      collection: 'orders',
      limit: 10000,
      pagination: false,
      where: dateWhere ?? undefined,
      sort: '-createdAt',
    })

    for (const order of docs as Order[]) {
      csvLines.push(
        rowToCsv([
          order.orderNumber,
          order.customerInfo?.customerName,
          order.customerInfo?.customerEmail,
          order.customerInfo?.customerPhone,
          order.status,
          order.payment?.method,
          order.payment?.paymentStatus,
          order.totals?.subtotal,
          order.totals?.shippingFee ?? 0,
          order.totals?.discount ?? 0,
          order.totals?.total,
          new Date(order.createdAt).toISOString(),
        ]),
      )
    }
  }

  // ── revenue-by-category ──────────────────────────────────────────────────────
  if (type === 'revenue-by-category') {
    csvLines.push(rowToCsv(['Category', 'Orders Count', 'Total Revenue', 'Average Order Value']))

    const paidFilter: Where = {
      or: [{ 'payment.paymentStatus': { equals: 'paid' } }, { status: { equals: 'delivered' } }],
    }
    const revByCatWhere: Where = dateWhere
      ? { and: [...((dateWhere.and ?? []) as Where[]), paidFilter] }
      : paidFilter

    const { docs: orders } = await req.payload.find({
      collection: 'orders',
      limit: 10000,
      pagination: false,
      where: revByCatWhere,
    })

    // Aggregate revenue per category by looking up product categories
    const categoryMap: Record<number, { name: string; orderCount: Set<number>; revenue: number }> =
      {}

    for (const order of orders as Order[]) {
      for (const item of order.items ?? []) {
        const product = item.product
        if (typeof product === 'object' && product !== null) {
          const p = product as Product
          const cats = (p.category ?? []) as (number | Category)[]
          for (const cat of cats) {
            const catId = typeof cat === 'object' ? cat.id : cat
            const catName = typeof cat === 'object' ? cat.title : `Category ${cat}`
            if (!categoryMap[catId]) {
              categoryMap[catId] = { name: catName, orderCount: new Set(), revenue: 0 }
            }
            categoryMap[catId].orderCount.add(order.id)
            categoryMap[catId].revenue += item.lineTotal ?? 0
          }
        }
      }
    }

    for (const [, data] of Object.entries(categoryMap)) {
      const count = data.orderCount.size
      const aov = count > 0 ? data.revenue / count : 0
      csvLines.push(rowToCsv([data.name, count, data.revenue, Math.round(aov)]))
    }

    if (Object.keys(categoryMap).length === 0) {
      csvLines.push(rowToCsv(['No data', 0, 0, 0]))
    }
  }

  // ── top-products ─────────────────────────────────────────────────────────────
  if (type === 'top-products') {
    csvLines.push(rowToCsv(['Product', 'Category', 'Quantity Sold', 'Revenue']))

    const { docs: orders } = await req.payload.find({
      collection: 'orders',
      limit: 10000,
      pagination: false,
      depth: 1,
      where: dateWhere ?? undefined,
    })

    const productMap: Record<
      string,
      { name: string; category: string; qty: number; revenue: number }
    > = {}

    for (const order of orders as Order[]) {
      for (const item of order.items ?? []) {
        const key = item.productName
        if (!productMap[key]) {
          const product = item.product
          let catName = ''
          if (typeof product === 'object' && product !== null) {
            const p = product as Product
            const cats = (p.category ?? []) as (number | Category)[]
            catName = cats.map((c) => (typeof c === 'object' ? c.title : String(c))).join(', ')
          }
          productMap[key] = { name: key, category: catName, qty: 0, revenue: 0 }
        }
        productMap[key].qty += item.quantity ?? 0
        productMap[key].revenue += item.lineTotal ?? 0
      }
    }

    const sorted = Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 50)
    for (const p of sorted) {
      csvLines.push(rowToCsv([p.name, p.category, p.qty, p.revenue]))
    }

    if (sorted.length === 0) {
      csvLines.push(rowToCsv(['No data', '', 0, 0]))
    }
  }

  // ── stock-movements ──────────────────────────────────────────────────────────
  if (type === 'stock-movements') {
    csvLines.push(
      rowToCsv([
        'Date',
        'Product',
        'Variant',
        'Size',
        'Type',
        'Quantity',
        'Previous Stock',
        'New Stock',
        'Order #',
        'Performed By',
      ]),
    )

    const { docs } = await req.payload.find({
      collection: 'stock-movements',
      limit: 10000,
      pagination: false,
      depth: 1,
      where: dateWhere ?? undefined,
      sort: '-createdAt',
    })

    for (const sm of docs as StockMovement[]) {
      const product = sm.product
      const productName =
        typeof product === 'object' ? ((product as Product).name ?? '') : String(product)
      const order = sm.order
      const orderNumber =
        typeof order === 'object' && order !== null ? (order as Order).orderNumber : ''
      const performedBy = sm.performedBy
      const performedByName =
        typeof performedBy === 'object' && performedBy !== null
          ? ((performedBy as { email?: string }).email ?? '')
          : ''

      csvLines.push(
        rowToCsv([
          new Date(sm.createdAt).toISOString(),
          productName,
          sm.variant,
          sm.size,
          sm.type,
          sm.quantity,
          sm.previousStock,
          sm.newStock,
          orderNumber,
          performedByName,
        ]),
      )
    }
  }

  const csvContent = '\uFEFF' + csvLines.join('\r\n') // BOM for Excel UTF-8
  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
