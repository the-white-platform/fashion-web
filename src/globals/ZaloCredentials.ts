import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/roles'

/**
 * Zalo OA credentials cache. Holds the long-lived `refresh_token`
 * returned by `/v4/oa/access_token` plus the short-lived
 * `access_token` it mints for outbound API calls. Moving the
 * refresh token here (out of Secret Manager) lets the admin
 * renew it via an in-app button instead of running
 * `gcloud secrets versions add` on their own box every 3 months.
 *
 * Admin-only: these tokens grant our server the ability to send
 * ZNS / OA messages on behalf of the account, so nothing below
 * should ever leak to a customer.
 */
export const ZaloCredentials: GlobalConfig = {
  slug: 'zalo-credentials',
  label: { vi: 'Xác thực Zalo OA', en: 'Zalo OA Credentials' },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    description: {
      vi: 'Token OA tự làm mới mỗi ~3 tháng. Nhấn nút “Làm mới token” trên Dashboard nếu gần hết hạn.',
      en: 'OA tokens auto-renew every ~3 months. Use the Dashboard "Renew token" button when near expiry.',
    },
    group: { vi: 'Tích hợp', en: 'Integrations' },
  },
  fields: [
    {
      name: 'refreshToken',
      type: 'text',
      admin: {
        readOnly: true,
        description: {
          vi: 'Tự động ghi khi admin hoàn tất /api/auth/zalo/oa-connect.',
          en: 'Auto-written after the admin completes /api/auth/zalo/oa-connect.',
        },
      },
    },
    {
      name: 'refreshTokenIssuedAt',
      type: 'date',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'refreshTokenExpiresAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: {
          vi: 'Zalo cấp token OA hiệu lực 3 tháng. Dashboard sẽ cảnh báo trước 14 ngày.',
          en: 'Zalo OA refresh tokens live ~3 months. The dashboard warns 14 days before expiry.',
        },
      },
    },
    {
      name: 'accessToken',
      type: 'text',
      admin: { readOnly: true, hidden: true },
    },
    {
      name: 'accessTokenExpiresAt',
      type: 'date',
      admin: { readOnly: true, hidden: true, date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
