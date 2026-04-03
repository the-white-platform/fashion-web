import type { CollectionAfterChangeHook } from 'payload'
import type { Order } from '@/payload-types'
import { createNotification } from '@/utilities/createNotification'

export const notifyOnOrder: CollectionAfterChangeHook<Order> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const { payload } = req

  try {
    // New order created
    if (operation === 'create') {
      await createNotification({
        payload,
        type: 'new_order',
        title: 'Đơn hàng mới',
        message: `Đơn hàng #${doc.orderNumber} từ ${doc.customerInfo?.customerName ?? 'Khách hàng'}`,
        link: `/admin/collections/orders/${doc.id}`,
        metadata: {
          orderId: doc.id,
          orderNumber: doc.orderNumber,
          total: doc.totals?.total,
        },
        recipientRoles: ['admin', 'editor', 'staff'],
      })
      return doc
    }

    // Order status change
    const prevStatus = previousDoc?.status
    const newStatus = doc.status

    if (prevStatus !== newStatus) {
      await createNotification({
        payload,
        type: 'order_status_change',
        title: 'Trạng thái đơn thay đổi',
        message: `Đơn #${doc.orderNumber}: ${prevStatus} → ${newStatus}`,
        link: `/admin/collections/orders/${doc.id}`,
        metadata: {
          orderId: doc.id,
          orderNumber: doc.orderNumber,
          fromStatus: prevStatus,
          toStatus: newStatus,
        },
        recipientRoles: ['admin', 'editor', 'staff'],
      })
    }

    // Return request
    const prevReturnStatus = previousDoc?.returnRequest?.returnStatus
    const newReturnStatus = doc.returnRequest?.returnStatus

    if (prevReturnStatus !== newReturnStatus && newReturnStatus === 'requested') {
      await createNotification({
        payload,
        type: 'return_request',
        title: 'Yêu cầu hoàn trả mới',
        message: `Đơn #${doc.orderNumber} yêu cầu hoàn trả`,
        link: `/admin/collections/orders/${doc.id}`,
        metadata: {
          orderId: doc.id,
          orderNumber: doc.orderNumber,
        },
        recipientRoles: ['admin', 'editor', 'staff'],
      })
    }
  } catch (error) {
    payload.logger.error(`[notifyOnOrder] Error: ${error}`)
  }

  return doc
}
