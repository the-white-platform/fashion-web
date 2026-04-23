'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PageContainer } from '@/components/layout/PageContainer'
import { Loader2, XCircle } from 'lucide-react'

/**
 * Client-side Zalo login finisher.
 *
 * Zalo's `/v2.0/me` endpoint geo-gates requests: only Vietnamese
 * IPs can read user personal info. Our Cloud Run region sits in
 * Singapore, so the server-side callback can't fetch the profile
 * on behalf of the user. This page runs in the user's browser
 * (which IS in Vietnam for the intended audience), calls `/me`
 * directly with the access_token the server parked in the URL
 * fragment, then POSTs the resulting `{ id, name, picture }` to
 * `/api/auth/zalo/finalize`, which verifies the token against the
 * httpOnly cookie the callback set and issues the `payload-token`
 * session.
 *
 * The access_token is in the URL fragment rather than a query
 * param so it never reaches the server, logs, or Referer headers
 * of outbound requests.
 */
export default function ZaloContinuePage() {
  const router = useRouter()
  const t = useTranslations()
  const [status, setStatus] = useState<'working' | 'error'>('working')
  const [errorDetail, setErrorDetail] = useState<string>('')

  useEffect(() => {
    const abort = new AbortController()
    ;(async () => {
      // Parse access_token from the URL fragment. `window.location.hash`
      // starts with "#t=<token>" — strip the marker, URL-decode.
      const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
      const params = new URLSearchParams(hash)
      const accessToken = params.get('t')
      if (!accessToken) {
        setErrorDetail('Missing access token in URL fragment.')
        setStatus('error')
        return
      }

      // Wipe the fragment immediately so browser history + dev
      // tools don't retain the token.
      window.history.replaceState(null, '', window.location.pathname + window.location.search)

      try {
        const meRes = await fetch('https://graph.zalo.me/v2.0/me?fields=id,name,picture', {
          headers: { access_token: accessToken },
          signal: abort.signal,
        })
        const meBody = await meRes.json().catch(() => ({}))

        if (!meRes.ok || !meBody?.id) {
          const reason =
            (typeof meBody?.message === 'string' && meBody.message) ||
            `Zalo /me failed (${meRes.status})`
          setErrorDetail(reason)
          setStatus('error')
          return
        }

        const finalizeRes = await fetch('/api/auth/zalo/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            accessToken,
            id: String(meBody.id),
            name: typeof meBody.name === 'string' ? meBody.name : undefined,
            picture: meBody.picture?.data?.url,
          }),
          signal: abort.signal,
        })

        if (!finalizeRes.ok) {
          const body = await finalizeRes.json().catch(() => ({}))
          setErrorDetail(
            typeof body?.error === 'string'
              ? body.error
              : `Finalize failed (${finalizeRes.status})`,
          )
          setStatus('error')
          return
        }

        // Full reload so UserContext remounts and re-fetches
        // /api/users/me against the freshly-set payload-token
        // cookie. `router.replace` keeps the provider mounted
        // and leaves the UI in a logged-out state.
        window.location.replace('/')
        return
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
        setErrorDetail(err instanceof Error ? err.message : String(err))
        setStatus('error')
      }
    })()

    return () => abort.abort()
  }, [router])

  return (
    <PageContainer>
      <div className="flex items-center justify-center px-6 py-20">
        <div className="max-w-md w-full text-center">
          {status === 'working' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-muted-foreground" />
              <h1 className="text-2xl uppercase tracking-wide mb-2">
                {t('auth.signingIn') || 'Đang đăng nhập…'}
              </h1>
              <p className="text-muted-foreground text-sm">
                Lấy thông tin từ Zalo, vui lòng không đóng trang.
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h1 className="text-2xl uppercase tracking-wide mb-2">
                {t('auth.oauthError.zalo_profile_failed') ||
                  'Không lấy được thông tin Zalo. Vui lòng thử lại.'}
              </h1>
              {errorDetail && (
                <p className="text-xs text-destructive/80 mt-2 mb-4 break-words">{errorDetail}</p>
              )}
              <button
                onClick={() => router.replace('/login')}
                className="inline-block bg-foreground text-background px-6 py-3 rounded-sm uppercase tracking-wide mt-4"
              >
                {t('auth.backToLogin') || 'Quay về đăng nhập'}
              </button>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
