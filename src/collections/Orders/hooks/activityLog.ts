import type { CollectionBeforeChangeHook } from 'payload'

export const logOrderActivity: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const userId = req.user?.id
  const now = new Date().toISOString()
  const existingLog =
    (data.activityLog as unknown[]) || (originalDoc?.activityLog as unknown[]) || []

  const newEntries: unknown[] = []

  if (operation === 'create') {
    newEntries.push({
      action: 'created',
      timestamp: now,
      performedBy: userId ?? null,
    })
  } else if (operation === 'update' && originalDoc) {
    if (data.status !== undefined && data.status !== originalDoc.status) {
      newEntries.push({
        action: 'status_change',
        fromValue: originalDoc.status,
        toValue: data.status,
        timestamp: now,
        performedBy: userId ?? null,
      })
    }

    const prevPaymentStatus = originalDoc.payment?.paymentStatus
    const newPaymentStatus = data.payment?.paymentStatus
    if (newPaymentStatus !== undefined && newPaymentStatus !== prevPaymentStatus) {
      newEntries.push({
        action: 'payment_update',
        fromValue: prevPaymentStatus,
        toValue: newPaymentStatus,
        timestamp: now,
        performedBy: userId ?? null,
      })
    }

    if (data.adminNotes !== undefined && data.adminNotes !== originalDoc.adminNotes) {
      newEntries.push({
        action: 'note',
        toValue: data.adminNotes,
        timestamp: now,
        performedBy: userId ?? null,
      })
    }
  }

  if (newEntries.length > 0) {
    data.activityLog = [...existingLog, ...newEntries]
  }

  return data
}
