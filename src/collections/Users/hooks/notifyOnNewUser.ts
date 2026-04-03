import type { CollectionAfterChangeHook } from 'payload'
import type { User } from '@/payload-types'
import { createNotification } from '@/utilities/createNotification'

export const notifyOnNewUser: CollectionAfterChangeHook<User> = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const { payload } = req

  // Don't notify admins/editors about their own creation
  if (doc.role === 'admin' || doc.role === 'editor') return doc

  try {
    await createNotification({
      payload,
      type: 'new_user',
      title: 'Người dùng mới',
      message: `${doc.name ?? doc.email} vừa đăng ký tài khoản`,
      link: `/admin/collections/users/${doc.id}`,
      metadata: { userId: doc.id, email: doc.email, role: doc.role },
      recipientRoles: ['admin'],
    })
  } catch (error) {
    payload.logger.error(`[notifyOnNewUser] Error: ${error}`)
  }

  return doc
}
