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
    {
      // SHA256 of the request inputs (person+product+name+color). The
      // route looks up the user's previous generations by this key so
      // a re-try with the same inputs returns the cached image without
      // consuming quota or calling Gemini again.
      name: 'inputHash',
      type: 'text',
      index: true,
      label: { vi: 'Mã đầu vào', en: 'Input Hash' },
    },
    {
      // The data: URL of the generated image. Stored in DB to keep the
      // cache lookup atomic with the quota row. ~250KB per row at
      // current compression — fine at launch volume; if it grows, move
      // to GCS keyed by inputHash.
      name: 'resultData',
      type: 'textarea',
      label: { vi: 'Ảnh kết quả', en: 'Result Image' },
      admin: {
        description: 'data: URL of the generated image (used for retry caching)',
        rows: 2,
      },
    },
    {
      // Which upstream actually served this generation. The route tries
      // Vertex first (covered by GCP credit) and falls back to the
      // Gemini Developer API on safety rejection / error. Useful for
      // analytics ("what % of generations are landing on the paid path").
      name: 'provider',
      type: 'select',
      options: [
        { label: 'Vertex AI', value: 'vertex' },
        { label: 'Gemini Dev API', value: 'gemini' },
      ],
      label: { vi: 'Nhà cung cấp', en: 'Provider' },
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
