import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin } from '../access/roles'

export const PushSubscriptions: CollectionConfig = {
  slug: 'push-subscriptions',
  labels: {
    singular: { vi: 'Đăng ký Push', en: 'Push Subscription' },
    plural: { vi: 'Đăng ký Push', en: 'Push Subscriptions' },
  },
  admin: {
    useAsTitle: 'endpoint',
    defaultColumns: ['user', 'active', 'createdAt'],
    group: { vi: 'Hệ thống', en: 'System' },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin'])) return true
      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return true
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin'])) return true
      return { user: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin'])) return true
      return { user: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: { vi: 'Người dùng', en: 'User' },
    },
    {
      name: 'endpoint',
      type: 'text',
      required: true,
      label: { vi: 'Endpoint', en: 'Endpoint' },
    },
    {
      name: 'keys',
      type: 'group',
      label: { vi: 'Khóa', en: 'Keys' },
      fields: [
        {
          name: 'p256dh',
          type: 'text',
          required: true,
          label: 'p256dh',
        },
        {
          name: 'auth',
          type: 'text',
          required: true,
          label: 'auth',
        },
      ],
    },
    {
      name: 'userAgent',
      type: 'text',
      label: { vi: 'User Agent', en: 'User Agent' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: { vi: 'Đang hoạt động', en: 'Active' },
    },
  ],
  timestamps: true,
}
