import type { CompanyInfo } from '@/payload-types'
import { brandFooter, resolveServerUrl } from './_shared'

import type { Order } from '@/payload-types'

type Params = {
  order: Order
  locale: 'vi' | 'en'
  company?: CompanyInfo | null
}

export const deliveryConfirmation = ({
  order,
  locale,
  company = null,
}: Params): { subject: string; html: string } => {
  const isVi = locale === 'vi'
  const serverUrl = resolveServerUrl()
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
              <img src="https://thewhite.cool/logo/thewhite-active.png" alt="THE WHITE ACTIVE" width="120" style="display:block;margin:0 auto;border:0;max-width:120px;height:auto;" />
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
                ${isVi ? 'Cảm ơn bạn đã mua hàng tại THE WHITE ACTIVE!' : 'Thank you for shopping at THE WHITE ACTIVE!'}
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
          ${brandFooter({ locale, serverUrl, company })}
</table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}
