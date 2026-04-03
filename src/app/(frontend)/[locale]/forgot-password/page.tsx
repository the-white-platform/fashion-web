'use client'

import { useState } from 'react'
import { Link } from '@/i18n/Link'
import { Mail, ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import { Logo } from '@/components/shared/Logo/Logo'
import { useTranslations } from 'next-intl'
import { PageContainer } from '@/components/layout/PageContainer'

export default function ForgotPasswordPage() {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldown > 0) return

    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        throw new Error('Failed to send reset email')
      }
      setSent(true)
      setCooldown(60)
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      setError(t('auth.resetEmailError') || 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="mb-8">
              <Link href="/" className="inline-block">
                <Logo showSlogan={false} className="items-center justify-center" />
              </Link>
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-foreground text-background rounded-sm mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl uppercase tracking-wide mb-2">
              {t('auth.forgotPassword')}
            </h1>
            <p className="text-muted-foreground">
              {t('auth.forgotPasswordDesc') || 'Enter your email to receive reset instructions'}
            </p>
          </div>

          {sent ? (
            <div className="bg-card border border-border rounded-sm p-6 text-center">
              <p className="text-foreground mb-4">
                {t('auth.resetEmailSent') || 'Check your email for reset instructions'}
              </p>
              {cooldown > 0 && (
                <p className="text-muted-foreground text-sm">
                  {t('auth.resendIn') || 'Resend in'} {cooldown}s
                </p>
              )}
              {cooldown === 0 && (
                <button
                  onClick={() => setSent(false)}
                  className="text-foreground underline text-sm uppercase tracking-wide"
                >
                  {t('auth.resend') || 'Send again'}
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm uppercase tracking-wide mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-primary transition-colors bg-background"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground text-background py-4 rounded-sm hover:opacity-90 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? t('common.processing') || 'Processing...'
                  : t('auth.sendResetLink') || 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm uppercase tracking-wide"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.backToLogin') || 'Back to Login'}
            </Link>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  )
}
