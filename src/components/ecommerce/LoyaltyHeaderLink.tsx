'use client'

import React from 'react'
import { Award } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/Link'
import { cn } from '@/utilities/cn'
import { useLoyaltySummary } from '@/hooks/useLoyaltySummary'

/**
 * Compact loyalty entry-point for the main header. Only renders for
 * authenticated users — anonymous visitors see the regular
 * `/login` → `/register` CTA instead and shouldn't be funneled
 * toward a points page they can't read yet.
 *
 * Shows an `Award` icon plus a live points pill. The pill gracefully
 * degrades: while the fetch is in flight it shows nothing (icon
 * alone), and once loaded it shows the current balance (including
 * zero — a zero balance is actually useful context for a new user).
 */
export const LoyaltyHeaderLink: React.FC<{ isScrolled?: boolean }> = ({ isScrolled }) => {
  const { summary } = useLoyaltySummary()
  const t = useTranslations('loyalty')

  if (!summary) return null

  const points = summary.points
  // Compact display: >=1000 shows as "1.2K" so the pill stays under
  // three characters wide at 375px viewport.
  const pointsLabel =
    points >= 10_000
      ? `${Math.floor(points / 1000)}K`
      : points >= 1_000
        ? `${(points / 1000).toFixed(1)}K`
        : String(points)

  return (
    <Link
      href="/loyalty"
      aria-label={t('pageTitle')}
      className={cn(
        'hidden lg:flex items-center gap-1.5 px-2 py-2 hover:bg-accent rounded-sm transition-all relative',
        !isScrolled && 'drop-shadow-lg',
      )}
    >
      <Award className="w-5 h-5" />
      <span className="text-xs font-bold tabular-nums leading-none">{pointsLabel}</span>
    </Link>
  )
}
