import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@/access/roles'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  labels: { singular: 'Coupon', plural: 'Coupons' },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'active', 'usageCount', 'validUntil'],
  },
  access: {
    read: () => true, // Public read needed for checkout coupon validation
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Uppercase coupon code, e.g. WELCOME10' },
      hooks: {
        beforeValidate: [({ value }) => (typeof value === 'string' ? value.toUpperCase() : value)],
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed Amount', value: 'fixed' },
        { label: 'Free Shipping', value: 'shipping' },
      ],
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      admin: {
        description: 'Percentage (0-100) for percentage type, VND amount for fixed, 0 for shipping',
      },
    },
    {
      name: 'description',
      type: 'text',
      localized: true,
    },
    {
      name: 'minOrderAmount',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Minimum subtotal required to use this coupon (VND)' },
    },
    {
      name: 'maxDiscount',
      type: 'number',
      admin: { description: 'Maximum discount cap for percentage coupons (VND)' },
    },
    {
      name: 'usageLimit',
      type: 'number',
      defaultValue: 0,
      admin: { description: '0 = unlimited uses' },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    { name: 'validFrom', type: 'date' },
    { name: 'validUntil', type: 'date' },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
