import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'carouselSlides',
      type: 'array',
      label: 'Carousel Slides',
      minRows: 1,
      maxRows: 5,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: { vi: 'Tiêu đề', en: 'Title' },
        },
        {
          name: 'subtitle',
          type: 'text',
          required: true,
          localized: true,
          label: { vi: 'Phụ đề', en: 'Subtitle' },
        },
        {
          name: 'ctaText',
          type: 'text',
          required: true,
          localized: true,
          label: { vi: 'Văn bản nút', en: 'Button Text' },
          defaultValue: 'Explore Now',
        },
        {
          name: 'ctaLink',
          type: 'text',
          required: true,
          label: 'Button Link',
          defaultValue: '/products',
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Background Image',
          admin: {
            description: 'Optional background image for the slide',
          },
        },
      ],
    },
    {
      name: 'activityCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Shop By Activity Categories',
      admin: {
        description:
          'Select categories to display in the "Shop By Activity" section on the homepage (max 4 recommended)',
      },
    },
    {
      name: 'quickFilters',
      type: 'array',
      label: 'Featured Products Quick Filters',
      minRows: 1,
      maxRows: 8,
      admin: {
        description: 'Configure the quick filter buttons shown in the Featured Products section',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: { vi: 'Nhãn nút', en: 'Button Label' },
          admin: {
            description: {
              vi: 'Văn bản hiển thị trên nút lọc (ví dụ: "TẤT CẢ", "NAM", "NỮ")',
              en: 'Text displayed on the filter button (e.g., "ALL", "MEN", "WOMEN")',
            },
          },
        },
        {
          name: 'filterType',
          type: 'select',
          required: true,
          label: 'Filter Type',
          defaultValue: 'all',
          options: [
            { label: 'Show All Products', value: 'all' },
            { label: 'Filter by Category', value: 'category' },
            { label: 'Filter by Tag (Sale/New)', value: 'tag' },
          ],
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          label: 'Category to Filter',
          admin: {
            condition: (data, siblingData) => siblingData?.filterType === 'category',
            description: 'Select the category to filter products by',
          },
        },
        {
          name: 'tagFilter',
          type: 'select',
          label: 'Tag to Filter',
          options: [
            { label: 'Sale / Discount', value: 'sale' },
            { label: 'New Arrivals', value: 'new' },
            { label: 'Best Sellers', value: 'bestseller' },
          ],
          admin: {
            condition: (data, siblingData) => siblingData?.filterType === 'tag',
            description: 'Select the tag type to filter products by',
          },
        },
      ],
    },
  ],
}
