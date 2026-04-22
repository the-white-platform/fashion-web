import type { Order } from '@/payload-types'

type Params = {
  order: Order
  locale: 'vi' | 'en'
}

export const orderConfirmation = ({ order, locale }: Params): { subject: string; html: string } => {
  const isVi = locale === 'vi'
  const { orderNumber, customerInfo, items, totals, shippingAddress } = order

  const subject = isVi
    ? `Xác nhận đơn hàng ${orderNumber} - The White`
    : `Order Confirmation ${orderNumber} - The White`

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const addressParts = [
    shippingAddress?.address,
    typeof shippingAddress?.ward === 'object' && shippingAddress.ward !== null
      ? (shippingAddress.ward as { name?: string }).name
      : null,
    typeof shippingAddress?.district === 'object' && shippingAddress.district !== null
      ? (shippingAddress.district as { name?: string }).name
      : null,
    typeof shippingAddress?.city === 'object' && shippingAddress.city !== null
      ? (shippingAddress.city as { name?: string }).name
      : null,
  ]
    .filter(Boolean)
    .join(', ')

  const itemsRows =
    items
      ?.map(
        (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">
          ${item.productName}
          ${item.variant ? ` — ${item.variant}` : ''}
          (${isVi ? 'Size' : 'Size'}: ${item.size})
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${formatPrice(item.lineTotal)}</td>
      </tr>`,
      )
      .join('') ?? ''

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

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 20px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:400;">
                ${isVi ? 'Cảm ơn bạn đã đặt hàng!' : 'Thank you for your order!'}
              </h2>
              <p style="margin:0 0 24px;color:#666;font-size:15px;">
                ${isVi ? `Đơn hàng <strong>${orderNumber}</strong> của bạn đã được tiếp nhận.` : `Your order <strong>${orderNumber}</strong> has been received.`}
              </p>

              <!-- Items Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                <thead>
                  <tr style="background:#f5f5f5;">
                    <th style="padding:10px 12px;text-align:left;font-size:13px;font-weight:600;color:#555;">
                      ${isVi ? 'Sản phẩm' : 'Product'}
                    </th>
                    <th style="padding:10px 12px;text-align:center;font-size:13px;font-weight:600;color:#555;">
                      ${isVi ? 'SL' : 'Qty'}
                    </th>
                    <th style="padding:10px 12px;text-align:right;font-size:13px;font-weight:600;color:#555;">
                      ${isVi ? 'Thành tiền' : 'Total'}
                    </th>
                  </tr>
                </thead>
                <tbody>${itemsRows}</tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:4px 0;color:#666;font-size:14px;">${isVi ? 'Tạm tính' : 'Subtotal'}</td>
                  <td style="padding:4px 0;text-align:right;font-size:14px;">${formatPrice(totals?.subtotal ?? 0)}</td>
                </tr>
                ${
                  (totals?.shippingFee ?? 0) > 0
                    ? `<tr>
                  <td style="padding:4px 0;color:#666;font-size:14px;">${isVi ? 'Phí vận chuyển' : 'Shipping'}</td>
                  <td style="padding:4px 0;text-align:right;font-size:14px;">${formatPrice(totals?.shippingFee ?? 0)}</td>
                </tr>`
                    : ''
                }
                ${
                  (totals?.discount ?? 0) > 0
                    ? `<tr>
                  <td style="padding:4px 0;color:#666;font-size:14px;">${isVi ? 'Giảm giá' : 'Discount'}</td>
                  <td style="padding:4px 0;text-align:right;font-size:14px;color:#e74c3c;">-${formatPrice(totals?.discount ?? 0)}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding:12px 0 4px;font-size:16px;font-weight:600;border-top:2px solid #1a1a1a;">
                    ${isVi ? 'Tổng cộng' : 'Total'}
                  </td>
                  <td style="padding:12px 0 4px;text-align:right;font-size:16px;font-weight:600;border-top:2px solid #1a1a1a;">
                    ${formatPrice(totals?.total ?? 0)}
                  </td>
                </tr>
              </table>

              <!-- Shipping Address -->
              ${
                addressParts
                  ? `<div style="background:#f9f9f9;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:1px;">
                  ${isVi ? 'Địa chỉ giao hàng' : 'Shipping Address'}
                </h3>
                <p style="margin:0;font-size:14px;color:#333;">${customerInfo?.customerName}</p>
                <p style="margin:4px 0 0;font-size:14px;color:#666;">${addressParts}</p>
                <p style="margin:4px 0 0;font-size:14px;color:#666;">${customerInfo?.customerPhone}</p>
              </div>`
                  : ''
              }

              <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
                ${
                  isVi
                    ? 'Chúng tôi sẽ thông báo cho bạn khi đơn hàng được xác nhận và giao đi. Nếu có câu hỏi, vui lòng liên hệ <a href="mailto:support@thewhite.cool" style="color:#1a1a1a;">support@thewhite.cool</a>.'
                    : 'We will notify you when your order is confirmed and shipped. If you have any questions, please contact <a href="mailto:support@thewhite.cool" style="color:#1a1a1a;">support@thewhite.cool</a>.'
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
