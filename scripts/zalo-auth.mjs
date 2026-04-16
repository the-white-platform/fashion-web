#!/usr/bin/env node
/**
 * Zalo OA OAuth helper — runs the PKCE handshake to obtain a long-lived
 * `refresh_token` for the OA. Run once, copy the printed token into
 * .env (and GCP Secret Manager for prod), then never again until the
 * refresh token expires (~3 months).
 *
 * Usage:
 *   pnpm zalo:auth
 *
 * Prereqs (one-time, in the Zalo Developer Console for your App):
 *   1. App permissions include the OA you want to send from
 *   2. Add `http://localhost:9876/callback` to the App's redirect URI
 *      whitelist (Login → Callback URL).
 *
 * The script reads ZALO_APP_ID + ZALO_APP_SECRET from .env / .env.local.
 */

// .env is loaded via Node's `--env-file=.env` flag from `pnpm zalo:auth`.
import { createServer } from 'node:http'
import { createHash, randomBytes } from 'node:crypto'
import { exec } from 'node:child_process'

const APP_ID = process.env.ZALO_APP_ID
const APP_SECRET = process.env.ZALO_APP_SECRET
const PORT = Number(process.env.ZALO_AUTH_PORT) || 9876
const REDIRECT_URI = `http://localhost:${PORT}/callback`

if (!APP_ID || !APP_SECRET) {
  console.error('✖ ZALO_APP_ID and ZALO_APP_SECRET must be set in .env first.')
  process.exit(1)
}

// PKCE pair — Zalo requires SHA256 challenge.
const codeVerifier = base64UrlEncode(randomBytes(32))
const codeChallenge = base64UrlEncode(createHash('sha256').update(codeVerifier).digest())
const state = randomBytes(16).toString('hex')

const authUrl = new URL('https://oauth.zaloapp.com/v4/oa/permission')
authUrl.searchParams.set('app_id', APP_ID)
authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
authUrl.searchParams.set('code_challenge', codeChallenge)
authUrl.searchParams.set('state', state)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Zalo OA OAuth handshake')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`Listening on:  ${REDIRECT_URI}`)
console.log('')
console.log('Make sure THIS exact URL is in your Zalo App\'s')
console.log('  Login → Callback URL whitelist (Developer Console).')
console.log('')
console.log('Opening the authorize URL in your browser…')
console.log(`  ${authUrl.toString()}`)
console.log('')

const server = createServer(async (req, res) => {
  if (!req.url || !req.url.startsWith('/callback')) {
    res.writeHead(404).end('not found')
    return
  }

  const incoming = new URL(req.url, `http://localhost:${PORT}`)
  const code = incoming.searchParams.get('code')
  const returnedState = incoming.searchParams.get('state')
  const errorParam = incoming.searchParams.get('error')

  if (errorParam) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end(`Zalo returned: ${errorParam}`)
    console.error(`✖ Zalo auth error: ${errorParam}`)
    process.exit(1)
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Missing ?code')
    return
  }

  if (returnedState !== state) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('State mismatch — abort')
    console.error('✖ state did not match — possible CSRF, aborting')
    process.exit(1)
  }

  try {
    const tokenRes = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: APP_SECRET,
      },
      body: new URLSearchParams({
        app_id: APP_ID,
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
      }).toString(),
    })

    const data = await tokenRes.json()
    if (!tokenRes.ok || !data.refresh_token) {
      res.writeHead(500, { 'Content-Type': 'text/plain' }).end(`Token exchange failed: ${JSON.stringify(data)}`)
      console.error('✖ token exchange failed:', data)
      process.exit(1)
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(`
      <!doctype html>
      <meta charset="utf-8">
      <title>Zalo OAuth — done</title>
      <body style="font-family: system-ui; padding: 2em; max-width: 700px; margin: 0 auto;">
        <h1 style="color: #2563eb">✔ Zalo OAuth complete</h1>
        <p>Refresh token printed in the terminal. You can close this tab.</p>
      </body>
    `)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✔ Got refresh token (valid ~3 months, self-renews on use)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('Add to .env (local) and GCP Secret Manager (prod):')
    console.log('')
    console.log(`  ZALO_REFRESH_TOKEN=${data.refresh_token}`)
    console.log('')
    if (data.access_token) {
      console.log('Access token (short-lived, just for testing):')
      console.log(`  ${data.access_token.slice(0, 24)}…  (expires in ${data.expires_in}s)`)
      console.log('')
    }
    console.log('After updating Secret Manager, redeploy Cloud Run so the')
    console.log('new env reaches the running revision.')
    console.log('')

    server.close()
    process.exit(0)
  } catch (err) {
    res
      .writeHead(500, { 'Content-Type': 'text/plain' })
      .end(`Token exchange error: ${err instanceof Error ? err.message : String(err)}`)
    console.error('✖', err)
    process.exit(1)
  }
})

server.listen(PORT, () => {
  // Best-effort browser open. macOS / linux / wsl.
  const cmd =
    process.platform === 'darwin'
      ? `open "${authUrl.toString()}"`
      : process.platform === 'win32'
        ? `start "" "${authUrl.toString()}"`
        : `xdg-open "${authUrl.toString()}" 2>/dev/null || true`
  exec(cmd, (err) => {
    if (err) {
      console.log('(Could not auto-open browser — copy the URL above into your browser.)')
    }
  })
})

// 5-minute timeout — if the user wandered off, fail loudly.
setTimeout(() => {
  console.error('✖ Timed out waiting for the OAuth callback (5 minutes).')
  process.exit(1)
}, 5 * 60_000)

function base64UrlEncode(buf) {
  return buf.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}
