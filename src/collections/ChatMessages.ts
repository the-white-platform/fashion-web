import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin } from '../access/roles'

export const ChatMessages: CollectionConfig = {
  slug: 'chat-messages',
  labels: {
    singular: { vi: 'Tin nhắn', en: 'Message' },
    plural: { vi: 'Tin nhắn', en: 'Messages' },
  },
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['conversation', 'role', 'content', 'createdAt'],
    group: { vi: 'Hỗ trợ', en: 'Support' },
  },
  access: {
    read: ({ req: { user } }) => hasRole(user, ['admin', 'editor', 'staff']),
    create: ({ req: { user } }) => {
      // Server-side (no user) or admin can create
      if (!user) return true
      return hasRole(user, ['admin'])
    },
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'chat-conversations',
      required: true,
      label: { vi: 'Cuộc trò chuyện', en: 'Conversation' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      label: { vi: 'Vai trò', en: 'Role' },
      options: [
        { label: { vi: 'Người dùng', en: 'User' }, value: 'user' },
        { label: { vi: 'Trợ lý AI', en: 'Assistant' }, value: 'assistant' },
        { label: { vi: 'Admin', en: 'Admin' }, value: 'admin' },
      ],
    },
    {
      name: 'content',
      type: 'textarea',
      label: { vi: 'Nội dung', en: 'Content' },
    },
    {
      name: 'senderName',
      type: 'text',
      label: { vi: 'Tên người gửi', en: 'Sender Name' },
    },
    {
      name: 'metadata',
      type: 'json',
      label: { vi: 'Dữ liệu thêm', en: 'Metadata' },
    },
    {
      name: 'channel',
      type: 'select',
      label: { vi: 'Kênh', en: 'Channel' },
      options: [
        { label: 'Web', value: 'web' },
        { label: 'Zalo', value: 'zalo' },
      ],
    },
  ],
  timestamps: true,
}
