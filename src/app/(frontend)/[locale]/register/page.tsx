'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/Link'
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, Gift } from 'lucide-react'
import { motion } from 'motion/react'
import { useUser } from '@/contexts/UserContext'
import { Logo } from '@/components/shared/Logo/Logo'
import { useTranslations } from 'next-intl'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useUser()
  const t = useTranslations()
  const tCommon = useTranslations('common')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    // Read referral code from URL or localStorage
    const refFromUrl = searchParams?.get('ref')
    if (refFromUrl) {
      setReferralCode(refFromUrl)
      try {
        localStorage.setItem('referralCode', refFromUrl)
      } catch {
        // ignore storage errors
      }
    } else {
      try {
        const stored = localStorage.getItem('referralCode')
        if (stored) setReferralCode(stored)
      } catch {
        // ignore storage errors
      }
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = (): boolean => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError(t('auth.requiredFields'))
      return false
    }

    if (!formData.email.includes('@')) {
      setError(t('auth.invalidEmail'))
      return false
    }

    if (formData.phone.length < 10) {
      setError(t('auth.invalidPhone'))
      return false
    }

    if (formData.password.length < 8) {
      setError(t('auth.passwordMinLength'))
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return false
    }

    if (!acceptTerms) {
      setError(t('auth.mustAcceptTerms'))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Try to register
    try {
      const success = await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.phone,
      )
      if (success) {
        // If we have a referral code, create a referral record
        if (referralCode) {
          try {
            // Find the referrer by their referral code
            const refRes = await fetch(
              `/api/users?where[referralCode][equals]=${encodeURIComponent(referralCode)}&limit=1`,
              { credentials: 'include' },
            )
            const refData = await refRes.json()
            const referrer = refData.docs?.[0]

            if (referrer) {
              // Get current user ID
              const meRes = await fetch('/api/users/me', { credentials: 'include' })
              const meData = await meRes.json()
              const newUserId = meData?.user?.id

              if (newUserId) {
                await fetch('/api/referrals', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    referrer: referrer.id,
                    referee: newUserId,
                    referralCode,
                    status: 'pending',
                  }),
                })
              }
            }
            // Clear the stored referral code
            try {
              localStorage.removeItem('referralCode')
            } catch {
              /* ignore */
            }
          } catch {
            // Non-blocking: referral creation failure should not block registration
          }
        }
        router.push('/profile')
      } else {
        setError(t('auth.registerFailed'))
      }
    } catch {
      setError(t('auth.registerFailed'))
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-8">
            <Link href="/" className="inline-block">
              <Logo showSlogan={false} className="items-center justify-center" />
            </Link>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-foreground text-background rounded-sm mb-6">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl uppercase tracking-wide mb-2 text-foreground">
            {t('auth.register')}
          </h1>
          <p className="text-muted-foreground">{t('auth.createAccount')}</p>
        </div>

        {/* Referral Banner */}
        {referralCode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-sm text-sm flex items-center gap-2 mb-4"
          >
            <Gift className="w-5 h-5 shrink-0" />
            <span>
              Bạn được giới thiệu bởi một thành viên The White. Đăng ký ngay để cả hai nhận điểm
              thưởng!
            </span>
          </motion.div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm uppercase tracking-wide mb-2">
              {t('auth.fullName')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                placeholder={t('auth.fullNamePlaceholder')}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm uppercase tracking-wide mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm uppercase tracking-wide mb-2">
              {t('auth.phone')}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                placeholder="0123 456 789"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
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
            <p className="text-xs text-muted-foreground mt-1">{t('auth.passwordHint')}</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm uppercase tracking-wide mb-2">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 border-2 border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-5 h-5 rounded mt-0.5 flex-shrink-0"
              required
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              {t.rich('auth.agreeTermsRegister', {
                terms: (chunks) => (
                  <Link href="/terms-of-use" className="text-foreground underline hover:opacity-80">
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link
                    href="/privacy-policy"
                    className="text-foreground underline hover:opacity-80"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </label>
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
                <UserPlus className="w-5 h-5" />
                <span>{t('auth.register')}</span>
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

          {/* Login Link */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{t('auth.hasAccount')}</p>
            <Link
              href="/login"
              className="w-full block border-2 border-foreground text-foreground py-4 rounded-sm hover:bg-muted transition-colors uppercase tracking-wider text-center"
            >
              {t('auth.login')}
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
