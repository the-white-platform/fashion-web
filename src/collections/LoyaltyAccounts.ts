import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin } from '../access/roles'

export const LoyaltyAccounts: CollectionConfig = {
  slug: 'loyalty-accounts',
  labels: {
    singular: { vi: 'Tài Khoản Điểm Thưởng', en: 'Loyalty Account' },
    plural: { vi: 'Tài Khoản Điểm Thưởng', en: 'Loyalty Accounts' },
  },
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'points', 'tier', 'tierUpdatedAt'],
    group: { vi: 'Tiếp thị', en: 'Marketing' },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin', 'editor', 'staff'])) return true
      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => hasRole(user, ['admin']),
    update: ({ req: { user } }) => hasRole(user, ['admin']),
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      label: { vi: 'Người dùng', en: 'User' },
    },
    {
      name: 'points',
      type: 'number',
      defaultValue: 0,
      required: true,
      label: { vi: 'Điểm hiện tại', en: 'Current Points' },
      admin: {
        description: { vi: 'Điểm có thể sử dụng', en: 'Redeemable points' },
      },
    },
    {
      name: 'lifetimePoints',
      type: 'number',
      defaultValue: 0,
      required: true,
      label: { vi: 'Tổng điểm tích lũy', en: 'Lifetime Points' },
      admin: {
        description: {
          vi: 'Tổng điểm đã tích lũy từ trước đến nay',
          en: 'Total points earned all time',
        },
      },
    },
    {
      name: 'tier',
      type: 'select',
      defaultValue: 'bronze',
      required: true,
      label: { vi: 'Hạng thành viên', en: 'Membership Tier' },
      options: [
        { label: { vi: 'Đồng', en: 'Bronze' }, value: 'bronze' },
        { label: { vi: 'Bạc', en: 'Silver' }, value: 'silver' },
        { label: { vi: 'Vàng', en: 'Gold' }, value: 'gold' },
        { label: { vi: 'Bạch Kim', en: 'Platinum' }, value: 'platinum' },
      ],
    },
    {
      name: 'tierUpdatedAt',
      type: 'date',
      label: { vi: 'Ngày cập nhật hạng', en: 'Tier Updated At' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
