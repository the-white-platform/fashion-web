import type { CollectionConfig } from 'payload'

import { hasRole, isAdmin, adminFieldAccess } from '../../access/roles'
import { notifyOnNewUser } from './hooks/notifyOnNewUser'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => hasRole(user, ['admin', 'editor', 'staff']),
    create: () => true,
    delete: isAdmin,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (['admin'].includes(user.role ?? 'customer')) return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (['admin'].includes(user.role ?? 'customer')) return true
      return { id: { equals: user.id } }
    },
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if ((operation === 'create' || data.password) && data.password) {
          if (data.password.length < 8) {
            throw new Error('Password must be at least 8 characters')
          }
        }
        // Auto-generate referral code on create
        if (operation === 'create' && !data.referralCode) {
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          data.referralCode = `TW-${timestamp}-${random}`
        }

        // Prune expired sessions on every user write. Payload's
        // default login handler appends to `sessions` without ever
        // expiring old rows, so the array grows unbounded. On
        // 2026-04-22 admin login stalled 60-200s until the
        // `users_sessions` rows were manually deleted — one
        // malformed row was enough to hang the per-login filter
        // step. Filtering here at write time keeps the array bounded
        // and skips any row with a malformed `expiresAt`.
        if (Array.isArray(data.sessions)) {
          const nowMs = Date.now()
          data.sessions = data.sessions.filter((session) => {
            const exp = session?.expiresAt ? Date.parse(String(session.expiresAt)) : NaN
            return Number.isFinite(exp) && exp > nowMs
          })
        }

        return data
      },
    ],
    afterChange: [notifyOnNewUser],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'customer',
      options: [
        { label: { vi: 'Quản trị viên', en: 'Admin' }, value: 'admin' },
        { label: { vi: 'Biên tập viên', en: 'Editor' }, value: 'editor' },
        { label: { vi: 'Nhân viên', en: 'Staff' }, value: 'staff' },
        { label: { vi: 'Khách hàng', en: 'Customer' }, value: 'customer' },
      ],
      access: {
        update: adminFieldAccess,
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
      index: true,
      // Not `unique: true` because legacy rows may have duplicate
      // phones from back when phone was purely optional — flipping
      // the constraint would fail migration. Uniqueness is enforced
      // in the register-identity + Zalo-callback routes via an
      // explicit lookup before insert; duplicates caught there
      // surface as a proper "phone already used" error to the
      // user instead of a raw DB constraint violation.
    },
    {
      name: 'preferredLocale',
      type: 'select',
      defaultValue: 'vi',
      label: { vi: 'Ngôn ngữ ưu tiên', en: 'Preferred language' },
      options: [
        { label: { vi: 'Tiếng Việt', en: 'Vietnamese' }, value: 'vi' },
        { label: { vi: 'Tiếng Anh', en: 'English' }, value: 'en' },
      ],
      admin: {
        description: {
          vi: 'Ngôn ngữ mà khách hàng sẽ nhận email, thông báo và giao tiếp ngoài trang web.',
          en: 'Language used for emails, notifications, and off-site communication.',
        },
      },
    },
    {
      name: 'sub',
      type: 'text',
      admin: {
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'local',
      options: [
        {
          label: 'Local',
          value: 'local',
        },
        {
          label: 'Google',
          value: 'google',
        },
        {
          label: 'Facebook',
          value: 'facebook',
        },
        {
          label: 'Zalo',
          value: 'zalo',
        },
      ],
      access: {
        update: () => false, // Only server-side code (OAuth callbacks) can set this
      },
    },
    {
      name: 'imageUrl',
      type: 'text',
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      // Bcrypt-hashed one-time code issued by /api/auth/otp/request.
      // Never plaintext. Cleared on successful verify or expiry.
      name: 'otpHash',
      type: 'text',
      admin: { hidden: true },
      access: {
        read: () => false,
        update: () => false, // server-only via OTP routes
      },
    },
    {
      name: 'otpExpiresAt',
      type: 'date',
      admin: { hidden: true },
      access: { read: () => false, update: () => false },
    },
    {
      // Wall-clock rate-limit guard: reject a new OTP request if
      // this is within the last 60 seconds.
      name: 'otpRequestedAt',
      type: 'date',
      admin: { hidden: true },
      access: { read: () => false, update: () => false },
    },
    {
      name: 'emailVerifyToken',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'cart',
      type: 'array',
      label: { vi: 'Giỏ hàng', en: 'Cart' },
      admin: {
        condition: () => false, // Hide from admin panel
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'variant',
          type: 'text',
        },
        {
          name: 'size',
          type: 'text',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
      ],
    },
    {
      name: 'wishlist',
      type: 'array',
      label: { vi: 'Yêu thích', en: 'Wishlist' },
      admin: {
        condition: () => false,
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
      ],
    },
    {
      name: 'shippingAddresses',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
        },
        {
          name: 'address',
          type: 'text',
          required: true,
        },
        {
          name: 'city',
          type: 'relationship',
          relationTo: 'provinces',
          required: true,
        },
        {
          name: 'district',
          type: 'relationship',
          relationTo: 'districts',
          required: true,
        },
        {
          name: 'ward',
          type: 'relationship',
          relationTo: 'wards',
        },
        {
          name: 'isDefault',
          type: 'checkbox',
        },
      ],
    },
    {
      name: 'referralCode',
      type: 'text',
      unique: true,
      label: { vi: 'Mã giới thiệu', en: 'Referral Code' },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: {
          vi: 'Mã giới thiệu bạn bè (tự động tạo)',
          en: 'Unique referral code (auto-generated)',
        },
      },
    },
    {
      name: 'zaloUserId',
      type: 'text',
      label: { vi: 'Zalo User ID', en: 'Zalo User ID' },
      admin: {
        position: 'sidebar',
        description: { vi: 'ID Zalo của khách hàng', en: 'Customer Zalo user ID' },
      },
      index: true,
    },
    {
      name: 'zaloNotifications',
      type: 'checkbox',
      label: { vi: 'Nhận thông báo qua Zalo', en: 'Receive Zalo Notifications' },
      // Default ON — these are transactional order pings (confirmed
      // / shipping), not marketing. Customers can flip it off in
      // their profile if they don't want the OA messages.
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: {
          vi: 'Gửi thông báo đơn hàng qua Zalo ZNS',
          en: 'Send order notifications via Zalo ZNS',
        },
      },
    },
    {
      name: 'paymentMethods',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'COD', value: 'cod' },
            { label: 'Bank Transfer', value: 'bank_transfer' },
            { label: 'MoMo', value: 'momo' },
            { label: 'VNPay', value: 'vnpay' },
          ],
        },
        {
          name: 'cardNumber',
          type: 'text',
        },
        {
          name: 'isDefault',
          type: 'checkbox',
        },
      ],
    },
  ],
  timestamps: true,
}
