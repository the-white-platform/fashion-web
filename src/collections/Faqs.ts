import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdmin, isAdminOrEditor } from '../access/roles'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: {
    singular: { vi: 'Câu hỏi thường gặp', en: 'FAQ' },
    plural: { vi: 'Câu hỏi thường gặp', en: 'FAQs' },
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'order', 'published'],
    group: { vi: 'Nội dung', en: 'Content' },
    description: {
      vi: 'Các câu hỏi thường gặp hiển thị trên /faq. Mỗi câu hỏi có bản dịch VI / EN riêng.',
      en: 'FAQ items rendered on /faq. Each row carries its own VI / EN translations.',
    },
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
      label: { vi: 'Câu hỏi', en: 'Question' },
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
      localized: true,
      label: { vi: 'Trả lời', en: 'Answer' },
      admin: {
        rows: 6,
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'order',
      label: { vi: 'Danh mục', en: 'Category' },
      options: [
        { label: { vi: 'Đặt Hàng', en: 'Order' }, value: 'order' },
        { label: { vi: 'Thanh Toán', en: 'Payment' }, value: 'payment' },
        { label: { vi: 'Vận Chuyển', en: 'Shipping' }, value: 'shipping' },
        { label: { vi: 'Đổi Trả', en: 'Returns' }, value: 'return' },
        { label: { vi: 'Sản Phẩm', en: 'Product' }, value: 'product' },
        { label: { vi: 'Tài Khoản', en: 'Account' }, value: 'account' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { vi: 'Thứ tự', en: 'Order' },
      admin: {
        description: {
          vi: 'Càng nhỏ càng hiện trước. Mặc định 0.',
          en: 'Lower number shows first. Default 0.',
        },
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      label: { vi: 'Đã xuất bản', en: 'Published' },
      admin: {
        description: {
          vi: 'Bỏ chọn để ẩn khỏi trang FAQ mà không xoá.',
          en: 'Uncheck to hide from the FAQ page without deleting.',
        },
      },
    },
  ],
  timestamps: true,
}
