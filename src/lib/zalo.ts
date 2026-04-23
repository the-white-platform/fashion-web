/**
 * Zalo Official Account (OA) API client with token refresh.
 *
 * Refresh token source order:
 *   1. `zalo-credentials` Payload global (admin manages via
 *      /api/auth/zalo/oa-connect — preferred, tokens auto-update
 *      when `/v4/oa/access_token` rotates them).
 *   2. `ZALO_REFRESH_TOKEN` env var (bootstrap fallback before
 *      the global is populated).
 *
 * Also required: `ZALO_APP_ID` + `ZALO_APP_SECRET` env vars.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'

const ZALO_OA_API = 'https://openapi.zalo.me'
const TOKEN_URL = 'https://oauth.zaloapp.com/v4/oa/access_token'

interface ZaloTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

let cachedAccessToken: string | null = null
let tokenExpiresAt = 0

async function loadRefreshTokenFromGlobal(): Promise<string | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const g = (await payload.findGlobal({
      slug: 'zalo-credentials',
      depth: 0,
    })) as { refreshToken?: string | null } | null
    return g?.refreshToken?.trim() || null
  } catch {
    return null
  }
}

async function persistTokensToGlobal(data: ZaloTokenResponse): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })
    const now = new Date()
    const REFRESH_TOKEN_TTL_DAYS = 90
    const accessExpiresAt = new Date(now.getTime() + data.expires_in * 1000)
    const refreshExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
    await payload.updateGlobal({
      slug: 'zalo-credentials',
      data: {
        // Zalo rotates the refresh token on every exchange.
        // Persist both pieces so the next refresh picks up the
        // fresh value and the admin dashboard countdown resets.
        refreshToken: data.refresh_token,
        refreshTokenIssuedAt: now.toISOString(),
        refreshTokenExpiresAt: refreshExpiresAt.toISOString(),
        accessToken: data.access_token,
        accessTokenExpiresAt: accessExpiresAt.toISOString(),
      },
    })
  } catch {
    // Non-fatal — the in-memory cache still works for this
    // process's lifetime. Next restart pulls the un-rotated env
    // var and works until it too expires.
  }
}

/**
 * Get a valid Zalo access token, refreshing if necessary.
 */
export async function getZaloAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken
  }

  const appId = process.env.ZALO_APP_ID
  const appSecret = process.env.ZALO_APP_SECRET
  const refreshToken = (await loadRefreshTokenFromGlobal()) ?? process.env.ZALO_REFRESH_TOKEN

  if (!appId || !appSecret || !refreshToken) {
    throw new Error(
      'Zalo credentials not configured (ZALO_APP_ID, ZALO_APP_SECRET, ZALO_REFRESH_TOKEN / zalo-credentials global)',
    )
  }

  const params = new URLSearchParams({
    app_id: appId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      secret_key: appSecret,
    },
    body: params.toString(),
  })

  if (!res.ok) {
    throw new Error(`Zalo token refresh failed: ${res.status} ${await res.text()}`)
  }

  const data: ZaloTokenResponse = await res.json()
  cachedAccessToken = data.access_token
  tokenExpiresAt = Date.now() + data.expires_in * 1000

  await persistTokensToGlobal(data)

  return cachedAccessToken
}

/**
 * Send a message to a Zalo user via OA API.
 */
export async function zaloSendMessage(payload: {
  to: string
  text?: string
  attachments?: unknown[]
}): Promise<unknown> {
  const token = await getZaloAccessToken()

  const body: Record<string, unknown> = {
    recipient: { user_id: payload.to },
    message: {},
  }

  if (payload.text) {
    ;(body.message as Record<string, unknown>).text = payload.text
  }
  if (payload.attachments?.length) {
    ;(body.message as Record<string, unknown>).attachments = payload.attachments
  }

  const res = await fetch(`${ZALO_OA_API}/v3/oa/message/cs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      access_token: token,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Zalo sendMessage failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

/**
 * Result of a ZNS send. `ok` mirrors `error === 0` in the Zalo
 * response body (HTTP 200 alone is not enough — Zalo returns 200
 * with `error != 0` for delivery failures like "phone not on
 * Zalo"). Callers use `errorCode` to decide between hard errors
 * and soft fallbacks.
 *
 * Common codes:
 *   0    success
 *   -124 / -129 phone number not on Zalo / not allowed
 *   -125 user has blocked the OA
 *   -132 template not approved or not owned
 */
export interface ZaloZNSResult {
  ok: boolean
  errorCode: number
  errorMessage: string
  raw: unknown
}

/**
 * Send a ZNS (Zalo Notification Service) template message.
 * Throws only on transport errors (network, non-200). Body-level
 * failures are surfaced via the returned `ok: false` result so
 * callers can fall back to email / SMS.
 */
export async function zaloSendZNS(payload: {
  phone: string
  templateId: string
  templateData: Record<string, string>
  trackingId?: string
}): Promise<ZaloZNSResult> {
  const token = await getZaloAccessToken()

  const body: Record<string, unknown> = {
    phone: payload.phone,
    template_id: payload.templateId,
    template_data: payload.templateData,
  }
  if (payload.trackingId) {
    body.tracking_id = payload.trackingId
  }

  const res = await fetch(`${ZALO_OA_API}/v2/oa/message/template`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      access_token: token,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Zalo ZNS failed: ${res.status} ${await res.text()}`)
  }

  const json = (await res.json()) as { error?: number; message?: string }
  const errorCode = typeof json?.error === 'number' ? json.error : -1
  const errorMessage = typeof json?.message === 'string' ? json.message : ''
  return { ok: errorCode === 0, errorCode, errorMessage, raw: json }
}
