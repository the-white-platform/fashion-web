import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin } from '../access/roles'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  labels: {
    singular: { vi: 'Thông báo', en: 'Notification' },
    plural: { vi: 'Thông báo', en: 'Notifications' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['type', 'title', 'read', 'createdAt'],
    group: { vi: 'Hệ thống', en: 'System' },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin'])) return true
      return { recipient: { equals: user.id } }
    },
    create: ({ req: { user } }) => {
      // Only server-side (no user in req) or admin
      if (!user) return true
      return hasRole(user, ['admin'])
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin'])) return true
      return { recipient: { equals: user.id } }
    },
    delete: isAdmin,
  },
  fields: [
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: { vi: 'Người nhận', en: 'Recipient' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: { vi: 'Loại thông báo', en: 'Type' },
      options: [
        { label: { vi: 'Đơn hàng mới', en: 'New Order' }, value: 'new_order' },
        {
          label: { vi: 'Thay đổi trạng thái đơn', en: 'Order Status Change' },
          value: 'order_status_change',
        },
        { label: { vi: 'Hàng sắp hết', en: 'Low Stock' }, value: 'low_stock' },
        { label: { vi: 'Hết hàng', en: 'Out of Stock' }, value: 'out_of_stock' },
        { label: { vi: 'Yêu cầu hoàn trả', en: 'Return Request' }, value: 'return_request' },
        { label: { vi: 'Người dùng mới', en: 'New User' }, value: 'new_user' },
        { label: { vi: 'Form mới', en: 'New Form Submission' }, value: 'new_form_submission' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: { vi: 'Tiêu đề', en: 'Title' },
    },
    {
      name: 'message',
      type: 'text',
      required: true,
      label: { vi: 'Nội dung', en: 'Message' },
    },
    {
      name: 'link',
      type: 'text',
      label: { vi: 'Liên kết', en: 'Link' },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      label: { vi: 'Đã đọc', en: 'Read' },
    },
    {
      name: 'readAt',
      type: 'date',
      label: { vi: 'Thời gian đọc', en: 'Read At' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'metadata',
      type: 'json',
      label: { vi: 'Dữ liệu thêm', en: 'Metadata' },
    },
  ],
  timestamps: true,
}
