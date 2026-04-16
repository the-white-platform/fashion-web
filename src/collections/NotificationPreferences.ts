import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin } from '../access/roles'

export const NotificationPreferences: CollectionConfig = {
  slug: 'notification-preferences',
  labels: {
    singular: { vi: 'Tùy chọn thông báo', en: 'Notification Preferences' },
    plural: { vi: 'Tùy chọn thông báo', en: 'Notification Preferences' },
  },
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'updatedAt'],
    group: { vi: 'Hệ thống', en: 'System' },
    // Hidden — no customer-facing preferences UI yet; createNotification
    // writes records but nobody edits them. Restore when we build the
    // notification-settings screen.
    hidden: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin'])) return true
      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => {
      if (!user) return true
      return hasRole(user, ['admin'])
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin'])) return true
      return { user: { equals: user.id } }
    },
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      label: { vi: 'Người dùng', en: 'User' },
    },
    {
      name: 'inApp',
      type: 'group',
      label: { vi: 'Thông báo trong ứng dụng', en: 'In-App Notifications' },
      fields: [
        {
          name: 'newOrder',
          type: 'checkbox',
          defaultValue: true,
          label: { vi: 'Đơn hàng mới', en: 'New Order' },
        },
        {
          name: 'lowStock',
          type: 'checkbox',
          defaultValue: true,
          label: { vi: 'Hàng sắp hết', en: 'Low Stock' },
        },
        {
          name: 'returnRequest',
          type: 'checkbox',
          defaultValue: true,
          label: { vi: 'Yêu cầu hoàn trả', en: 'Return Request' },
        },
        {
          name: 'newUser',
          type: 'checkbox',
          defaultValue: true,
          label: { vi: 'Người dùng mới', en: 'New User' },
        },
      ],
    },
    {
      name: 'email',
      type: 'group',
      label: { vi: 'Thông báo qua email', en: 'Email Notifications' },
      fields: [
        {
          name: 'newOrder',
          type: 'checkbox',
          defaultValue: true,
          label: { vi: 'Đơn hàng mới', en: 'New Order' },
        },
        {
          name: 'lowStock',
          type: 'checkbox',
          defaultValue: true,
          label: { vi: 'Hàng sắp hết', en: 'Low Stock' },
        },
        {
          name: 'returnRequest',
          type: 'checkbox',
          defaultValue: true,
          label: { vi: 'Yêu cầu hoàn trả', en: 'Return Request' },
        },
      ],
    },
  ],
  timestamps: true,
}
