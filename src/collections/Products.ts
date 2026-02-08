import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'tag', 'inStock'],
  },
  labels: {
    singular: { vi: 'Sản Phẩm', en: 'Product' },
    plural: { vi: 'Sản Phẩm', en: 'Products' },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { vi: 'Tên Sản Phẩm', en: 'Product Name' },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      label: { vi: 'Đường dẫn', en: 'Slug' },
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
      label: { vi: 'Danh Mục', en: 'Category' },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: { vi: 'Giá (VND)', en: 'Price (VND)' },
      min: 0,
    },
    {
      name: 'originalPrice',
      type: 'number',
      label: { vi: 'Giá Gốc (VND)', en: 'Original Price (VND)' },
      min: 0,
      admin: {
        description: { vi: 'Để trống nếu không có giảm giá', en: 'Leave empty if no discount' },
      },
    },
    {
      name: 'colorVariants',
      type: 'array',
      label: { vi: 'Biến Thể Màu Sắc', en: 'Color Variants' },
      admin: {
        description: {
          vi: 'Thêm hình ảnh riêng cho từng màu sắc. Màu đầu tiên sẽ là màu mặc định.',
          en: 'Add separate images for each color. The first color will be the default.',
        },
      },
      fields: [
        {
          name: 'color',
          type: 'text',
          required: true,
          localized: true,
          label: { vi: 'Tên Màu', en: 'Color Name' },
          admin: {
            description: {
              vi: 'Ví dụ: Đen, Trắng, Xanh Navy',
              en: 'Example: Black, White, Navy Blue',
            },
          },
        },
        {
          name: 'colorHex',
          type: 'text',
          required: true,
          label: { vi: 'Mã Màu (Hex)', en: 'Color Code (Hex)' },
          admin: {
            description: { vi: 'Ví dụ: #1d2122', en: 'Example: #1d2122' },
          },
        },
        {
          name: 'sizeInventory',
          type: 'array',
          label: { vi: 'Tồn Kho Theo Size', en: 'Size Inventory' },
          admin: {
            description: {
              vi: 'Quản lý số lượng tồn kho cho từng size',
              en: 'Manage stock quantity for each size',
            },
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'size',
                  type: 'select',
                  required: true,
                  label: { vi: 'Size', en: 'Size' },
                  options: [
                    { label: 'XS', value: 'XS' },
                    { label: 'S', value: 'S' },
                    { label: 'M', value: 'M' },
                    { label: 'L', value: 'L' },
                    { label: 'XL', value: 'XL' },
                    { label: '2X', value: '2X' },
                    { label: '39', value: '39' },
                    { label: '40', value: '40' },
                    { label: '41', value: '41' },
                    { label: '42', value: '42' },
                    { label: '43', value: '43' },
                    { label: '44', value: '44' },
                    { label: '45', value: '45' },
                  ],
                },
                {
                  name: 'stock',
                  type: 'number',
                  required: true,
                  min: 0,
                  defaultValue: 0,
                  label: { vi: 'Số Lượng', en: 'Stock Quantity' },
                },
                {
                  name: 'lowStockThreshold',
                  type: 'number',
                  min: 0,
                  defaultValue: 5,
                  label: { vi: 'Ngưỡng Cảnh Báo', en: 'Low Stock Alert' },
                  admin: {
                    description: {
                      vi: 'Cảnh báo khi tồn kho thấp hơn số này',
                      en: 'Alert when stock falls below this',
                    },
                    width: '33%',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'images',
          type: 'relationship',
          relationTo: 'media',
          hasMany: true,
          required: true,
          label: { vi: 'Hình Ảnh', en: 'Images' },
          admin: {
            description: {
              vi: 'Hình ảnh cho màu này (áp dụng cho tất cả size của màu này)',
              en: 'Images for this color (applies to all sizes of this color)',
            },
          },
        },
      ],
    },
    {
      name: 'colors',
      type: 'array',
      label: { vi: 'Màu Sắc (Tổng Hợp)', en: 'Colors (Summary)' },
      admin: {
        description: {
          vi: 'Tự động tổng hợp từ colorVariants. Có thể thêm thủ công nếu cần.',
          en: 'Auto-aggregated from colorVariants. Can be added manually if needed.',
        },
        readOnly: false,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: { vi: 'Tên Màu', en: 'Color Name' },
        },
        {
          name: 'hex',
          type: 'text',
          required: true,
          label: { vi: 'Mã Màu (Hex)', en: 'Color Code (Hex)' },
          admin: {
            description: { vi: 'Ví dụ: #1d2122', en: 'Example: #1d2122' },
          },
        },
      ],
    },
    {
      name: 'sizes',
      type: 'select',
      hasMany: true,
      label: { vi: 'Size', en: 'Size' },
      options: [
        // Clothing sizes
        { label: 'XS', value: 'XS' },
        { label: 'S', value: 'S' },
        { label: 'M', value: 'M' },
        { label: 'L', value: 'L' },
        { label: 'XL', value: 'XL' },
        { label: '2X', value: '2X' },
        // Shoe sizes
        { label: '39', value: '39' },
        { label: '40', value: '40' },
        { label: '41', value: '41' },
        { label: '42', value: '42' },
        { label: '43', value: '43' },
        { label: '44', value: '44' },
        { label: '45', value: '45' },
      ],
      defaultValue: ['S', 'M', 'L', 'XL'],
    },
    {
      name: 'tag',
      type: 'select',
      label: { vi: 'Nhãn', en: 'Tag' },
      options: [
        { label: { vi: 'Mới', en: 'New' }, value: 'MỚI' },
        { label: { vi: 'Bán Chạy', en: 'Bestseller' }, value: 'BÁN CHẠY' },
        { label: { vi: 'Giảm 20%', en: '20% Off' }, value: 'GIẢM 20%' },
        { label: { vi: 'Giảm 30%', en: '30% Off' }, value: 'GIẢM 30%' },
        { label: { vi: 'Giảm 50%', en: '50% Off' }, value: 'GIẢM 50%' },
        { label: 'Hot', value: 'HOT' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
      label: { vi: 'Còn Hàng', en: 'In Stock' },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: { vi: 'Sản Phẩm Nổi Bật', en: 'Featured Product' },
      admin: {
        position: 'sidebar',
        description: { vi: 'Hiển thị ở trang chủ', en: 'Display on homepage' },
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: { vi: 'Mô Tả', en: 'Description' },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'features',
      type: 'array',
      localized: true,
      label: { vi: 'Đặc Điểm Kỹ Thuật', en: 'Technical Features' },
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
          label: { vi: 'Đặc điểm', en: 'Feature' },
        },
      ],
    },
  ],
}
