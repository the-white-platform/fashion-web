import type { GlobalConfig } from 'payload'

export const PaymentMethods: GlobalConfig = {
  slug: 'payment-methods',
  access: {
    read: () => true,
  },
  label: { vi: 'Phương Thức Thanh Toán', en: 'Payment Methods' },
  fields: [
    // COD - Cash on Delivery
    {
      name: 'cod',
      type: 'group',
      label: { vi: 'Thanh toán khi nhận hàng (COD)', en: 'Cash on Delivery (COD)' },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: { vi: 'Bật', en: 'Enabled' },
        },
        {
          name: 'name',
          type: 'text',
          localized: true,
          label: { vi: 'Tên hiển thị', en: 'Display Name' },
          defaultValue: 'Thanh toán khi nhận hàng',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { vi: 'Mô tả', en: 'Description' },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: { vi: 'Biểu tượng', en: 'Icon' },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 1,
          label: { vi: 'Thứ tự hiển thị', en: 'Sort Order' },
        },
      ],
    },

    // Bank Transfer
    {
      name: 'bankTransfer',
      type: 'group',
      label: { vi: 'Chuyển khoản ngân hàng', en: 'Bank Transfer' },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: { vi: 'Bật', en: 'Enabled' },
        },
        {
          name: 'name',
          type: 'text',
          localized: true,
          label: { vi: 'Tên hiển thị', en: 'Display Name' },
          defaultValue: 'Chuyển khoản ngân hàng',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { vi: 'Mô tả', en: 'Description' },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: { vi: 'Biểu tượng', en: 'Icon' },
        },
        {
          name: 'bankName',
          type: 'text',
          label: { vi: 'Tên ngân hàng', en: 'Bank Name' },
        },
        {
          name: 'accountNumber',
          type: 'text',
          label: { vi: 'Số tài khoản', en: 'Account Number' },
        },
        {
          name: 'accountName',
          type: 'text',
          label: { vi: 'Tên chủ tài khoản', en: 'Account Holder Name' },
        },
        {
          name: 'branch',
          type: 'text',
          label: { vi: 'Chi nhánh', en: 'Branch' },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 2,
          label: { vi: 'Thứ tự hiển thị', en: 'Sort Order' },
        },
      ],
    },

    // QR Code Payment
    {
      name: 'qrCode',
      type: 'group',
      label: { vi: 'Thanh toán bằng mã QR', en: 'QR Code Payment' },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: { vi: 'Bật', en: 'Enabled' },
        },
        {
          name: 'name',
          type: 'text',
          localized: true,
          label: { vi: 'Tên hiển thị', en: 'Display Name' },
          defaultValue: 'Thanh toán bằng mã QR',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { vi: 'Mô tả', en: 'Description' },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: { vi: 'Biểu tượng', en: 'Icon' },
        },
        {
          name: 'qrImage',
          type: 'upload',
          relationTo: 'media',
          label: { vi: 'Hình ảnh mã QR', en: 'QR Code Image' },
          admin: {
            description: {
              vi: 'Tải lên hình ảnh mã QR thanh toán',
              en: 'Upload payment QR code image',
            },
          },
        },
        {
          name: 'instructions',
          type: 'richText',
          localized: true,
          label: { vi: 'Hướng dẫn thanh toán', en: 'Payment Instructions' },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 3,
          label: { vi: 'Thứ tự hiển thị', en: 'Sort Order' },
        },
      ],
    },

    // VNPay
    {
      name: 'vnpay',
      type: 'group',
      label: 'VNPay',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          label: { vi: 'Bật', en: 'Enabled' },
        },
        {
          name: 'name',
          type: 'text',
          localized: true,
          label: { vi: 'Tên hiển thị', en: 'Display Name' },
          defaultValue: 'VNPay',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { vi: 'Mô tả', en: 'Description' },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: { vi: 'Biểu tượng', en: 'Icon' },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 4,
          label: { vi: 'Thứ tự hiển thị', en: 'Sort Order' },
        },
      ],
      admin: {
        description: {
          vi: 'Cấu hình API keys trong biến môi trường: VNPAY_MERCHANT_ID, VNPAY_SECRET_KEY',
          en: 'Configure API keys in environment variables: VNPAY_MERCHANT_ID, VNPAY_SECRET_KEY',
        },
      },
    },

    // Stripe (International Cards)
    {
      name: 'stripe',
      type: 'group',
      label: 'Stripe',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          label: { vi: 'Bật', en: 'Enabled' },
        },
        {
          name: 'name',
          type: 'text',
          localized: true,
          label: { vi: 'Tên hiển thị', en: 'Display Name' },
          defaultValue: 'Credit/Debit Card',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { vi: 'Mô tả', en: 'Description' },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: { vi: 'Biểu tượng', en: 'Icon' },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 5,
          label: { vi: 'Thứ tự hiển thị', en: 'Sort Order' },
        },
      ],
      admin: {
        description: {
          vi: 'Cấu hình API keys trong biến môi trường: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY',
          en: 'Configure API keys in environment variables: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY',
        },
      },
    },

    // MoMo E-wallet
    {
      name: 'momo',
      type: 'group',
      label: 'MoMo',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          label: { vi: 'Bật', en: 'Enabled' },
        },
        {
          name: 'name',
          type: 'text',
          localized: true,
          label: { vi: 'Tên hiển thị', en: 'Display Name' },
          defaultValue: 'Ví MoMo',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { vi: 'Mô tả', en: 'Description' },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: { vi: 'Biểu tượng', en: 'Icon' },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 6,
          label: { vi: 'Thứ tự hiển thị', en: 'Sort Order' },
        },
      ],
      admin: {
        description: {
          vi: 'Cấu hình API keys trong biến môi trường: MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY',
          en: 'Configure API keys in environment variables: MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY',
        },
      },
    },
  ],
}
