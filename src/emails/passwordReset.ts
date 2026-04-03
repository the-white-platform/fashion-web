type Params = {
  resetLink: string
  locale: 'vi' | 'en'
}

export const passwordReset = ({ resetLink, locale }: Params): { subject: string; html: string } => {
  const isVi = locale === 'vi'

  const subject = isVi ? 'Đặt lại mật khẩu - The White' : 'Reset Your Password - The White'

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
            <td style="padding:40px 40px 20px;text-align:center;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:400;">
                ${isVi ? 'Đặt lại mật khẩu' : 'Reset Your Password'}
              </h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#444;">
                ${
                  isVi
                    ? 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tiếp tục.'
                    : 'We received a request to reset your account password. Click the button below to proceed.'
                }
              </p>

              <!-- CTA -->
              <a href="${resetLink}"
                style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:14px;font-weight:600;letter-spacing:1px;margin-bottom:24px;">
                ${isVi ? 'ĐẶT LẠI MẬT KHẨU' : 'RESET PASSWORD'}
              </a>

              <p style="margin:0 0 16px;font-size:13px;color:#888;">
                ${isVi ? 'Liên kết này sẽ hết hạn sau 1 giờ.' : 'This link will expire in 1 hour.'}
              </p>
              <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
                ${
                  isVi
                    ? 'Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.'
                    : 'If you did not request a password reset, you can safely ignore this email. Your account remains secure.'
                }
              </p>
            </td>
          </tr>

          <!-- Divider + Link fallback -->
          <tr>
            <td style="padding:0 40px 24px;">
              <hr style="border:none;border-top:1px solid #eee;margin:0 0 16px;" />
              <p style="margin:0;font-size:12px;color:#aaa;word-break:break-all;">
                ${isVi ? 'Hoặc copy đường dẫn sau vào trình duyệt:' : 'Or copy this link into your browser:'}
                <br />
                <a href="${resetLink}" style="color:#1a1a1a;">${resetLink}</a>
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
