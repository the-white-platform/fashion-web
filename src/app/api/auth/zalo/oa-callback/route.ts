import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { hasRole } from '@/access/roles'

/**
 * Zalo OA OAuth callback. Exchanges the approval `code` for an
 * access + refresh token pair and renders a plaintext page so an
 * admin can copy the refresh token into Secret Manager /
 * `.env.local`.
 *
 * Admin-only. Never render refresh tokens into any flow a customer
 * can reach — these grant the backend the ability to message
 * anyone on behalf of our OA.
 *
 * After you capture the token: close the tab, hit `gcloud secrets
 * create ZALO_REFRESH_TOKEN ...` (or add a new version) and wire
 * it into Cloud Run env via `--update-secrets`. Tokens live ~3
 * months; re-run this flow before expiry.
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user || !hasRole(user, ['admin'])) {
    return NextResponse.json({ error: 'Admin auth required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return htmlPage(
      'Zalo OA Link Cancelled',
      `<p>Zalo returned <code>error=${escapeHtml(errorParam)}</code>. Nothing was saved. Re-run <a href="/api/auth/zalo/oa-connect">oa-connect</a> to try again.</p>`,
    )
  }

  if (!code) {
    return htmlPage('Missing code', '<p>Zalo did not return an authorisation code.</p>')
  }

  const appId = process.env.ZALO_APP_ID
  const appSecret = process.env.ZALO_APP_SECRET
  if (!appId || !appSecret) {
    return htmlPage(
      'Not configured',
      '<p><code>ZALO_APP_ID</code> / <code>ZALO_APP_SECRET</code> missing from the server environment.</p>',
    )
  }

  const tokenRes = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      secret_key: appSecret,
    },
    body: new URLSearchParams({
      app_id: appId,
      code,
      grant_type: 'authorization_code',
    }),
  })

  const data = (await tokenRes.json().catch(() => ({}))) as {
    access_token?: string
    refresh_token?: string
    expires_in?: string | number
    error?: number
    error_name?: string
    message?: string
  }

  if (!tokenRes.ok || !data.refresh_token) {
    return htmlPage(
      'Zalo token exchange failed',
      `<p>Status <code>${tokenRes.status}</code>.</p><pre style="background:#f3f3f3;padding:12px;border-radius:4px;overflow:auto;">${escapeHtml(JSON.stringify(data, null, 2))}</pre>`,
    )
  }

  // Persist directly to the `zalo-credentials` Payload global.
  // Refresh tokens live ~90 days per Zalo's docs; record the
  // issue + expiry timestamp so the admin dashboard can warn
  // before it lapses.
  const now = new Date()
  const REFRESH_TOKEN_TTL_DAYS = 90
  const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
  const accessExpiresSec = Number(data.expires_in ?? 3600)
  const accessExpiresAt = new Date(now.getTime() + accessExpiresSec * 1000)

  try {
    await payload.updateGlobal({
      slug: 'zalo-credentials',
      data: {
        refreshToken: data.refresh_token,
        refreshTokenIssuedAt: now.toISOString(),
        refreshTokenExpiresAt: expiresAt.toISOString(),
        accessToken: data.access_token,
        accessTokenExpiresAt: accessExpiresAt.toISOString(),
      },
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'oa-callback: failed to persist token' })
    return htmlPage(
      'Saved Zalo response but could not persist',
      `<p>Token exchange succeeded but writing to the <code>zalo-credentials</code> global failed — admin can paste the value manually:</p>
       <pre style="background:#f3f3f3;padding:12px;border-radius:4px;overflow:auto;white-space:pre-wrap;word-break:break-all;">ZALO_REFRESH_TOKEN=${escapeHtml(data.refresh_token)}</pre>`,
    )
  }

  const body = `
    <p style="color:#15803d;">✓ Saved to the <code>zalo-credentials</code> global. ZNS + OA message hooks now have a valid token.</p>
    <p>Refresh token expires on <strong>${expiresAt.toLocaleString('en-US', { dateStyle: 'full' })}</strong> (~90 days from now). The admin dashboard will warn starting 14 days before.</p>
    <p><a href="/admin/globals/zalo-credentials">Open the Zalo credentials global →</a></p>
    <p><a href="/admin">Back to admin</a></p>
  `

  return htmlPage('Zalo OA Refresh Token saved', body)
}

function htmlPage(title: string, body: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${escapeHtml(title)}</title></head>
<body style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#1a1a1a;">
  <h1 style="font-size:20px;border-bottom:1px solid #eee;padding-bottom:12px;">${escapeHtml(title)}</h1>
  ${body}
  <hr style="margin-top:32px;border:none;border-top:1px solid #eee;">
  <p style="font-size:12px;color:#888;">Admin-only route. Not exposed to customers.</p>
</body>
</html>`
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
