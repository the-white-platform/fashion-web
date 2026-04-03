import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin, isAdminOrEditor } from '../access/roles'

export const ChatConversations: CollectionConfig = {
  slug: 'chat-conversations',
  labels: {
    singular: { vi: 'Cuộc trò chuyện', en: 'Conversation' },
    plural: { vi: 'Cuộc trò chuyện', en: 'Conversations' },
  },
  admin: {
    useAsTitle: 'guestId',
    defaultColumns: ['user', 'status', 'lastMessageAt', 'messageCount', 'assignedTo'],
    group: { vi: 'Hỗ trợ', en: 'Support' },
  },
  access: {
    read: ({ req: { user } }) => hasRole(user, ['admin', 'editor', 'staff']),
    create: ({ req: { user } }) => {
      // Only server-side (no user in req context) can create
      if (!user) return true
      return hasRole(user, ['admin'])
    },
    update: ({ req: { user } }) => hasRole(user, ['admin', 'editor']),
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: { vi: 'Người dùng', en: 'User' },
    },
    {
      name: 'guestId',
      type: 'text',
      label: { vi: 'ID khách', en: 'Guest ID' },
      admin: {
        description: { vi: 'ID ẩn danh cho khách không đăng nhập', en: 'Anonymous ID for guests' },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      label: { vi: 'Trạng thái', en: 'Status' },
      options: [
        { label: { vi: 'Đang hoạt động', en: 'Active' }, value: 'active' },
        { label: { vi: 'Đã đóng', en: 'Closed' }, value: 'closed' },
        { label: { vi: 'Admin tiếp quản', en: 'Admin Takeover' }, value: 'admin_takeover' },
      ],
    },
    {
      name: 'startedAt',
      type: 'date',
      label: { vi: 'Bắt đầu lúc', en: 'Started At' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      label: { vi: 'Tin nhắn cuối', en: 'Last Message At' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'messageCount',
      type: 'number',
      label: { vi: 'Số tin nhắn', en: 'Message Count' },
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'summary',
      type: 'text',
      label: { vi: 'Tóm tắt', en: 'Summary' },
    },
    {
      name: 'tags',
      type: 'array',
      label: { vi: 'Nhãn', en: 'Tags' },
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: { vi: 'Nhãn', en: 'Tag' },
        },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      label: { vi: 'Phân công cho', en: 'Assigned To' },
    },
    {
      name: 'channel',
      type: 'select',
      required: true,
      defaultValue: 'web',
      label: { vi: 'Kênh', en: 'Channel' },
      options: [
        { label: 'Web', value: 'web' },
        { label: 'Zalo', value: 'zalo' },
      ],
    },
    {
      name: 'zaloUserId',
      type: 'text',
      label: { vi: 'Zalo User ID', en: 'Zalo User ID' },
      admin: {
        condition: (data) => data?.channel === 'zalo',
      },
    },
  ],
  timestamps: true,
}
