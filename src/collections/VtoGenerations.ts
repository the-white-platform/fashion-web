import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/roles'

/**
 * Append-only log of successful Virtual Try-On generations. Each row is
 * one VTO call by an authenticated user; the `/api/vto/generate` route
 * counts rows for the current user in the last 24 hours and rejects
 * with 429 once the daily quota is hit.
 */
export const VtoGenerations: CollectionConfig = {
  slug: 'vto-generations',
  labels: {
    singular: { vi: 'Lần thử đồ ảo', en: 'Virtual Try-On' },
    plural: { vi: 'Lần thử đồ ảo', en: 'Virtual Try-On Logs' },
  },
  admin: {
    defaultColumns: ['user', 'product', 'createdAt'],
    useAsTitle: 'id',
    description: {
      vi: 'Nhật ký các lần thử đồ ảo. Dùng để giới hạn số lần thử mỗi ngày trên mỗi tài khoản.',
      en: 'Log of Virtual Try-On generations. Used to enforce the per-user daily quota.',
    },
  },
  access: {
    // Only admins / staff need to inspect the log; the route writes
    // through req.payload bypassing access checks. Customers must not
    // be able to read or delete to keep the quota tamper-proof.
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      label: { vi: 'Người dùng', en: 'User' },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: { vi: 'Sản phẩm', en: 'Product' },
    },
  ],
  timestamps: true,
}
