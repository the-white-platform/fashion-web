'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/Link'
import { useRouter } from '@/i18n/useRouter'
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import { Logo } from '@/components/shared/Logo/Logo'
import { useTranslations } from 'next-intl'
import { PageContainer } from '@/components/layout/PageContainer'

export default function ResetPasswordPage() {
  const t = useTranslations()
  const tCommon = useTranslations('common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(t('auth.passwordMinLength') || 'Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch') || 'Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) {
        throw new Error('Reset failed')
      }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError(t('auth.resetFailed') || 'Invalid or expired reset link')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl uppercase tracking-wide mb-4">
              {t('auth.invalidLink') || 'Invalid Link'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t('auth.invalidResetLink') || 'This reset link is invalid or has expired.'}
            </p>
            <Link
              href="/forgot-password"
              className="inline-block bg-foreground text-background px-6 py-3 rounded-sm uppercase tracking-wide"
            >
              {t('auth.requestNewLink') || 'Request New Link'}
            </Link>
          </div>
        </div>
      </PageContainer>
    )
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
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl uppercase tracking-wide mb-2">
              {t('auth.resetPassword') || 'Reset Password'}
            </h1>
          </div>

          {success ? (
            <div className="bg-card border border-border rounded-sm p-6 text-center">
              <p className="text-foreground mb-2">
                {t('auth.passwordResetSuccess') || 'Password reset successful!'}
              </p>
              <p className="text-muted-foreground text-sm">
                {t('auth.redirectingToLogin') || 'Redirecting to login...'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm uppercase tracking-wide mb-2">
                  {t('auth.newPassword') || 'New Password'}
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
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm uppercase tracking-wide mb-2"
                >
                  {t('auth.confirmPassword') || 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-primary transition-colors bg-background"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground text-background py-4 rounded-sm hover:opacity-90 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? tCommon('processing') : t('auth.resetPassword') || 'Reset Password'}
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
