import type { CollectionConfig } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { isAdmin, isAdminOrEditor } from '../access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const SizeCharts: CollectionConfig = {
  slug: 'size-charts',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: anyone,
    update: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
    group: { vi: 'Danh Mục Sản Phẩm', en: 'Catalog' },
  },
  labels: {
    singular: { vi: 'Bảng Size', en: 'Size Chart' },
    plural: { vi: 'Bảng Size', en: 'Size Charts' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { vi: 'Tiêu đề', en: 'Title' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      hasMany: false,
      label: { vi: 'Danh mục', en: 'Category' },
      admin: {
        description: {
          vi: 'Bảng size gắn với danh mục sản phẩm.',
          en: 'Size chart linked to a product category.',
        },
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: { vi: 'Văn bản thay thế', en: 'Alt Text' },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/size-charts'),
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageSizes: [
      { name: 'thumbnail', width: 300 },
      { name: 'medium', width: 900 },
      { name: 'large', width: 1400 },
    ],
  },
}
