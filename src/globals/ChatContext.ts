import type { GlobalConfig } from 'payload'

/**
 * Context the Wolfies AI assistant reads on every chat turn. All fields
 * are CMS-editable + localized so the team can tune answers without a
 * deploy. The route composes these + a compact catalog table from the
 * `products` collection into the system prompt.
 */
export const ChatContext: GlobalConfig = {
  slug: 'chat-context',
  label: { vi: 'Ngữ cảnh trợ lý AI', en: 'AI Assistant Context' },
  access: {
    read: () => true,
  },
  admin: {
    description: {
      vi: 'Nội dung mà trợ lý AI (chatbot) sẽ dùng để trả lời khách hàng. Cập nhật ở đây có hiệu lực ngay, không cần deploy.',
      en: 'Context the Wolfies AI assistant reads when answering customer questions. Edits apply immediately — no deploy needed.',
    },
  },
  fields: [
    {
      name: 'brandBio',
      type: 'textarea',
      localized: true,
      label: { vi: 'Giới thiệu thương hiệu', en: 'Brand bio' },
      admin: {
        rows: 4,
        description: 'Short brand story the assistant can quote. Keep it under ~200 words.',
      },
    },
    {
      name: 'sizeGuide',
      type: 'textarea',
      localized: true,
      label: { vi: 'Hướng dẫn chọn size', en: 'Size guide' },
      admin: {
        rows: 8,
        description:
          'Plain-text size guide. Include height/weight → size mapping per product line + fit notes (e.g. "Quần vải gân chạy nhỏ 1 size").',
      },
    },
    {
      name: 'shippingPolicy',
      type: 'textarea',
      localized: true,
      label: { vi: 'Chính sách vận chuyển', en: 'Shipping policy' },
      admin: { rows: 4 },
    },
    {
      name: 'returnPolicy',
      type: 'textarea',
      localized: true,
      label: { vi: 'Chính sách đổi trả', en: 'Return policy' },
      admin: { rows: 4 },
    },
    {
      name: 'contactInfo',
      type: 'textarea',
      localized: true,
      label: { vi: 'Thông tin liên hệ', en: 'Contact info' },
      admin: {
        rows: 3,
        description:
          'Phone / email / Zalo / store hours — anything the assistant should quote verbatim.',
      },
    },
    {
      name: 'tonePrompt',
      type: 'textarea',
      localized: true,
      label: { vi: 'Phong cách trả lời', en: 'Tone / style prompt' },
      admin: {
        rows: 3,
        description:
          'Optional override for the default "friendly, concise, warm" tone. Leave empty to use the default.',
      },
    },
  ],
}
