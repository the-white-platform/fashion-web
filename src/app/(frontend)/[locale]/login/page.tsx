'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/Link'
import { LogIn, AtSign, Lock, Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import { useUser } from '@/contexts/UserContext'
import { useTranslations } from 'next-intl'
import { looksLikeEmail, looksLikeVnPhone } from '@/lib/identity'

const OAUTH_ERROR_CODES = [
  'google_unverified',
  'facebook_unverified',
  'account_linked_to_google',
  'account_linked_to_facebook',
  'account_linked_to_zalo',
  'account_uses_password',
  'zalo_cancelled',
  'zalo_state_mismatch',
  'zalo_token_exchange_failed',
  'zalo_profile_failed',
  'zalo_account_create_failed',
] as const

type OAuthErrorCode = (typeof OAUTH_ERROR_CODES)[number]

function isOAuthErrorCode(code: string): code is OAuthErrorCode {
  return (OAUTH_ERROR_CODES as readonly string[]).includes(code)
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useUser()
  const t = useTranslations()
  const tCommon = useTranslations('common')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const code = searchParams.get('error')
    if (!code || !isOAuthErrorCode(code)) return
    // Zalo callback may pass the upstream code + human-readable
    // reason as query params. When present, show them alongside
    // the localized fallback message so the customer sees the real
    // reason (e.g. "IP address not inside Vietnam") rather than a
    // generic retry prompt.
    const zaloCode = searchParams.get('zalo_code')
    const zaloMessage = searchParams.get('zalo_message')
    const base = t(`auth.oauthError.${code}`)
    if (zaloMessage || zaloCode) {
      const suffix = [zaloMessage, zaloCode ? `(code ${zaloCode})` : ''].filter(Boolean).join(' ')
      setError(`${base} ${suffix}`.trim())
    } else {
      setError(base)
    }
  }, [searchParams, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const trimmed = identifier.trim()
    if (!trimmed || !password) {
      setError(t('auth.requiredFields'))
      setIsLoading(false)
      return
    }

    if (!looksLikeEmail(trimmed) && !looksLikeVnPhone(trimmed)) {
      setError(t('auth.invalidIdentifier'))
      setIsLoading(false)
      return
    }

    try {
      const success = await login(trimmed, password)
      if (!success) {
        setError(t('auth.invalidCredentials'))
        return
      }
      router.push('/profile')
    } catch (err: any) {
      setError(err.message || t('auth.invalidCredentials'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Header — site logo is already in the page header, so we
            only show the context icon + title here to avoid the double
            brand mark. */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-foreground text-background rounded-sm mb-6">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl uppercase tracking-wide mb-2">{t('auth.login')}</h1>
          <p className="text-muted-foreground">{t('auth.welcomeBack')}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Unified identifier — email OR phone in a single input.
              Login is minimal friction; register still collects both
              separately for data quality. */}
          <div>
            <label htmlFor="identifier" className="block text-sm uppercase tracking-wide mb-2">
              {t('auth.emailOrPhone')}
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                id="identifier"
                autoComplete="username"
                inputMode="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-primary transition-colors bg-background"
                placeholder={t('auth.emailOrPhonePlaceholder')}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm uppercase tracking-wide mb-2">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-primary transition-colors bg-background"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-muted-foreground">{t('auth.rememberMe')}</span>
            </label>
            <Link href="/forgot-password" className="text-foreground hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-background py-4 rounded-sm hover:opacity-90 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                <span>{tCommon('processing')}</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>{t('auth.login')}</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground uppercase tracking-wide">
                {t('auth.or')}
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{t('auth.noAccount')}</p>
            <Link
              href="/register"
              className="w-full block border-2 border-foreground text-foreground py-4 rounded-sm hover:bg-muted transition-colors uppercase tracking-wider text-center"
            >
              {t('auth.registerNow')}
            </Link>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground uppercase tracking-wide">
              {t('auth.orLoginWith')}
            </p>
            {/* Facebook login temporarily hidden pending app review —
                Google + Zalo shown side by side. */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => (window.location.href = '/api/auth/google')}
                className="flex items-center justify-center gap-2 py-3 border border-border rounded-sm hover:bg-muted transition-colors"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-label="Google">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/api/auth/zalo')}
                className="flex items-center justify-center gap-2 py-3 border border-border rounded-sm hover:bg-muted transition-colors"
                disabled={isLoading}
              >
                {/* Zalo brand mark served from simple-icons CDN —
                    renders the official wordmark in Zalo blue.
                    Drop-in replaceable: swap the src for a locally
                    hosted asset (e.g. `/icons/zalo.png`) if
                    marketing ships a version with specific
                    proportions. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://cdn.simpleicons.org/zalo/0068FF"
                  alt="Zalo"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>
        </form>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          {t.rich('auth.agreeTermsLogin', {
            terms: (chunks) => (
              <Link href="/terms-of-use" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy-policy" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </motion.div>
    </div>
  )
}
