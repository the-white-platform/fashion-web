import { getCompanyInfo } from '@/utilities/getCompanyInfo'
import { brandFooter, brandHeader, resolveServerUrl } from './_shared'

type OtpPurpose = 'login' | 'signup' | 'reset_password' | 'verify_email' | 'two_factor'

type Params = {
  code: string
  purpose?: OtpPurpose
  locale: 'vi' | 'en'
  // Minutes the code stays valid — shown in the email so the user
  // knows to hurry. Default 10 min.
  expiresInMinutes?: number
}

/**
 * Short, single-column email for one-time passcode delivery. The
 * code is rendered prominently (spaced digits, large mono-ish font)
 * because most OTPs get eyeballed rather than clicked. Bilingual
 * copy keyed off `locale`; the bundle of purposes covers login,
 * signup, password reset, email verification, and 2FA so the same
 * template serves every OTP surface.
 *
 * Pulls logo + contact details from the `company-info` Payload
 * global so marketing can edit the registered address / hotline /
 * support email without a deploy.
 */
export const otp = async ({
  code,
  purpose = 'login',
  locale,
  expiresInMinutes = 10,
}: Params): Promise<{ subject: string; html: string }> => {
  const isVi = locale === 'vi'
  const serverUrl = resolveServerUrl()
  const company = await getCompanyInfo(locale).catch(() => null)

  const headings: Record<OtpPurpose, { vi: string; en: string }> = {
    login: { vi: 'Mã đăng nhập', en: 'Login code' },
    signup: { vi: 'Mã đăng ký', en: 'Signup code' },
    reset_password: { vi: 'Mã đặt lại mật khẩu', en: 'Password reset code' },
    verify_email: { vi: 'Mã xác minh email', en: 'Email verification code' },
    two_factor: { vi: 'Mã xác thực', en: 'Verification code' },
  }

  const heading = headings[purpose][isVi ? 'vi' : 'en']
  const subject = `${heading} - The White`

  const intro = isVi
    ? 'Nhập mã dưới đây để tiếp tục. Đừng chia sẻ mã này với bất kỳ ai.'
    : 'Enter the code below to continue. Never share this code with anyone.'

  const expiryNote = isVi
    ? `Mã có hiệu lực trong ${expiresInMinutes} phút.`
    : `This code expires in ${expiresInMinutes} minutes.`

  const notYouNote = isVi
    ? 'Nếu bạn không yêu cầu mã này, có thể bỏ qua email này.'
    : "If you didn't request this code, you can ignore this email."

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

          ${brandHeader(serverUrl)}

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 16px;text-align:center;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:400;">${heading}</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#444;">${intro}</p>

              <!-- Code -->
              <div style="display:inline-block;background:#f3f3f3;border:1px solid #e0e0e0;border-radius:6px;padding:18px 28px;margin:8px 0 20px;">
                <span style="display:inline-block;font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:32px;font-weight:600;letter-spacing:10px;color:#1a1a1a;">
                  ${escapeHtml(code)}
                </span>
              </div>

              <p style="margin:0 0 8px;font-size:13px;color:#666;">${expiryNote}</p>
              <p style="margin:0 0 24px;font-size:13px;color:#666;">${notYouNote}</p>
            </td>
          </tr>

          ${brandFooter({ locale, serverUrl, company })}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}

// Inline HTML escape to avoid pulling a dep. The code itself is
// always digits in practice but the template accepts arbitrary
// strings (e.g. alphanumeric) so be safe.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
