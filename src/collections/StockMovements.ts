import type { CollectionConfig } from 'payload'

import { staffReadOnly, isAdminOrEditor, isAdmin } from '../access/roles'

export const StockMovements: CollectionConfig = {
  slug: 'stock-movements',
  labels: {
    singular: { vi: 'Biến Động Kho', en: 'Stock Movement' },
    plural: { vi: 'Biến Động Kho', en: 'Stock Movements' },
  },
  access: {
    read: staffReadOnly,
    create: isAdminOrEditor,
    update: () => false,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['product', 'variant', 'size', 'type', 'quantity', 'createdAt'],
    group: { vi: 'Thương mại', en: 'Commerce' },
  },
  timestamps: true,
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: { vi: 'Sản Phẩm', en: 'Product' },
    },
    {
      name: 'variant',
      type: 'text',
      required: true,
      label: { vi: 'Biến Thể Màu', en: 'Color Variant' },
    },
    {
      name: 'size',
      type: 'text',
      required: true,
      label: { vi: 'Size', en: 'Size' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: { vi: 'Loại', en: 'Type' },
      options: [
        { label: { vi: 'Bán Hàng', en: 'Sale' }, value: 'sale' },
        { label: { vi: 'Hủy Đơn', en: 'Cancellation' }, value: 'cancellation' },
        { label: { vi: 'Trả Hàng', en: 'Return' }, value: 'return' },
        { label: { vi: 'Nhập Kho', en: 'Restock' }, value: 'restock' },
        { label: { vi: 'Điều Chỉnh', en: 'Adjustment' }, value: 'adjustment' },
      ],
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      label: { vi: 'Số Lượng Thay Đổi', en: 'Quantity Change' },
      admin: {
        description: {
          vi: 'Số âm là giảm kho, số dương là tăng kho',
          en: 'Negative = stock deducted, positive = stock added',
        },
      },
    },
    {
      name: 'previousStock',
      type: 'number',
      required: true,
      label: { vi: 'Tồn Kho Trước', en: 'Previous Stock' },
    },
    {
      name: 'newStock',
      type: 'number',
      required: true,
      label: { vi: 'Tồn Kho Sau', en: 'New Stock' },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      label: { vi: 'Đơn Hàng', en: 'Order' },
    },
    {
      name: 'performedBy',
      type: 'relationship',
      relationTo: 'users',
      label: { vi: 'Thực Hiện Bởi', en: 'Performed By' },
    },
    {
      name: 'note',
      type: 'text',
      label: { vi: 'Ghi Chú', en: 'Note' },
    },
  ],
}
