import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: () => true,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'sub',
      type: 'text',
      admin: {
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'local',
      options: [
        {
          label: 'Local',
          value: 'local',
        },
        {
          label: 'Google',
          value: 'google',
        },
        {
          label: 'Facebook',
          value: 'facebook',
        },
      ],
      access: {
        update: () => false, // Only server-side code (OAuth callbacks) can set this
      },
    },
    {
      name: 'imageUrl',
      type: 'text',
    },
    {
      name: 'shippingAddresses',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
        },
        {
          name: 'address',
          type: 'text',
          required: true,
        },
        {
          name: 'city',
          type: 'relationship',
          relationTo: 'provinces',
          required: true,
        },
        {
          name: 'district',
          type: 'relationship',
          relationTo: 'districts',
          required: true,
        },
        {
          name: 'ward',
          type: 'relationship',
          relationTo: 'wards',
        },
        {
          name: 'isDefault',
          type: 'checkbox',
        },
      ],
    },
    {
      name: 'paymentMethods',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'COD', value: 'cod' },
            { label: 'Bank Transfer', value: 'bank_transfer' },
            { label: 'MoMo', value: 'momo' },
            { label: 'VNPay', value: 'vnpay' },
          ],
        },
        {
          name: 'cardNumber',
          type: 'text',
        },
        {
          name: 'isDefault',
          type: 'checkbox',
        },
      ],
    },
  ],
  timestamps: true,
}
