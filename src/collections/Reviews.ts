import type { CollectionConfig, Access, Where } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { isAdmin, isAdminOrEditor, adminOrEditorFieldAccess } from '../access/roles'
import { verifyPurchase } from './Reviews/hooks/verifyPurchase'
import {
  updateProductRating,
  updateProductRatingAfterDelete,
} from './Reviews/hooks/updateProductRating'
import { loyaltyEarnReview } from './Reviews/hooks/loyaltyEarnReview'

/**
 * Users can update their own review only if it hasn't been approved yet.
 * Admins/editors can update any review.
 */
const canUpdateReview: Access = ({ req: { user } }) => {
  if (!user) return false
  // Admins and editors can always update
  const role = (user as { role?: string }).role
  if (role === 'admin' || role === 'editor') return true
  // Customers can only update their own pending/rejected reviews
  const where: Where = {
    and: [
      { user: { equals: user.id } } as Where,
      { moderationStatus: { not_in: ['approved'] } } as Where,
    ],
  }
  return where
}

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: { vi: 'Đánh Giá', en: 'Review' },
    plural: { vi: 'Đánh Giá', en: 'Reviews' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['product', 'user', 'rating', 'moderationStatus', 'createdAt'],
    group: { vi: 'Thương mại', en: 'Commerce' },
  },
  access: {
    // Public can only read approved reviews; filter enforced on frontend via query
    read: anyone,
    create: authenticated,
    update: canUpdateReview,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [verifyPurchase],
    afterChange: [updateProductRating, loyaltyEarnReview],
    afterDelete: [updateProductRatingAfterDelete],
  },
  timestamps: true,
  fields: [
    // Core relations
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: { vi: 'Sản phẩm', en: 'Product' },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: { vi: 'Người đánh giá', en: 'Reviewer' },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      label: { vi: 'Đơn hàng', en: 'Order' },
      admin: {
        position: 'sidebar',
        description: {
          vi: 'Đơn hàng xác nhận mua (tự động)',
          en: 'Verified purchase order (auto)',
        },
        readOnly: true,
      },
    },

    // Content
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      label: { vi: 'Số Sao', en: 'Rating' },
    },
    {
      name: 'title',
      type: 'text',
      label: { vi: 'Tiêu Đề', en: 'Title' },
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      label: { vi: 'Nội Dung', en: 'Comment' },
    },

    // Fit info
    {
      name: 'fit',
      type: 'select',
      label: { vi: 'Form Áo', en: 'Fit' },
      options: [
        { label: { vi: 'Hơi nhỏ', en: 'Runs Small' }, value: 'runs_small' },
        { label: { vi: 'Đúng size', en: 'True to Size' }, value: 'true_to_size' },
        { label: { vi: 'Hơi rộng', en: 'Runs Large' }, value: 'runs_large' },
      ],
    },
    {
      name: 'sizeOrdered',
      type: 'text',
      label: { vi: 'Size Đã Mua', en: 'Size Ordered' },
    },
    {
      name: 'height',
      type: 'number',
      label: { vi: 'Chiều Cao (cm)', en: 'Height (cm)' },
    },
    {
      name: 'weight',
      type: 'number',
      label: { vi: 'Cân Nặng (kg)', en: 'Weight (kg)' },
    },

    // Media
    {
      name: 'images',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      maxRows: 5,
      label: { vi: 'Hình Ảnh', en: 'Images' },
    },

    // Moderation / state
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      label: { vi: 'Đã Xác Nhận Mua Hàng', en: 'Verified Purchase' },
      admin: {
        readOnly: true,
        description: {
          vi: 'Tự động xác nhận nếu có đơn hàng đã giao',
          en: 'Auto-set when a delivered order is found',
        },
      },
    },
    {
      name: 'moderationStatus',
      type: 'select',
      defaultValue: 'pending',
      label: { vi: 'Trạng Thái Kiểm Duyệt', en: 'Moderation Status' },
      options: [
        { label: { vi: 'Chờ duyệt', en: 'Pending' }, value: 'pending' },
        { label: { vi: 'Đã duyệt', en: 'Approved' }, value: 'approved' },
        { label: { vi: 'Đã từ chối', en: 'Rejected' }, value: 'rejected' },
      ],
    },
    {
      name: 'helpfulCount',
      type: 'number',
      defaultValue: 0,
      label: { vi: 'Lượt Hữu Ích', en: 'Helpful Count' },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'helpfulVoters',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      label: { vi: 'Người Vote Hữu Ích', en: 'Helpful Voters' },
      admin: {
        readOnly: true,
        description: {
          vi: 'Danh sách người đã vote hữu ích (để tránh vote 2 lần)',
          en: 'Users who voted helpful (dedup)',
        },
      },
    },

    // Admin reply
    {
      name: 'adminReply',
      type: 'textarea',
      label: { vi: 'Phản Hồi Của Cửa Hàng', en: 'Store Response' },
      access: {
        update: adminOrEditorFieldAccess,
      },
    },
    {
      name: 'adminReplyAt',
      type: 'date',
      label: { vi: 'Ngày Phản Hồi', en: 'Reply Date' },
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
