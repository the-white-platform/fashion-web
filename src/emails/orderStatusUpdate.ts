import type { Order } from '@/payload-types'

type Params = {
  order: Order
  locale: 'vi' | 'en'
}

const statusLabels: Record<string, { vi: string; en: string }> = {
  pending: { vi: 'Chờ xác nhận', en: 'Pending' },
  confirmed: { vi: 'Đã xác nhận', en: 'Confirmed' },
  processing: { vi: 'Đang xử lý', en: 'Processing' },
  shipping: { vi: 'Đang giao hàng', en: 'Shipping' },
  delivered: { vi: 'Đã giao hàng', en: 'Delivered' },
  cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
  refunded: { vi: 'Đã hoàn tiền', en: 'Refunded' },
}

const statusMessages: Record<string, { vi: string; en: string }> = {
  confirmed: {
    vi: 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.',
    en: 'Your order has been confirmed and is being prepared.',
  },
  processing: {
    vi: 'Đơn hàng của bạn đang được xử lý và đóng gói.',
    en: 'Your order is being processed and packed.',
  },
  cancelled: {
    vi: 'Đơn hàng của bạn đã bị hủy. Nếu bạn đã thanh toán, chúng tôi sẽ hoàn tiền trong 3-5 ngày làm việc.',
    en: 'Your order has been cancelled. If you have already paid, we will process a refund within 3-5 business days.',
  },
  refunded: {
    vi: 'Đơn hàng của bạn đã được hoàn tiền.',
    en: 'Your order has been refunded.',
  },
}

export const orderStatusUpdate = ({ order, locale }: Params): { subject: string; html: string } => {
  const isVi = locale === 'vi'
  const { orderNumber, status } = order

  const statusLabel = status ? (statusLabels[status]?.[locale] ?? status) : ''
  const statusMessage =
    status && statusMessages[status]
      ? statusMessages[status][locale]
      : isVi
        ? `Trạng thái đơn hàng của bạn đã được cập nhật thành "${statusLabel}".`
        : `Your order status has been updated to "${statusLabel}".`

  const subject = isVi
    ? `Cập nhật đơn hàng ${orderNumber}: ${statusLabel}`
    : `Order Update ${orderNumber}: ${statusLabel}`

  const statusColor =
    status === 'cancelled'
      ? '#e74c3c'
      : status === 'confirmed' || status === 'delivered'
        ? '#27ae60'
        : '#f39c12'

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:300;letter-spacing:4px;">THE WHITE</h1>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background:${statusColor};padding:16px 40px;text-align:center;">
              <p style="margin:0;color:#fff;font-size:16px;font-weight:600;letter-spacing:1px;">
                ${statusLabel.toUpperCase()}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 20px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:400;">
                ${isVi ? 'Cập nhật đơn hàng' : 'Order Update'}
              </h2>
              <p style="margin:0 0 16px;color:#666;font-size:15px;">
                ${isVi ? `Mã đơn hàng: <strong>${orderNumber}</strong>` : `Order number: <strong>${orderNumber}</strong>`}
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#444;">
                ${statusMessage}
              </p>
              <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
                ${
                  isVi
                    ? 'Nếu có câu hỏi, vui lòng liên hệ <a href="mailto:support@thewhite.vn" style="color:#1a1a1a;">support@thewhite.vn</a>.'
                    : 'If you have any questions, please contact <a href="mailto:support@thewhite.vn" style="color:#1a1a1a;">support@thewhite.vn</a>.'
                }
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f5f5f5;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999;">
                © ${new Date().getFullYear()} The White. ${isVi ? 'Tất cả quyền được bảo lưu.' : 'All rights reserved.'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}
