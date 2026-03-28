'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { Package, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
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

export default function ReturnPolicyPage() {
  const t = useTranslations('returnPolicy')
  const tNav = useTranslations('nav')

  return (
    <PageContainer className="overflow-hidden">
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

        {/* Key Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-muted border-2 border-border rounded-sm p-6 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg uppercase tracking-wide mb-2">{t('highlights.days.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('highlights.days.desc')}</p>
          </div>
          <div className="bg-muted border-2 border-border rounded-sm p-6 text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg uppercase tracking-wide mb-2">
              {t('highlights.shipping.title')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('highlights.shipping.desc')}</p>
          </div>
          <div className="bg-muted border-2 border-border rounded-sm p-6 text-center">
            <Package className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg uppercase tracking-wide mb-2">
              {t('highlights.process.title')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('highlights.process.desc')}</p>
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 - Conditions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border-2 border-border rounded-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-success" />
              <h2 className="text-2xl uppercase tracking-wide">{t('conditions.title')}</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              {(['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const).map((key) => (
                <p key={key} className="flex items-start gap-2">
                  <span className="text-foreground mt-1">•</span>
                  <span>{t(`conditions.${key}`)}</span>
                </p>
              ))}
            </div>
          </motion.div>

          {/* Section 2 - Process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border-2 border-border rounded-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6" />
              <h2 className="text-2xl uppercase tracking-wide">{t('process.title')}</h2>
            </div>
            <div className="space-y-6">
              {(['step1', 'step2', 'step3'] as const).map((step, i) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-foreground text-background rounded-sm flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-2">{t(`process.${step}.title`)}</h3>
                    <p className="text-muted-foreground">{t(`process.${step}.desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section 3 - Exceptions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border-2 border-border rounded-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-destructive" />
              <h2 className="text-2xl uppercase tracking-wide">{t('exceptions.title')}</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              {(['e1', 'e2', 'e3', 'e4', 'e5'] as const).map((key) => (
                <p key={key} className="flex items-start gap-2">
                  <span className="text-foreground mt-1">•</span>
                  <span>{t(`exceptions.${key}`)}</span>
                </p>
              ))}
            </div>
          </motion.div>

          {/* Section 4 - Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-foreground text-background border-2 border-foreground rounded-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-2xl uppercase tracking-wide">{t('notes.title')}</h2>
            </div>
            <div className="space-y-3">
              {(['n1', 'n2', 'n3', 'n4'] as const).map((key) => (
                <p key={key} className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{t(`notes.${key}`)}</span>
                </p>
              ))}
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-muted border-2 border-border rounded-sm p-8 text-center"
          >
            <h2 className="text-2xl uppercase tracking-wide mb-4">{t('cta.request')}</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/return-request"
                className="bg-foreground text-background px-6 py-3 rounded-sm hover:opacity-90 transition-all uppercase tracking-wide"
              >
                {t('cta.request')}
              </Link>
              <Link
                href="/contact"
                className="border-2 border-foreground px-6 py-3 rounded-sm hover:bg-foreground hover:text-background transition-all uppercase tracking-wide"
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
