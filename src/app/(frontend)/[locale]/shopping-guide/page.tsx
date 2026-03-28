'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { ShoppingCart, Package, UserCheck, Truck, CreditCard, CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/Link'
import { PageContainer } from '@/components/layout/PageContainer'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const STEP_ICONS = [ShoppingCart, Package, UserCheck, Truck, CreditCard, CheckCircle] as const

export default function ShoppingGuidePage() {
  const t = useTranslations('shoppingGuide')
  const tNav = useTranslations('nav')

  const steps = (['s1', 's2', 's3', 's4', 's5', 's6'] as const).map((key, i) => ({
    key,
    num: i + 1,
    Icon: STEP_ICONS[i],
    title: t(`steps.${key}.title`),
    desc: t(`steps.${key}.desc`),
  }))

  const tips = (['t1', 't2', 't3', 't4'] as const).map((key) => ({
    key,
    text: t(`tips.${key}`),
  }))

  return (
    <PageContainer className="overflow-hidden">
      {/* Noisy Background Texture */}
      <div className="fixed inset-0 opacity-20 dark:opacity-5 pointer-events-none z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide">{t('title')}</h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
        </motion.div>

        {/* Shopping Steps */}
        <div className="space-y-8">
          {steps.map(({ key, num, Icon, title, desc }, i) => {
            const isLast = num === 6
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
                className={`border-2 border-border rounded-sm p-8 ${isLast ? 'bg-foreground text-background border-foreground' : 'bg-card'}`}
              >
                <div className="flex items-start gap-6">
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-sm flex items-center justify-center text-2xl ${isLast ? 'bg-background text-foreground' : 'bg-foreground text-background'}`}
                  >
                    {num}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="w-6 h-6" />
                      <h2 className="text-2xl uppercase tracking-wide">{title}</h2>
                    </div>
                    <p className={isLast ? '' : 'text-foreground/80'}>{desc}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-muted border-2 border-border rounded-sm p-8"
          >
            <h2 className="text-2xl uppercase tracking-wide mb-6 text-center">
              {t('tips.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {tips.map(({ key, text }) => (
                <div key={key}>
                  <p className="text-muted-foreground text-sm">✓ {text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-2xl uppercase tracking-wide mb-4">{t('cta.shop')}</h2>
            <div className="flex gap-4 justify-center">
              <Link
                href="/products"
                className="inline-block bg-foreground text-background px-8 py-4 rounded-sm hover:opacity-90 transition-all uppercase tracking-wide"
              >
                {t('cta.shop')}
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-foreground px-8 py-4 rounded-sm hover:bg-foreground hover:text-background transition-all uppercase tracking-wide"
              >
                {t('cta.contact')}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  )
}
