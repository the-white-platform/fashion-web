import type { Order } from '@/payload-types'

type Params = {
  order: Order
  locale: 'vi' | 'en'
}

export const shippingNotification = ({
  order,
  locale,
}: Params): { subject: string; html: string } => {
  const isVi = locale === 'vi'
  const { orderNumber, fulfillment } = order

  const carrier = fulfillment?.carrier ?? ''
  const trackingNumber = fulfillment?.trackingNumber ?? ''

  const subject = isVi
    ? `Đơn hàng ${orderNumber} đang được giao`
    : `Order ${orderNumber} is on its way`

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

          <!-- Shipping Banner -->
          <tr>
            <td style="background:#3498db;padding:16px 40px;text-align:center;">
              <p style="margin:0;color:#fff;font-size:16px;font-weight:600;letter-spacing:1px;">
                ${isVi ? 'ĐANG GIAO HÀNG' : 'ON THE WAY'}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 20px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:400;">
                ${isVi ? 'Đơn hàng đang được giao!' : 'Your order is on its way!'}
              </h2>
              <p style="margin:0 0 24px;color:#666;font-size:15px;">
                ${isVi ? `Mã đơn hàng: <strong>${orderNumber}</strong>` : `Order number: <strong>${orderNumber}</strong>`}
              </p>

              <!-- Tracking Info -->
              ${
                carrier || trackingNumber
                  ? `<div style="background:#f0f7ff;border-left:4px solid #3498db;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
                <h3 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:1px;">
                  ${isVi ? 'Thông tin vận chuyển' : 'Tracking Information'}
                </h3>
                ${carrier ? `<p style="margin:0 0 8px;font-size:14px;"><strong>${isVi ? 'Đơn vị vận chuyển' : 'Carrier'}:</strong> ${carrier}</p>` : ''}
                ${trackingNumber ? `<p style="margin:0;font-size:14px;"><strong>${isVi ? 'Mã vận đơn' : 'Tracking Number'}:</strong> <span style="font-family:monospace;background:#fff;padding:2px 6px;border-radius:3px;border:1px solid #ddd;">${trackingNumber}</span></p>` : ''}
              </div>`
                  : ''
              }

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">
                ${
                  isVi
                    ? 'Đơn hàng của bạn đã được giao cho đơn vị vận chuyển và đang trên đường đến bạn.'
                    : 'Your order has been handed to the carrier and is on its way to you.'
                }
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
