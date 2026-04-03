import type { PayloadHandler } from 'payload'
import { hasRole } from '@/access/roles'

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipping',
  'delivered',
  'cancelled',
  'refunded',
]

function isValidStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (VALID_STATUSES as string[]).includes(value)
}

export const bulkOrderStatusHandler: PayloadHandler = async (req) => {
  const user = req.user

  if (!user || !hasRole(user, ['admin', 'editor', 'staff'])) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { orderIds?: unknown; newStatus?: unknown }
  try {
    body = (await req.json?.()) ?? {}
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { orderIds, newStatus } = body

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return Response.json({ error: 'orderIds must be a non-empty array' }, { status: 400 })
  }

  if (!isValidStatus(newStatus)) {
    return Response.json(
      { error: `newStatus must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    )
  }

  const success: number[] = []
  const failed: { id: number; error: string }[] = []

  for (const id of orderIds) {
    const orderId = Number(id)
    if (!Number.isFinite(orderId)) {
      failed.push({ id: orderId, error: 'Invalid order ID' })
      continue
    }

    try {
      await req.payload.update({
        collection: 'orders',
        id: orderId,
        data: { status: newStatus },
        req,
      })
      success.push(orderId)
    } catch (err) {
      failed.push({ id: orderId, error: err instanceof Error ? err.message : String(err) })
    }
  }

  return Response.json({ success, failed }, { status: 200 })
}
