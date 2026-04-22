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

  const body = `
    <p>Copy this into Secret Manager (prod) and <code>.env.local</code> (local):</p>
    <pre style="background:#f3f3f3;padding:12px;border-radius:4px;overflow:auto;white-space:pre-wrap;word-break:break-all;">ZALO_REFRESH_TOKEN=${escapeHtml(data.refresh_token)}</pre>
    <details>
      <summary style="cursor:pointer;">Full response</summary>
      <pre style="background:#f9f9f9;padding:12px;border-radius:4px;overflow:auto;">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
    </details>
    <h3>Next steps</h3>
    <ol>
      <li>Push the secret: <code>printf '%s' '&lt;token&gt;' | gcloud secrets versions add ZALO_REFRESH_TOKEN --data-file=- --project the-white-prod-481217</code> (create the secret first if it's not there).</li>
      <li>Wire into Cloud Run: <code>gcloud run services update fashion-web --region asia-southeast1 --update-secrets=ZALO_REFRESH_TOKEN=ZALO_REFRESH_TOKEN:latest</code></li>
      <li>Refresh tokens expire ~3 months after issue. Re-run <a href="/api/auth/zalo/oa-connect">oa-connect</a> before then.</li>
    </ol>
  `

  return htmlPage('Zalo OA Refresh Token', body)
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
