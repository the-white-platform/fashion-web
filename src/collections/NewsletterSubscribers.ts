import type { CollectionConfig } from 'payload'
import { randomBytes } from 'crypto'
import { hasRole, isAdmin } from '../access/roles'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  labels: {
    singular: { vi: 'Người đăng ký Newsletter', en: 'Newsletter Subscriber' },
    plural: { vi: 'Người đăng ký Newsletter', en: 'Newsletter Subscribers' },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'status', 'subscribedAt'],
    group: { vi: 'Tiếp thị', en: 'Marketing' },
  },
  access: {
    read: ({ req: { user } }) => hasRole(user, ['admin', 'editor']),
    create: () => true,
    update: ({ req: { user } }) => hasRole(user, ['admin', 'editor']),
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' && !data.unsubscribeToken) {
          data.unsubscribeToken = randomBytes(32).toString('hex')
        }
        if (operation === 'create' && !data.subscribedAt) {
          data.subscribedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: { vi: 'Email', en: 'Email' },
    },
    {
      name: 'name',
      type: 'text',
      label: { vi: 'Tên', en: 'Name' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      label: { vi: 'Trạng thái', en: 'Status' },
      options: [
        { label: { vi: 'Đang hoạt động', en: 'Active' }, value: 'active' },
        { label: { vi: 'Đã hủy đăng ký', en: 'Unsubscribed' }, value: 'unsubscribed' },
        { label: { vi: 'Lỗi gửi mail', en: 'Bounced' }, value: 'bounced' },
      ],
    },
    {
      name: 'preferredLocale',
      type: 'select',
      required: true,
      defaultValue: 'vi',
      label: { vi: 'Ngôn ngữ ưu tiên', en: 'Preferred language' },
      options: [
        { label: { vi: 'Tiếng Việt', en: 'Vietnamese' }, value: 'vi' },
        { label: { vi: 'Tiếng Anh', en: 'English' }, value: 'en' },
      ],
    },
    {
      name: 'subscribedAt',
      type: 'date',
      label: { vi: 'Ngày đăng ký', en: 'Subscribed At' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
      label: { vi: 'Ngày hủy đăng ký', en: 'Unsubscribed At' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'source',
      type: 'select',
      label: { vi: 'Nguồn', en: 'Source' },
      options: [
        { label: { vi: 'Footer', en: 'Footer Form' }, value: 'footer_form' },
        { label: { vi: 'Checkout', en: 'Checkout' }, value: 'checkout' },
        { label: { vi: 'Thủ công', en: 'Manual' }, value: 'manual' },
      ],
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      unique: true,
      label: { vi: 'Token hủy đăng ký', en: 'Unsubscribe Token' },
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
