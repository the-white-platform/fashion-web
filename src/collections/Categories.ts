import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdmin, isAdminOrEditor } from '../access/roles'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: anyone,
    update: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
  },
  labels: {
    singular: { vi: 'Danh Mục', en: 'Category' },
    plural: { vi: 'Danh Mục', en: 'Categories' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { vi: 'Tiêu đề', en: 'Title' },
    },
  ],
}
