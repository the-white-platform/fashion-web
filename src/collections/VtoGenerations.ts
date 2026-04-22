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
    defaultColumns: ['user', 'product', 'resultData', 'cacheHit', 'provider', 'createdAt'],
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
      // cache lookup atomic with the quota row. The route downscales the
      // Gemini output to 800px JPEG before storing, so rows typically
      // sit at ~250KB. No maxLength: the default textarea cap (40k) was
      // silently rejecting oversized outputs from nano-banana-pro, and
      // even the previous 1.5M ceiling bounced some PNG results —
      // Postgres varchar (no length) has no ceiling in practice.
      name: 'resultData',
      type: 'textarea',
      label: { vi: 'Ảnh kết quả', en: 'Result Image' },
      admin: {
        description: 'data: URL of the generated image (used for retry caching)',
        rows: 2,
        components: {
          // Password-gated preview: staff must enter the shared
          // unlock code before the base64 data URL is rendered.
          // Applies in both list + edit views.
          Field: '@/collections/VtoGenerations/ResultImageField.client#ResultImageFieldClient',
          Cell: '@/collections/VtoGenerations/ResultImageCell.client#ResultImageCellClient',
        },
      },
    },
    {
      // Marks rows that record a cache-hit retry (same user, same
      // inputHash as a prior row). Cache-hit rows don't store the
      // image (the original row already has it) and don't count
      // toward the daily quota. Logged so every successful try-on —
      // first or retry — is visible in the admin.
      name: 'cacheHit',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: { vi: 'Lần thử lại (cache)', en: 'Cache Hit' },
      admin: {
        position: 'sidebar',
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
