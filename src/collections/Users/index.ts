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
      defaultValue: false,
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
