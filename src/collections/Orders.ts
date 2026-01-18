import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import {
  validateStockBeforeOrder,
  decrementStockAfterOrder,
  restoreStockOnCancel,
} from './Orders/hooks/stockManagement'

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    read: authenticated,
    create: () => true, // Public can create orders (checkout)
    update: authenticated,
    delete: authenticated,
  },
  labels: {
    singular: { vi: 'Đơn Hàng', en: 'Order' },
    plural: { vi: 'Đơn Hàng', en: 'Orders' },
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customerName', 'status', 'total', 'createdAt'],
    listSearchableFields: ['orderNumber', 'customerEmail', 'customerName', 'customerPhone'],
    group: { vi: 'Thương mại', en: 'Commerce' },
  },
  fields: [
    // Order Info
    {
      type: 'row',
      fields: [
        {
          name: 'orderNumber',
          type: 'text',
          required: true,
          unique: true,
          label: { vi: 'Mã đơn hàng', en: 'Order Number' },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          label: { vi: 'Trạng thái', en: 'Status' },
          options: [
            { label: { vi: 'Chờ xác nhận', en: 'Pending' }, value: 'pending' },
            { label: { vi: 'Đã xác nhận', en: 'Confirmed' }, value: 'confirmed' },
            { label: { vi: 'Đang xử lý', en: 'Processing' }, value: 'processing' },
            { label: { vi: 'Đang giao hàng', en: 'Shipping' }, value: 'shipping' },
            { label: { vi: 'Đã giao', en: 'Delivered' }, value: 'delivered' },
            { label: { vi: 'Đã hủy', en: 'Cancelled' }, value: 'cancelled' },
            { label: { vi: 'Hoàn trả', en: 'Refunded' }, value: 'refunded' },
          ],
        },
      ],
    },

    // Customer Information
    {
      name: 'customerInfo',
      type: 'group',
      label: { vi: 'Thông tin khách hàng', en: 'Customer Information' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'customerName',
              type: 'text',
              required: true,
              label: { vi: 'Họ và tên', en: 'Full Name' },
            },
            {
              name: 'customerEmail',
              type: 'email',
              required: true,
              label: { vi: 'Email', en: 'Email' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'customerPhone',
              type: 'text',
              required: true,
              label: { vi: 'Số điện thoại', en: 'Phone Number' },
            },
            {
              name: 'user',
              type: 'relationship',
              relationTo: 'users',
              label: { vi: 'Tài khoản', en: 'User Account' },
              admin: {
                description: {
                  vi: 'Nếu khách đã đăng nhập',
                  en: 'If customer was logged in',
                },
              },
            },
          ],
        },
      ],
    },

    // Shipping Address
    {
      name: 'shippingAddress',
      type: 'group',
      label: { vi: 'Địa chỉ giao hàng', en: 'Shipping Address' },
      fields: [
        {
          name: 'address',
          type: 'text',
          required: true,
          label: { vi: 'Địa chỉ', en: 'Address' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ward',
              type: 'text',
              label: { vi: 'Phường/Xã', en: 'Ward' },
            },
            {
              name: 'district',
              type: 'text',
              required: true,
              label: { vi: 'Quận/Huyện', en: 'District' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'city',
              type: 'text',
              required: true,
              label: { vi: 'Tỉnh/Thành phố', en: 'City/Province' },
            },
            {
              name: 'postalCode',
              type: 'text',
              label: { vi: 'Mã bưu điện', en: 'Postal Code' },
            },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
          label: { vi: 'Ghi chú giao hàng', en: 'Delivery Notes' },
        },
      ],
    },

    // Order Items
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      label: { vi: 'Sản phẩm', en: 'Order Items' },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          label: { vi: 'Sản phẩm', en: 'Product' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'productName',
              type: 'text',
              required: true,
              label: { vi: 'Tên sản phẩm', en: 'Product Name' },
              admin: {
                description: {
                  vi: 'Lưu lại tên tại thời điểm đặt hàng',
                  en: 'Snapshot of name at order time',
                },
              },
            },
            {
              name: 'variant',
              type: 'text',
              label: { vi: 'Màu sắc', en: 'Color Variant' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'size',
              type: 'text',
              required: true,
              label: { vi: 'Kích cỡ', en: 'Size' },
            },
            {
              name: 'quantity',
              type: 'number',
              required: true,
              min: 1,
              defaultValue: 1,
              label: { vi: 'Số lượng', en: 'Quantity' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'unitPrice',
              type: 'number',
              required: true,
              label: { vi: 'Đơn giá', en: 'Unit Price' },
            },
            {
              name: 'lineTotal',
              type: 'number',
              required: true,
              label: { vi: 'Thành tiền', en: 'Line Total' },
            },
          ],
        },
        {
          name: 'productImage',
          type: 'text',
          label: { vi: 'Hình ảnh', en: 'Product Image' },
          admin: {
            description: { vi: 'URL hình ảnh sản phẩm', en: 'Product image URL' },
          },
        },
      ],
    },

    // Payment Information
    {
      name: 'payment',
      type: 'group',
      label: { vi: 'Thanh toán', en: 'Payment' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'method',
              type: 'select',
              required: true,
              label: { vi: 'Phương thức', en: 'Payment Method' },
              options: [
                {
                  label: { vi: 'Thanh toán khi nhận hàng', en: 'Cash on Delivery' },
                  value: 'cod',
                },
                {
                  label: { vi: 'Chuyển khoản ngân hàng', en: 'Bank Transfer' },
                  value: 'bank_transfer',
                },
                { label: { vi: 'Mã QR', en: 'QR Code' }, value: 'qr_code' },
                { label: 'VNPay', value: 'vnpay' },
                { label: 'Stripe', value: 'stripe' },
                { label: 'MoMo', value: 'momo' },
              ],
            },
            {
              name: 'paymentStatus',
              type: 'select',
              required: true,
              defaultValue: 'pending',
              label: { vi: 'Trạng thái thanh toán', en: 'Payment Status' },
              options: [
                { label: { vi: 'Chờ thanh toán', en: 'Pending' }, value: 'pending' },
                { label: { vi: 'Đã thanh toán', en: 'Paid' }, value: 'paid' },
                { label: { vi: 'Thất bại', en: 'Failed' }, value: 'failed' },
                { label: { vi: 'Hoàn tiền', en: 'Refunded' }, value: 'refunded' },
              ],
            },
          ],
        },
        {
          name: 'transactionId',
          type: 'text',
          label: { vi: 'Mã giao dịch', en: 'Transaction ID' },
          admin: {
            description: {
              vi: 'ID giao dịch từ cổng thanh toán',
              en: 'Transaction ID from payment gateway',
            },
          },
        },
        {
          name: 'paidAt',
          type: 'date',
          label: { vi: 'Ngày thanh toán', en: 'Paid At' },
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },

    // Order Totals
    {
      name: 'totals',
      type: 'group',
      label: { vi: 'Tổng tiền', en: 'Order Totals' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'subtotal',
              type: 'number',
              required: true,
              label: { vi: 'Tạm tính', en: 'Subtotal' },
            },
            {
              name: 'shippingFee',
              type: 'number',
              defaultValue: 0,
              label: { vi: 'Phí vận chuyển', en: 'Shipping Fee' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'discount',
              type: 'number',
              defaultValue: 0,
              label: { vi: 'Giảm giá', en: 'Discount' },
            },
            {
              name: 'total',
              type: 'number',
              required: true,
              label: { vi: 'Tổng cộng', en: 'Total' },
            },
          ],
        },
        {
          name: 'couponCode',
          type: 'text',
          label: { vi: 'Mã giảm giá', en: 'Coupon Code' },
        },
      ],
    },

    // Admin Section
    {
      name: 'adminNotes',
      type: 'textarea',
      label: { vi: 'Ghi chú nội bộ', en: 'Admin Notes' },
      admin: {
        description: {
          vi: 'Ghi chú chỉ hiển thị cho admin',
          en: 'Notes visible only to admins',
        },
      },
    },

    // Fulfillment
    {
      name: 'fulfillment',
      type: 'group',
      label: { vi: 'Vận chuyển', en: 'Fulfillment' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'carrier',
              type: 'text',
              label: { vi: 'Đơn vị vận chuyển', en: 'Carrier' },
            },
            {
              name: 'trackingNumber',
              type: 'text',
              label: { vi: 'Mã vận đơn', en: 'Tracking Number' },
            },
          ],
        },
        {
          name: 'shippedAt',
          type: 'date',
          label: { vi: 'Ngày gửi hàng', en: 'Shipped At' },
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'deliveredAt',
          type: 'date',
          label: { vi: 'Ngày giao hàng', en: 'Delivered At' },
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      // Validate stock availability before creating order
      validateStockBeforeOrder,
      // Auto-generate order number
      async ({ data, operation }) => {
        if (operation === 'create' && !data.orderNumber) {
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          data.orderNumber = `TW-${timestamp}-${random}`
        }
        return data
      },
    ],
    afterChange: [
      // Decrement stock after order is created/confirmed
      decrementStockAfterOrder,
      // Restore stock if order is cancelled
      restoreStockOnCancel,
    ],
  },
  timestamps: true,
}
