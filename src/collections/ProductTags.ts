import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdmin, isAdminOrEditor } from '../access/roles'

export const ProductTags: CollectionConfig = {
  slug: 'product-tags',
  labels: {
    singular: { vi: 'Nhãn sản phẩm', en: 'Product Tag' },
    plural: { vi: 'Nhãn sản phẩm', en: 'Product Tags' },
  },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'label', 'order'],
    group: { vi: 'Catalog', en: 'Catalog' },
    description: {
      vi: 'Nhãn hiển thị trên thẻ sản phẩm (Mới, Bán Chạy, Giảm giá, Hot...). Tạo ở đây và gán từ trang sản phẩm.',
      en: 'Badges shown on product cards (New, Bestseller, Sale, Hot, …). Create here and assign from the product page.',
    },
  },
  access: {
    read: anyone,
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
      label: { vi: 'Mã', en: 'Code' },
      admin: {
        description: {
          vi: 'Mã định danh ổn định (ví dụ: new, bestseller, sale-20). Dùng trong logic lọc / sắp xếp. Không đổi sau khi đã gán cho sản phẩm.',
          en: 'Stable identifier (e.g. new, bestseller, sale-20). Used in filter / sort logic. Do not change once assigned to products.',
        },
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
      label: { vi: 'Nhãn hiển thị', en: 'Display label' },
      admin: {
        description: {
          vi: 'Chuỗi hiển thị trên huy hiệu sản phẩm. Có bản VI / EN riêng.',
          en: 'Text rendered on the product badge. Has its own VI / EN copy.',
        },
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { vi: 'Thứ tự sắp xếp', en: 'Sort order' },
      admin: {
        description: {
          vi: 'Càng nhỏ càng được ưu tiên khi sản phẩm có nhiều nhãn hoặc khi sắp xếp.',
          en: 'Lower numbers rank first when a product has multiple tags or when sorting.',
        },
      },
    },
  ],
  timestamps: true,
}
