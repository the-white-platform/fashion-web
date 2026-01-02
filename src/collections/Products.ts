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
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên Sản Phẩm',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
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
      label: 'Danh Mục',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Giá (VND)',
      min: 0,
    },
    {
      name: 'originalPrice',
      type: 'number',
      label: 'Giá Gốc (VND)',
      min: 0,
      admin: {
        description: 'Để trống nếu không có giảm giá',
      },
    },
    {
      name: 'colorVariants',
      type: 'array',
      label: 'Biến Thể Màu Sắc',
      admin: {
        description: 'Thêm hình ảnh riêng cho từng màu sắc. Màu đầu tiên sẽ là màu mặc định.',
      },
      fields: [
        {
          name: 'color',
          type: 'text',
          required: true,
          label: 'Tên Màu',
          admin: {
            description: 'Ví dụ: Đen, Trắng, Xanh Navy',
          },
        },
        {
          name: 'colorHex',
          type: 'text',
          required: true,
          label: 'Mã Màu (Hex)',
          admin: {
            description: 'Ví dụ: #1d2122',
          },
        },
        {
          name: 'sizes',
          type: 'select',
          hasMany: true,
          label: 'Size Có Sẵn',
          admin: {
            description: 'Các size có sẵn cho màu này',
          },
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
          name: 'images',
          type: 'relationship',
          relationTo: 'media',
          hasMany: true,
          required: true,
          label: 'Hình Ảnh',
          admin: {
            description: 'Hình ảnh cho màu này (áp dụng cho tất cả size của màu này)',
          },
        },
        {
          name: 'inStock',
          type: 'checkbox',
          defaultValue: true,
          label: 'Còn Hàng',
        },
      ],
    },
    {
      name: 'colors',
      type: 'array',
      label: 'Màu Sắc (Tổng Hợp)',
      admin: {
        description: 'Tự động tổng hợp từ colorVariants. Có thể thêm thủ công nếu cần.',
        readOnly: false,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Tên Màu',
        },
        {
          name: 'hex',
          type: 'text',
          required: true,
          label: 'Mã Màu (Hex)',
          admin: {
            description: 'Ví dụ: #1d2122',
          },
        },
      ],
    },
    {
      name: 'sizes',
      type: 'select',
      hasMany: true,
      label: 'Size',
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
      label: 'Nhãn',
      options: [
        { label: 'Mới', value: 'MỚI' },
        { label: 'Bán Chạy', value: 'BÁN CHẠY' },
        { label: 'Giảm 20%', value: 'GIẢM 20%' },
        { label: 'Giảm 30%', value: 'GIẢM 30%' },
        { label: 'Giảm 50%', value: 'GIẢM 50%' },
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
      label: 'Còn Hàng',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Sản Phẩm Nổi Bật',
      admin: {
        position: 'sidebar',
        description: 'Hiển thị ở trang chủ',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Mô Tả',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'features',
      type: 'array',
      label: 'Đặc Điểm Kỹ Thuật',
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
