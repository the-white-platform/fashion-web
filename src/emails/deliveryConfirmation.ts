import type { Order } from '@/payload-types'

type Params = {
  order: Order
  locale: 'vi' | 'en'
}

export const deliveryConfirmation = ({
  order,
  locale,
}: Params): { subject: string; html: string } => {
  const isVi = locale === 'vi'
  const { orderNumber } = order

  const subject = isVi
    ? `Đơn hàng ${orderNumber} đã giao thành công`
    : `Order ${orderNumber} delivered successfully`

  const storeUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://thewhite.cool'
  const reviewUrl = `${storeUrl}/${locale}/account/orders/${orderNumber}`

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

          <!-- Delivered Banner -->
          <tr>
            <td style="background:#27ae60;padding:16px 40px;text-align:center;">
              <p style="margin:0;color:#fff;font-size:16px;font-weight:600;letter-spacing:1px;">
                ${isVi ? 'ĐÃ GIAO HÀNG' : 'DELIVERED'}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <h2 style="margin:0 0 16px;font-size:24px;font-weight:400;">
                ${isVi ? 'Cảm ơn bạn đã mua hàng tại The White!' : 'Thank you for shopping at The White!'}
              </h2>
              <p style="margin:0 0 8px;color:#666;font-size:15px;">
                ${isVi ? `Đơn hàng <strong>${orderNumber}</strong> đã được giao thành công.` : `Order <strong>${orderNumber}</strong> has been delivered successfully.`}
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#444;">
                ${
                  isVi
                    ? 'Chúng tôi hy vọng bạn hài lòng với sản phẩm. Hãy chia sẻ cảm nhận của bạn để giúp những khách hàng khác!'
                    : 'We hope you love your new items. Share your experience to help other customers!'
                }
              </p>

              <!-- Review CTA -->
              <a href="${reviewUrl}"
                style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:14px;font-weight:600;letter-spacing:1px;margin-bottom:32px;">
                ${isVi ? 'VIẾT ĐÁNH GIÁ' : 'WRITE A REVIEW'}
              </a>

              <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
                ${
                  isVi
                    ? 'Nếu có vấn đề với đơn hàng, vui lòng liên hệ <a href="mailto:support@thewhite.cool" style="color:#1a1a1a;">support@thewhite.cool</a> trong vòng 7 ngày.'
                    : 'If there are any issues with your order, please contact <a href="mailto:support@thewhite.cool" style="color:#1a1a1a;">support@thewhite.cool</a> within 7 days.'
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
