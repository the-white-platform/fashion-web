import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin } from '../access/roles'

/**
 * Audit trail for every ZNS attempt — successful or rejected.
 *
 * Written by the various Zalo senders (`sendZaloNotification`,
 * `sendCustomerDiscount`, `sendCustomerWelcome`, `sendZaloOtp`,
 * the admin `send-to-user` route, and the admin `test-zns`
 * route). Read by the admin / manager UI for debugging delivery
 * failures and reconciling coupon issuance.
 *
 * Write-only from app code (overrideAccess in the sender utils);
 * admin + manager can read; only admin can edit / delete.
 */
export const ZnsLogs: CollectionConfig = {
  slug: 'zns-logs',
  labels: {
    singular: { vi: 'Log ZNS', en: 'ZNS Log' },
    plural: { vi: 'Log ZNS', en: 'ZNS Logs' },
  },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['createdAt', 'status', 'templateId', 'phone', 'recipient'],
    group: { vi: 'Zalo', en: 'Zalo' },
    listSearchableFields: ['phone', 'templateId', 'errorMessage'],
    description: {
      vi: 'Lịch sử gửi ZNS (tự động ghi mỗi lần gọi API).',
      en: 'ZNS send history (auto-written on every API call).',
    },
  },
  access: {
    read: ({ req: { user } }) => hasRole(user, ['admin', 'manager']),
    create: ({ req: { user } }) => hasRole(user, ['admin']),
    update: ({ req: { user } }) => hasRole(user, ['admin']),
    delete: isAdmin,
  },
  fields: [
    {
      name: 'summary',
      type: 'text',
      admin: { readOnly: true, hidden: true },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (!data) return ''
            const status = (data.status as string) ?? 'unknown'
            const template = (data.templateId as string) ?? '-'
            const phone = (data.phone as string) ?? '-'
            return `${status} · ${template} · ${phone}`
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'sent',
      options: [
        { label: { vi: 'Đã gửi', en: 'Sent' }, value: 'sent' },
        { label: { vi: 'Bị Zalo từ chối', en: 'Rejected by Zalo' }, value: 'rejected' },
        { label: { vi: 'Lỗi hệ thống', en: 'System error' }, value: 'error' },
        { label: { vi: 'Bỏ qua', en: 'Skipped' }, value: 'skipped' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'templateId',
      type: 'text',
      required: true,
      index: true,
      label: { vi: 'Template ID', en: 'Template ID' },
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      label: { vi: 'Người nhận', en: 'Recipient' },
      admin: {
        description: {
          vi: 'User khớp với số điện thoại nhận ZNS (nếu có).',
          en: 'User record matching the recipient phone, if any.',
        },
      },
    },
    {
      name: 'initiator',
      type: 'relationship',
      relationTo: 'users',
      label: { vi: 'Người gửi (admin)', en: 'Initiator (admin)' },
      admin: {
        description: {
          vi: 'Admin thao tác gửi thủ công. Rỗng với các tin tự động.',
          en: 'Admin who triggered a manual send. Empty for automatic sends.',
        },
      },
    },
    {
      name: 'templateData',
      type: 'json',
      label: { vi: 'Dữ liệu template', en: 'Template data' },
    },
    {
      name: 'errorCode',
      type: 'number',
      index: true,
    },
    {
      name: 'errorMessage',
      type: 'text',
    },
    {
      name: 'coupon',
      type: 'relationship',
      relationTo: 'coupons',
      label: { vi: 'Coupon', en: 'Coupon' },
      admin: {
        description: {
          vi: 'Coupon đã phát cùng với ZNS (nếu có).',
          en: 'Coupon issued alongside this ZNS, if any.',
        },
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'order-notification',
      options: [
        { label: 'Order notification', value: 'order-notification' },
        { label: 'Customer welcome', value: 'customer-welcome' },
        { label: 'Customer discount', value: 'customer-discount' },
        { label: 'OTP', value: 'otp' },
        { label: 'Admin send', value: 'admin-send' },
        { label: 'Admin test', value: 'admin-test' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
