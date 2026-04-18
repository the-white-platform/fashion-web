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
      name: 'address',
      type: 'textarea',
      localized: true,
      label: { vi: 'Địa chỉ đăng ký', en: 'Registered address' },
      admin: {
        description: {
          vi: 'Địa chỉ pháp lý hiển thị trên footer và trang Liên Hệ. Phải khớp với giấy tờ xác minh doanh nghiệp (Google/Meta).',
          en: 'Legal address shown in footer and Contact page. Must match business verification documents (Google/Meta).',
        },
      },
    },
    {
      name: 'legalEntityName',
      type: 'text',
      label: { vi: 'Pháp nhân đăng ký kinh doanh', en: 'Registered legal entity' },
      admin: {
        description: {
          vi: 'Tên pháp nhân đầy đủ trên giấy phép kinh doanh (vd: CÔNG TY TNHH FASTECH ASIA). Dùng cho công bố Bộ Công Thương.',
          en: 'Full legal entity name from business license (e.g. CÔNG TY TNHH FASTECH ASIA). Used for MoIT disclosure.',
        },
      },
    },
    {
      name: 'taxCode',
      type: 'text',
      label: { vi: 'Mã số thuế / MSDN', en: 'Tax code' },
    },
    {
      name: 'registrationAuthority',
      type: 'text',
      localized: true,
      label: { vi: 'Cơ quan cấp phép', en: 'Issuing authority' },
      admin: {
        description: {
          vi: 'Nơi cấp giấy chứng nhận đăng ký doanh nghiệp (vd: Sở Kế hoạch và Đầu tư TP Hà Nội).',
          en: 'Authority that issued the business registration certificate.',
        },
      },
    },
    {
      name: 'registrationDate',
      type: 'date',
      label: { vi: 'Ngày cấp lần đầu', en: 'First issue date' },
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
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
