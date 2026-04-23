import React from 'react'
import type { AdminViewServerProps } from 'payload'
import ZaloSenderClient from './ZaloSenderClient'

/**
 * Payload custom admin view at /admin/management/zalo-sender. Thin server
 * shell that forwards query params (?userId=…&preset=…) down to
 * the client component — lets birthday widget / user admin pages
 * deep-link into a pre-filled send form.
 */
const ZaloSenderView: React.FC<AdminViewServerProps> = async ({ searchParams }) => {
  const resolved = searchParams ? await searchParams : undefined
  const rawUser = resolved?.userId
  const rawPreset = resolved?.preset
  const initialUserId = Array.isArray(rawUser) ? rawUser[0] : rawUser
  const initialPreset = Array.isArray(rawPreset) ? rawPreset[0] : rawPreset

  return <ZaloSenderClient initialUserId={initialUserId} initialPreset={initialPreset} />
}

export default ZaloSenderView
