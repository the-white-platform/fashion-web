'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/Link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { PageContainer } from '@/components/layout/PageContainer'

export default function VerifyEmailPage() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorDetail, setErrorDetail] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        if (res.ok) {
          setStatus('success')
        } else {
          // Try to surface the real reason (expired token, mismatched
          // hash, etc.) for the staff debugging the link. Falls back
          // to a plain "error" state if parsing fails.
          const body = await res.json().catch(() => null)
          const msg =
            (body?.errors?.[0]?.message as string | undefined) ||
            (body?.error as string | undefined) ||
            (body?.message as string | undefined) ||
            ''
          if (msg) setErrorDetail(msg)
          setStatus('error')
        }
      } catch (err) {
        if (err instanceof Error) setErrorDetail(err.message)
        setStatus('error')
      }
    }
    verify()
  }, [token])

  return (
    <PageContainer>
      <div className="flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full text-center"
        >
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-muted-foreground" />
              <h1 className="text-2xl uppercase tracking-wide mb-2">
                {t('auth.verifyingEmail') || 'Verifying Email...'}
              </h1>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl uppercase tracking-wide mb-2">
                {t('auth.emailVerified') || 'Email Verified!'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t('auth.emailVerifiedDesc') || 'Your email has been verified successfully.'}
              </p>
              <Link
                href="/profile"
                className="inline-block bg-foreground text-background px-6 py-3 rounded-sm uppercase tracking-wide"
              >
                {t('auth.goToProfile') || 'Go to Profile'}
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h1 className="text-2xl uppercase tracking-wide mb-2">
                {t('auth.verificationFailed') || 'Verification Failed'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t('auth.invalidVerificationLink') ||
                  'This verification link is invalid or has expired.'}
              </p>
              {errorDetail && (
                <p className="text-xs text-destructive/80 mb-6 break-words">{errorDetail}</p>
              )}
              <Link
                href="/profile"
                className="inline-block bg-foreground text-background px-6 py-3 rounded-sm uppercase tracking-wide"
              >
                {t('auth.goToProfile') || 'Go to Profile'}
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </PageContainer>
  )
}
