import type { GlobalConfig } from 'payload'

/**
 * Single source of truth for the brand's public contact info — email, phone,
 * website, legal entity name. Consumed by privacy-policy and terms-of-use
 * pages so the admin can edit these in one place without a deploy, and
 * shared with any future page that quotes company details.
 */
export const CompanyInfo: GlobalConfig = {
  slug: 'company-info',
  label: { vi: 'Thông Tin Công Ty', en: 'Company Info' },
  access: {
    read: () => true,
  },
  admin: {
    description: {
      vi: 'Thông tin liên hệ hiển thị trên trang Chính Sách Bảo Mật, Điều Khoản Sử Dụng và các trang pháp lý khác.',
      en: 'Contact details displayed on Privacy Policy, Terms of Use, and other legal pages.',
    },
  },
  fields: [
    {
      name: 'companyName',
      type: 'text',
      localized: true,
      label: { vi: 'Tên công ty / pháp nhân', en: 'Company / legal entity' },
    },
    {
      name: 'email',
      type: 'email',
      label: { vi: 'Email liên hệ', en: 'Contact email' },
    },
    {
      name: 'phone',
      type: 'text',
      label: { vi: 'Hotline / Zalo', en: 'Hotline / Zalo' },
    },
    {
      name: 'websiteUrl',
      type: 'text',
      label: { vi: 'Địa chỉ website', en: 'Website URL' },
      admin: {
        description: {
          vi: 'Không kèm http:// — ví dụ: thewhite.cool',
          en: 'No protocol — e.g. thewhite.cool',
        },
      },
    },
  ],
}
