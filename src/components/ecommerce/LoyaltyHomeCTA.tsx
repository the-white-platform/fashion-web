'use client'

import React from 'react'
import { Award, Share2, Gift } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { Link } from '@/i18n/Link'
import { useUser } from '@/contexts/UserContext'
import { useLoyaltySummary } from '@/hooks/useLoyaltySummary'

/**
 * Homepage marketing block for the loyalty program. Dual-state:
 *   - Anonymous: pitch the program + nudge to register with a
 *     referral-style "Earn 200 pts on signup via a friend" hook.
 *   - Authenticated: show current points + share-your-code CTA so
 *     the home page becomes a channel for organic referrals.
 *
 * Kept in its own component rather than inlined in page.client.tsx
 * so marketing can rewrap it in a different layout later without
 * touching the home composition file.
 */
export const LoyaltyHomeCTA: React.FC = () => {
  const t = useTranslations('loyalty')
  const tNav = useTranslations('nav')
  const { user } = useUser()
  const { summary } = useLoyaltySummary()

  const isAuthed = Boolean(user)

  return (
    <section className="py-20 bg-background text-foreground">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden border-2 border-foreground rounded-none bg-card p-8 md:p-12"
        >
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-foreground text-xs uppercase font-bold tracking-widest">
                <Award className="w-4 h-4" />
                {t('pageTitle')}
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
                {isAuthed && summary
                  ? t('homeCtaTitleAuthed', {
                      points: summary.points.toLocaleString('vi-VN'),
                    })
                  : t('homeCtaTitleGuest')}
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
                {isAuthed ? t('homeCtaSubtitleAuthed') : t('homeCtaSubtitleGuest')}
              </p>

              <ul className="grid sm:grid-cols-3 gap-3 pt-2">
                <li className="flex items-start gap-2 text-sm">
                  <Gift className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{t('homeCtaBulletEarn')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Share2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{t('homeCtaBulletReferral')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{t('homeCtaBulletTiers')}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 md:min-w-[220px]">
              <Link
                href={isAuthed ? '/loyalty' : '/register'}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground uppercase font-bold tracking-widest text-sm hover:bg-primary/90 transition-colors"
              >
                {isAuthed ? t('homeCtaViewPoints') : tNav('register')}
              </Link>
              {!isAuthed && (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-foreground uppercase font-bold tracking-widest text-sm hover:bg-accent transition-colors"
                >
                  {tNav('login')}
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
