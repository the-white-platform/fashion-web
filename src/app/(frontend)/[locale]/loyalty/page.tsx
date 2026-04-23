'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/Link'
import { motion } from 'motion/react'
import {
  Award,
  TrendingUp,
  Gift,
  Star,
  Share2,
  Copy,
  ChevronRight,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useUser } from '@/contexts/UserContext'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface LoyaltyAccount {
  id: string
  points: number
  lifetimePoints: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  tierUpdatedAt?: string
}

interface LoyaltyTransaction {
  id: string
  type: string
  points: number
  balance: number
  description: string
  createdAt: string
}

const TIER_CONFIG = {
  bronze: {
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    min: 0,
    max: 5000,
    multiplier: 1,
    nextTier: 'silver',
  },
  silver: {
    color: 'text-slate-500',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    min: 5000,
    max: 20000,
    multiplier: 1.25,
    nextTier: 'gold',
  },
  gold: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    min: 20000,
    max: 50000,
    multiplier: 1.5,
    nextTier: 'platinum',
  },
  platinum: {
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    min: 50000,
    max: 50000,
    multiplier: 2,
    nextTier: null,
  },
}

export default function LoyaltyPage() {
  const t = useTranslations('loyalty')
  const tNav = useTranslations('nav')
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useUser()
  const [account, setAccount] = useState<LoyaltyAccount | null>(null)
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      setIsLoading(true)
      try {
        const [acctRes, txRes] = await Promise.all([
          fetch(`/api/loyalty-accounts?where[user][equals]=${user.id}&limit=1`, {
            credentials: 'include',
          }),
          fetch(
            `/api/loyalty-transactions?where[user][equals]=${user.id}&sort=-createdAt&limit=20`,
            { credentials: 'include' },
          ),
        ])

        const acctData = await acctRes.json()
        const txData = await txRes.json()

        setAccount(acctData.docs?.[0] ?? null)
        setTransactions(txData.docs ?? [])
      } catch {
        // silently fail
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, isAuthLoading, router])

  if (isAuthLoading || !user) return null

  const tier = (account?.tier ?? 'bronze') as keyof typeof TIER_CONFIG
  const tierInfo = TIER_CONFIG[tier]
  const lifetimePoints = account?.lifetimePoints ?? 0
  const progress =
    tier === 'platinum'
      ? 100
      : Math.min(100, ((lifetimePoints - tierInfo.min) / (tierInfo.max - tierInfo.min)) * 100)
  const pointsToNext = tier === 'platinum' ? 0 : Math.max(0, tierInfo.max - lifetimePoints)

  const referralCode = user?.referralCode ?? ''
  const referralUrl =
    referralCode && typeof window !== 'undefined'
      ? `${window.location.origin}/register?ref=${referralCode}`
      : ''

  const copyReferralCode = async () => {
    if (!referralCode) return
    try {
      await navigator.clipboard.writeText(referralCode)
      toast.success(t('copiedReferralCode'))
    } catch {
      toast.error(t('copyFailed'))
    }
  }
  const copyReferralLink = async () => {
    if (!referralUrl) return
    try {
      await navigator.clipboard.writeText(referralUrl)
      toast.success(t('copiedReferralLink'))
    } catch {
      toast.error(t('copyFailed'))
    }
  }

  const getTransactionIcon = (type: string, points: number) => {
    if (points > 0) return <ArrowUpCircle className="w-5 h-5 text-success" />
    return <ArrowDownCircle className="w-5 h-5 text-destructive" />
  }

  return (
    <PageContainer>
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{tNav('home')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('breadcrumb')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <h1 className="text-4xl uppercase tracking-wide mb-8">{t('pageTitle')}</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tier Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-sm border-2 ${tierInfo.border} ${tierInfo.bg} p-6 md:p-8`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Award className={`w-8 h-8 ${tierInfo.color}`} />
                    <span
                      className={`text-2xl font-bold uppercase tracking-wide ${tierInfo.color}`}
                    >
                      {t('tierLevel', { tier: t(tier as any) })}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {user.fullName} · {account?.points ?? 0} {t('availablePointsSuffix')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-foreground">
                    {(account?.points ?? 0).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('availablePointsSuffix')}</p>
                </div>
              </div>

              {/* Progress bar */}
              {tier !== 'platinum' && (
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>
                      {lifetimePoints.toLocaleString('vi-VN')} {t('lifetimePointsSuffix')}
                    </span>
                    <span>
                      {t('progressRemaining', {
                        n: pointsToNext.toLocaleString('vi-VN'),
                        tier: tierInfo.nextTier ? t(tierInfo.nextTier as any) : '',
                      })}
                    </span>
                  </div>
                  <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-white/40">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${tierInfo.color.replace('text-', 'bg-')}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {Math.round(progress)}%
                  </p>
                </div>
              )}
              {tier === 'platinum' && (
                <p className="text-sm text-purple-700 font-medium">{t('platinumMax')}</p>
              )}
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Tier Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-sm p-6"
              >
                <h2 className="text-xl uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  {t('tierBenefitsTitle', { tier: t(tier as any) })}
                </h2>
                <ul className="space-y-3">
                  {(t.raw(`tierBenefits.${tier}`) as string[]).map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Earning Rules */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-card border border-border rounded-sm p-6"
              >
                <h2 className="text-xl uppercase tracking-wide mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {t('earnRulesTitle')}
                </h2>
                <div className="space-y-3">
                  {(t.raw('earnRulesList') as Array<{ action: string; reward: string }>).map(
                    (rule, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
                      >
                        <span className="text-muted-foreground">{rule.action}</span>
                        <Badge variant="secondary">{rule.reward}</Badge>
                      </div>
                    ),
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">{t('conversionRate')}</p>
              </motion.div>
            </div>

            {/* Referral Section */}
            {referralCode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-sm p-6"
              >
                <h2 className="text-xl uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  {t('referral')}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">{t('referralDesc')}</p>

                <div className="mb-3">
                  <label className="block text-xs uppercase tracking-wide mb-2 text-muted-foreground">
                    {t('referralCodeLabel')}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 px-4 py-3 bg-muted rounded-sm font-mono text-sm truncate">
                      {referralCode}
                    </div>
                    <button
                      onClick={copyReferralCode}
                      className="flex items-center gap-2 px-4 py-3 border-2 border-foreground text-foreground rounded-sm hover:bg-muted transition-colors text-sm uppercase tracking-wide shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                      {t('copyReferral')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wide mb-2 text-muted-foreground">
                    {t('referralLinkLabel')}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 px-4 py-3 bg-muted rounded-sm text-sm truncate">
                      {referralUrl || '—'}
                    </div>
                    <button
                      onClick={copyReferralLink}
                      disabled={!referralUrl}
                      className="flex items-center gap-2 px-4 py-3 bg-foreground text-background rounded-sm hover:opacity-90 transition-colors text-sm uppercase tracking-wide shrink-0 disabled:opacity-50"
                    >
                      <Copy className="w-4 h-4" />
                      {t('copyReferralLink')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Points History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl uppercase tracking-wide">{t('history')}</h2>
              </div>

              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(tx.type, tx.points)}
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${tx.points > 0 ? 'text-success' : 'text-destructive'}`}
                        >
                          {tx.points > 0 ? '+' : ''}
                          {tx.points}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('balance', { n: tx.balance.toLocaleString('vi-VN') })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">{t('noTransactions')}</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 mt-4 text-sm text-foreground underline uppercase tracking-wide"
                  >
                    {t('shopToEarn')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
