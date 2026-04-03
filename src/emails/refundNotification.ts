import type { Order } from '@/payload-types'

type Params = {
  order: Order
  locale: 'vi' | 'en'
}

export const refundNotification = ({
  order,
  locale,
}: Params): { subject: string; html: string } => {
  const isVi = locale === 'vi'
  const { orderNumber, returnRequest, totals } = order

  const refundAmount = returnRequest?.refundAmount ?? totals?.total ?? 0
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const subject = isVi
    ? `Hoàn tiền đơn hàng ${orderNumber} - The White`
    : `Refund for order ${orderNumber} - The White`

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

          <!-- Refund Banner -->
          <tr>
            <td style="background:#9b59b6;padding:16px 40px;text-align:center;">
              <p style="margin:0;color:#fff;font-size:16px;font-weight:600;letter-spacing:1px;">
                ${isVi ? 'HOÀN TIỀN' : 'REFUND PROCESSED'}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 20px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:400;">
                ${isVi ? 'Hoàn tiền đã được xử lý' : 'Your refund has been processed'}
              </h2>
              <p style="margin:0 0 24px;color:#666;font-size:15px;">
                ${isVi ? `Mã đơn hàng: <strong>${orderNumber}</strong>` : `Order number: <strong>${orderNumber}</strong>`}
              </p>

              <!-- Refund Amount Box -->
              <div style="background:#f9f0ff;border:1px solid #d9b3f0;border-radius:6px;padding:24px;margin-bottom:24px;text-align:center;">
                <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">
                  ${isVi ? 'Số tiền hoàn' : 'Refund Amount'}
                </p>
                <p style="margin:0;font-size:28px;font-weight:600;color:#9b59b6;">
                  ${formatPrice(refundAmount)}
                </p>
              </div>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#444;">
                ${
                  isVi
                    ? 'Khoản hoàn tiền sẽ được xử lý trong vòng 3-5 ngày làm việc, tùy thuộc vào phương thức thanh toán của bạn.'
                    : 'The refund will be processed within 3-5 business days, depending on your payment method.'
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
