import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin } from '../access/roles'
import { defaultLexical } from '@/fields/defaultLexical'

export const NewsletterCampaigns: CollectionConfig = {
  slug: 'newsletter-campaigns',
  labels: {
    singular: { vi: 'Chiến dịch Newsletter', en: 'Newsletter Campaign' },
    plural: { vi: 'Chiến dịch Newsletter', en: 'Newsletter Campaigns' },
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'status', 'sentAt', 'recipientCount'],
    group: { vi: 'Tiếp thị', en: 'Marketing' },
  },
  access: {
    read: ({ req: { user } }) => hasRole(user, ['admin', 'editor']),
    create: ({ req: { user } }) => hasRole(user, ['admin', 'editor']),
    update: ({ req: { user } }) => hasRole(user, ['admin', 'editor']),
    delete: isAdmin,
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      localized: true,
      label: { vi: 'Tiêu đề', en: 'Subject' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: defaultLexical,
      label: { vi: 'Nội dung', en: 'Content' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: { vi: 'Trạng thái', en: 'Status' },
      options: [
        { label: { vi: 'Bản nháp', en: 'Draft' }, value: 'draft' },
        { label: { vi: 'Đang gửi', en: 'Sending' }, value: 'sending' },
        { label: { vi: 'Đã gửi', en: 'Sent' }, value: 'sent' },
        { label: { vi: 'Thất bại', en: 'Failed' }, value: 'failed' },
      ],
    },
    {
      name: 'sentAt',
      type: 'date',
      label: { vi: 'Ngày gửi', en: 'Sent At' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
      },
    },
    {
      name: 'recipientCount',
      type: 'number',
      label: { vi: 'Số người nhận', en: 'Recipient Count' },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'targetAudience',
      type: 'select',
      defaultValue: 'all_active',
      label: { vi: 'Đối tượng', en: 'Target Audience' },
      options: [
        { label: { vi: 'Tất cả đang hoạt động', en: 'All Active' }, value: 'all_active' },
        { label: { vi: 'Phân khúc tùy chỉnh', en: 'Custom Segment' }, value: 'custom_segment' },
      ],
    },
  ],
  timestamps: true,
}
