import { zaloSendMessage } from '@/lib/zalo'

interface SendZaloMessageOptions {
  toUserId: string
  text: string
}

/**
 * Send a direct Zalo message to a user by their Zalo user ID.
 * Used by admin chat for Zalo-channel conversations.
 */
export async function sendZaloMessage({ toUserId, text }: SendZaloMessageOptions): Promise<void> {
  await zaloSendMessage({ to: toUserId, text })
}
