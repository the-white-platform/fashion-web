'use client'

import { FileText, ShoppingBag, AlertTriangle, Scale, UserX, RefreshCw } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from '@/i18n/Link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useTranslations, useLocale } from 'next-intl'

export default function TermsOfUsePage() {
  const t = useTranslations('termsOfUse')
  const tNav = useTranslations('nav')
  const locale = useLocale()
  const isEn = locale === 'en'

  const sections = [
    {
      icon: FileText,
      title: t('sections.acceptance.title'),
      content: t('sections.acceptance.content'),
    },
    {
      icon: UserX,
      title: t('sections.account.title'),
      content: t('sections.account.content'),
    },
    {
      icon: ShoppingBag,
      title: t('sections.orders.title'),
      content: t('sections.orders.content'),
    },
    {
      icon: RefreshCw,
      title: t('sections.shipping.title'),
      content: t('sections.shipping.content'),
    },
    {
      icon: Scale,
      title: t('sections.intellectual.title'),
      content: t('sections.intellectual.content'),
    },
    {
      icon: AlertTriangle,
      title: t('sections.liability.title'),
      content: t('sections.liability.content'),
    },
  ]

  return (
    <div className="min-h-screen bg-background pt-32 pb-12 transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-4xl">
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
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary text-primary-foreground rounded-sm mb-6 shadow-lg">
            <Scale className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide text-foreground font-bold">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
          <p className="text-sm text-muted-foreground/60 mt-2">{t('effectiveDate')}</p>
        </motion.div>

        {/* Content */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card p-8 rounded-sm border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-sm flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl uppercase tracking-wide pt-2 text-foreground font-semibold">
                    {section.title}
                  </h2>
                </div>
                <div className="pl-16">
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-card p-8 rounded-sm border border-border mt-8 shadow-sm"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4 text-foreground font-semibold">
            {t('sections.prohibited.title')}
          </h2>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {t('sections.prohibited.content')}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-card p-8 rounded-sm border border-border mt-8 shadow-sm"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4 text-foreground font-semibold">
            {t('sections.links.title')}
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {t('sections.links.content')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-card p-8 rounded-sm border border-border mt-8 shadow-sm"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4 text-foreground font-semibold">
            {t('sections.dispute.title')}
          </h2>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {t('sections.dispute.content')}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-card p-8 rounded-sm border border-border mt-8 shadow-sm"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4 text-foreground font-semibold">
            {t('sections.severability.title')}
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {t('sections.severability.content')}
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="bg-primary text-primary-foreground p-8 rounded-sm mt-8 shadow-lg"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4 font-bold">{t('contact.title')}</h2>
          <p className="leading-relaxed mb-4 text-primary-foreground/90">
            {t('contact.description')}
          </p>
          <div className="space-y-2 bg-background/10 p-4 rounded-sm border border-primary-foreground/10">
            <p>
              <strong>{isEn ? 'Company' : 'Công ty'}:</strong> TheWhite Vietnam
            </p>
            <p>
              <strong>Email:</strong> legal@thewhite.vn
            </p>
            <p>
              <strong>Hotline:</strong> 0123 456 789
            </p>
            <p>
              <strong>{isEn ? 'Address' : 'Địa chỉ'}:</strong>{' '}
              {isEn ? 'District 1, Ho Chi Minh City, Vietnam' : 'Quận 1, TP. Hồ Chí Minh, Việt Nam'}
            </p>
          </div>
        </motion.div>

        {/* Acceptance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="bg-yellow-500/10 border-2 border-yellow-500/50 p-6 rounded-sm mt-8 text-foreground"
        >
          <p className="text-center">
            <strong className="uppercase tracking-wide text-yellow-600 dark:text-yellow-500">
              {t('agreement.label')}
            </strong>
            <br />
            {t('agreement.content')}
          </p>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-sm hover:bg-primary/90 transition-all uppercase tracking-wider font-bold shadow-md hover:shadow-lg hover:scale-105"
          >
            {tNav('backToHome') || t('breadcrumb')}
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
