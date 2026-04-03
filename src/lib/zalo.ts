/**
 * Zalo Official Account (OA) API client with token refresh.
 *
 * Environment variables required:
 *   ZALO_APP_ID         — Zalo app ID
 *   ZALO_APP_SECRET     — Zalo app secret
 *   ZALO_REFRESH_TOKEN  — Long-lived refresh token (obtained from OA dashboard)
 */

const ZALO_OA_API = 'https://openapi.zalo.me'
const TOKEN_URL = 'https://oauth.zaloapp.com/v4/oa/access_token'

interface ZaloTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

let cachedAccessToken: string | null = null
let tokenExpiresAt = 0

/**
 * Get a valid Zalo access token, refreshing if necessary.
 */
export async function getZaloAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken
  }

  const appId = process.env.ZALO_APP_ID
  const appSecret = process.env.ZALO_APP_SECRET
  const refreshToken = process.env.ZALO_REFRESH_TOKEN

  if (!appId || !appSecret || !refreshToken) {
    throw new Error(
      'Zalo credentials not configured (ZALO_APP_ID, ZALO_APP_SECRET, ZALO_REFRESH_TOKEN)',
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
 * Send a ZNS (Zalo Notification Service) template message.
 */
export async function zaloSendZNS(payload: {
  phone: string
  templateId: string
  templateData: Record<string, string>
  trackingId?: string
}): Promise<unknown> {
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

  return res.json()
}
