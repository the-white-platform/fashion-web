import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin, adminOrEditorFieldAccess } from '../access/roles'
import {
  validateAndRecalculateOrder,
  validateStockBeforeOrder,
  decrementStockAfterOrder,
  restoreStockOnCancel,
  incrementCouponUsageAfterOrder,
} from './Orders/hooks/stockManagement'
import { logOrderActivity } from './Orders/hooks/activityLog'
import { handleReturn } from './Orders/hooks/returnManagement'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// Kept imported (unused) so re-enabling is a one-line uncomment in
// the afterChange list once ZNS templates + refresh token are live.
import { sendZaloOrderNotifications as _sendZaloOrderNotifications } from './Orders/hooks/sendZaloOrderNotifications'
void _sendZaloOrderNotifications
import { sendOrderEmails as _sendOrderEmails } from './Orders/hooks/sendOrderEmails'
import { notifyOnOrder } from './Orders/hooks/notifyOnOrder'
import { notifyOnStockChange } from './Orders/hooks/notifyOnStockChange'
import { loyaltyEarn } from './Orders/hooks/loyaltyEarn'

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin', 'editor', 'staff'])) return true
      return { 'customerInfo.user': { equals: user.id } }
    },
    create: () => true,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin', 'editor', 'staff'])) return true
      return { 'customerInfo.user': { equals: user.id } }
    },
    delete: isAdmin,
  },
  labels: {
    singular: { vi: 'Đơn Hàng', en: 'Order' },
    plural: { vi: 'Đơn Hàng', en: 'Orders' },
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: [
      'orderNumber',
      'customerInfo.customerName',
      'status',
      'totals.total',
      'createdAt',
    ],
    listSearchableFields: [
      'orderNumber',
      'customerInfo.customerName',
      'customerInfo.customerEmail',
      'customerInfo.customerPhone',
    ],
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
              maxLength: 100,
              label: { vi: 'Họ và tên', en: 'Full Name' },
            },
            {
              // Optional — many VN customers check out by phone and
              // never fill an email. Payload's email validator also
              // rejects empty strings, so required:true + "" from the
              // client was causing 400s on every anonymous order.
              name: 'customerEmail',
              type: 'email',
              required: false,
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
              maxLength: 20,
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
          maxLength: 300,
          label: { vi: 'Địa chỉ', en: 'Address' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ward',
              type: 'relationship',
              relationTo: 'wards',
              label: { vi: 'Phường/Xã', en: 'Ward' },
            },
            {
              name: 'district',
              type: 'relationship',
              relationTo: 'districts',
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
              type: 'relationship',
              relationTo: 'provinces',
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
          maxLength: 500,
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
              maxLength: 200,
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
              maxLength: 100,
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
      access: {
        update: adminOrEditorFieldAccess,
      },
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
      access: {
        update: adminOrEditorFieldAccess,
      },
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
        {
          type: 'row',
          fields: [
            {
              name: 'pointsRedeemed',
              type: 'number',
              defaultValue: 0,
              label: { vi: 'Điểm đổi', en: 'Points Redeemed' },
              admin: {
                description: {
                  vi: 'Số điểm thưởng đã sử dụng để thanh toán',
                  en: 'Loyalty points applied to this order',
                },
              },
            },
            {
              name: 'pointsDiscount',
              type: 'number',
              defaultValue: 0,
              label: { vi: 'Giảm giá từ điểm (VND)', en: 'Points Discount (VND)' },
              admin: {
                description: {
                  vi: '100 điểm = 10,000 VND',
                  en: '100 points = 10,000 VND',
                },
              },
            },
          ],
        },
      ],
    },

    // Admin Section
    {
      name: 'adminNotes',
      type: 'textarea',
      maxLength: 1000,
      label: { vi: 'Ghi chú nội bộ', en: 'Admin Notes' },
      access: {
        update: adminOrEditorFieldAccess,
      },
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
      access: {
        update: adminOrEditorFieldAccess,
      },
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

    // Return Request (Task 3)
    {
      name: 'returnRequest',
      type: 'group',
      label: { vi: 'Yêu cầu hoàn trả', en: 'Return Request' },
      admin: {
        condition: (data) => data?.status === 'delivered' || data?.status === 'refunded',
      },
      fields: [
        {
          name: 'returnStatus',
          type: 'select',
          defaultValue: 'none',
          label: { vi: 'Trạng thái hoàn trả', en: 'Return Status' },
          options: [
            { label: { vi: 'Không có', en: 'None' }, value: 'none' },
            { label: { vi: 'Đã yêu cầu', en: 'Requested' }, value: 'requested' },
            { label: { vi: 'Đã duyệt', en: 'Approved' }, value: 'approved' },
            { label: { vi: 'Đã từ chối', en: 'Rejected' }, value: 'rejected' },
            { label: { vi: 'Đã nhận hàng', en: 'Received' }, value: 'received' },
            { label: { vi: 'Đã hoàn tiền', en: 'Refunded' }, value: 'refunded' },
          ],
        },
        {
          name: 'returnReason',
          type: 'textarea',
          maxLength: 1000,
          label: { vi: 'Lý do hoàn trả', en: 'Return Reason' },
        },
        {
          name: 'returnItems',
          type: 'array',
          label: { vi: 'Sản phẩm hoàn trả', en: 'Return Items' },
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
                  name: 'variant',
                  type: 'text',
                  label: { vi: 'Màu sắc', en: 'Color Variant' },
                },
                {
                  name: 'size',
                  type: 'text',
                  label: { vi: 'Kích cỡ', en: 'Size' },
                },
              ],
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
              name: 'refundAmount',
              type: 'number',
              label: { vi: 'Số tiền hoàn', en: 'Refund Amount' },
            },
            {
              name: 'returnRequestedAt',
              type: 'date',
              label: { vi: 'Ngày yêu cầu hoàn trả', en: 'Return Requested At' },
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
          ],
        },
      ],
    },

    // Activity Log (Task 1)
    {
      name: 'activityLog',
      type: 'array',
      label: { vi: 'Nhật ký hoạt động', en: 'Activity Log' },
      admin: {
        readOnly: true,
        description: {
          vi: 'Lịch sử thay đổi đơn hàng (tự động)',
          en: 'Auto-populated order change history',
        },
      },
      fields: [
        {
          name: 'action',
          type: 'select',
          required: true,
          label: { vi: 'Hành động', en: 'Action' },
          options: [
            { label: { vi: 'Tạo đơn', en: 'Created' }, value: 'created' },
            { label: { vi: 'Đổi trạng thái', en: 'Status Change' }, value: 'status_change' },
            {
              label: { vi: 'Cập nhật thanh toán', en: 'Payment Update' },
              value: 'payment_update',
            },
            { label: { vi: 'Ghi chú', en: 'Note' }, value: 'note' },
            {
              label: { vi: 'Yêu cầu hoàn trả', en: 'Return Requested' },
              value: 'return_requested',
            },
            { label: { vi: 'Hoàn tiền', en: 'Refund' }, value: 'refund' },
          ],
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true,
          label: { vi: 'Thời gian', en: 'Timestamp' },
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'fromValue',
              type: 'text',
              label: { vi: 'Giá trị cũ', en: 'From Value' },
            },
            {
              name: 'toValue',
              type: 'text',
              label: { vi: 'Giá trị mới', en: 'To Value' },
            },
          ],
        },
        {
          name: 'performedBy',
          type: 'relationship',
          relationTo: 'users',
          label: { vi: 'Thực hiện bởi', en: 'Performed By' },
        },
        {
          name: 'note',
          type: 'text',
          label: { vi: 'Ghi chú', en: 'Note' },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      // Server-side price, coupon, and totals recalculation (must run first)
      validateAndRecalculateOrder,
      // Validate stock availability before creating order
      validateStockBeforeOrder,
      // Auto-generate order number
      async ({ data, operation, req }) => {
        if (operation === 'create' && !data.orderNumber) {
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          data.orderNumber = `TW-${timestamp}-${random}`
        }
        req.payload.logger.info(
          `[orders/hooks] orderNumber generated: ${data.orderNumber} (operation=${operation})`,
        )
        return data
      },
      // Handle return status changes (stock restore, refund propagation)
      handleReturn,
      // Log status/payment/note changes to activityLog
      logOrderActivity,
    ],
    afterChange: [
      // Raw-SQL UPDATE on the size-inventory row — no full-product
      // replace-cascade, so the outer transaction no longer goes
      // idle-in-transaction on media SELECTs.
      decrementStockAfterOrder,
      restoreStockOnCancel,
      incrementCouponUsageAfterOrder,
      // sendOrderEmails disabled (no email provider yet — see notes on
      // the previous commit). Zalo ZNS is what will deliver the
      // "your order is confirmed / shipping" pings to the customer
      // — but the OA still needs ZNS templates approved + the
      // refresh token registered before it can send anything, so
      // keep the hook off the chain until those are in place.
      // sendZaloOrderNotifications,
      notifyOnOrder,
      notifyOnStockChange,
      loyaltyEarn,
    ],
  },
  timestamps: true,
}
