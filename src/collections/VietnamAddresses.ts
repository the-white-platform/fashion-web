import type { CollectionConfig } from 'payload'

export const Provinces: CollectionConfig = {
  slug: 'provinces',
  admin: {
    useAsTitle: 'name',
    group: { vi: 'Địa chỉ VN', en: 'VN Addresses' },
    defaultColumns: ['name', 'code'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
  ],
}

export const Districts: CollectionConfig = {
  slug: 'districts',
  admin: {
    useAsTitle: 'name',
    group: { vi: 'Địa chỉ VN', en: 'VN Addresses' },
    defaultColumns: ['name', 'code', 'province'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'province',
      type: 'relationship',
      relationTo: 'provinces',
      required: true,
      index: true,
    },
  ],
}

export const Wards: CollectionConfig = {
  slug: 'wards',
  admin: {
    useAsTitle: 'name',
    group: { vi: 'Địa chỉ VN', en: 'VN Addresses' },
    defaultColumns: ['name', 'code', 'district'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'district',
      type: 'relationship',
      relationTo: 'districts',
      required: true,
      index: true,
    },
  ],
}
