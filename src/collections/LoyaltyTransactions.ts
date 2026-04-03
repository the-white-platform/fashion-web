import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin } from '../access/roles'

export const LoyaltyTransactions: CollectionConfig = {
  slug: 'loyalty-transactions',
  labels: {
    singular: { vi: 'Giao Dịch Điểm', en: 'Loyalty Transaction' },
    plural: { vi: 'Giao Dịch Điểm', en: 'Loyalty Transactions' },
  },
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['user', 'type', 'points', 'balance', 'createdAt'],
    group: { vi: 'Tiếp thị', en: 'Marketing' },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin', 'editor', 'staff'])) return true
      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => hasRole(user, ['admin']),
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: { vi: 'Người dùng', en: 'User' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: { vi: 'Loại giao dịch', en: 'Transaction Type' },
      options: [
        { label: { vi: 'Mua hàng', en: 'Earn: Purchase' }, value: 'earn_purchase' },
        { label: { vi: 'Đánh giá sản phẩm', en: 'Earn: Review' }, value: 'earn_review' },
        { label: { vi: 'Giới thiệu bạn', en: 'Earn: Referral' }, value: 'earn_referral' },
        { label: { vi: 'Đổi điểm', en: 'Redeem' }, value: 'redeem' },
        { label: { vi: 'Điểm hết hạn', en: 'Expire' }, value: 'expire' },
        { label: { vi: 'Điều chỉnh', en: 'Adjustment' }, value: 'adjustment' },
      ],
    },
    {
      name: 'points',
      type: 'number',
      required: true,
      label: { vi: 'Điểm', en: 'Points' },
      admin: {
        description: {
          vi: 'Dương = cộng điểm, Âm = trừ điểm',
          en: 'Positive = earn, Negative = deduct',
        },
      },
    },
    {
      name: 'balance',
      type: 'number',
      required: true,
      label: { vi: 'Số dư sau giao dịch', en: 'Balance After' },
    },
    {
      name: 'description',
      type: 'text',
      label: { vi: 'Mô tả', en: 'Description' },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      label: { vi: 'Đơn hàng', en: 'Order' },
    },
    {
      name: 'review',
      type: 'relationship',
      relationTo: 'reviews',
      label: { vi: 'Đánh giá', en: 'Review' },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: { vi: 'Ngày hết hạn', en: 'Expires At' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
  timestamps: true,
}
