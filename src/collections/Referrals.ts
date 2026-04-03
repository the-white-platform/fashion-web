import type { CollectionConfig, Where } from 'payload'
import { hasRole, isAdmin } from '../access/roles'

export const Referrals: CollectionConfig = {
  slug: 'referrals',
  labels: {
    singular: { vi: 'Giới Thiệu', en: 'Referral' },
    plural: { vi: 'Giới Thiệu', en: 'Referrals' },
  },
  admin: {
    useAsTitle: 'referralCode',
    defaultColumns: ['referrer', 'referee', 'referralCode', 'status', 'createdAt'],
    group: { vi: 'Tiếp thị', en: 'Marketing' },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin', 'editor', 'staff'])) return true
      const where: Where = {
        or: [{ referrer: { equals: user.id } } as Where, { referee: { equals: user.id } } as Where],
      }
      return where
    },
    create: ({ req: { user } }) => hasRole(user, ['admin']),
    update: ({ req: { user } }) => hasRole(user, ['admin']),
    delete: isAdmin,
  },
  fields: [
    {
      name: 'referrer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: { vi: 'Người giới thiệu', en: 'Referrer' },
    },
    {
      name: 'referee',
      type: 'relationship',
      relationTo: 'users',
      label: { vi: 'Người được giới thiệu', en: 'Referee' },
    },
    {
      name: 'referralCode',
      type: 'text',
      unique: true,
      required: true,
      label: { vi: 'Mã giới thiệu', en: 'Referral Code' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      label: { vi: 'Trạng thái', en: 'Status' },
      options: [
        { label: { vi: 'Chờ xử lý', en: 'Pending' }, value: 'pending' },
        { label: { vi: 'Hoàn thành', en: 'Completed' }, value: 'completed' },
        { label: { vi: 'Hết hạn', en: 'Expired' }, value: 'expired' },
      ],
    },
    {
      name: 'referrerReward',
      type: 'select',
      defaultValue: 'pending',
      label: { vi: 'Thưởng người giới thiệu', en: 'Referrer Reward' },
      options: [
        { label: { vi: 'Chờ xử lý', en: 'Pending' }, value: 'pending' },
        { label: { vi: 'Đã ghi nhận', en: 'Credited' }, value: 'credited' },
      ],
    },
    {
      name: 'refereeReward',
      type: 'select',
      defaultValue: 'pending',
      label: { vi: 'Thưởng người được giới thiệu', en: 'Referee Reward' },
      options: [
        { label: { vi: 'Chờ xử lý', en: 'Pending' }, value: 'pending' },
        { label: { vi: 'Đã ghi nhận', en: 'Credited' }, value: 'credited' },
      ],
    },
    {
      name: 'completedAt',
      type: 'date',
      label: { vi: 'Ngày hoàn thành', en: 'Completed At' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
