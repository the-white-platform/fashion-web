'use client'

import { Shield, Lock, Eye, UserCheck, FileText, Mail } from 'lucide-react'
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

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacyPolicy')
  const tNav = useTranslations('nav')
  const locale = useLocale()
  const isEn = locale === 'en'

  const sections = [
    {
      icon: Shield,
      title: t('sections.intro.title'),
      content: t('sections.intro.content'),
    },
    {
      icon: FileText,
      title: t('sections.collection.title'),
      content: t('sections.collection.content'),
    },
    {
      icon: UserCheck,
      title: t('sections.usage.title'),
      content: t('sections.usage.content'),
    },
    {
      icon: Lock,
      title: t('sections.security.title'),
      content: t('sections.security.content'),
    },
    {
      icon: Eye,
      title: t('sections.sharing.title'),
      content: t('sections.sharing.content'),
    },
    {
      icon: UserCheck,
      title: t('sections.rights.title'),
      content: t('sections.rights.content'),
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
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl mb-4 uppercase tracking-wide text-foreground font-bold">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
          <p className="text-sm text-muted-foreground/60 mt-2">{t('lastUpdated')}</p>
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
            {t('sections.international.title')}
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {t('sections.international.content')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-card p-8 rounded-sm border border-border mt-8 shadow-sm"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4 text-foreground font-semibold">
            {t('sections.children.title')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t('sections.children.content')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-card p-8 rounded-sm border border-border mt-8 shadow-sm"
        >
          <h2 className="text-2xl uppercase tracking-wide mb-4 text-foreground font-semibold">
            {t('sections.changes.title')}
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {t('sections.changes.content')}
          </p>
        </motion.div>

        {/* Contact DPO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-primary text-primary-foreground p-8 rounded-sm mt-8 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6" />
            <h2 className="text-2xl uppercase tracking-wide font-bold">{t('contact.title')}</h2>
          </div>
          <p className="leading-relaxed mb-4 text-primary-foreground/90">
            {t('contact.description')}
          </p>
          <div className="space-y-2 bg-background/10 p-4 rounded-sm border border-primary-foreground/10">
            <p>
              <strong>Email:</strong> privacy@thewhite.vn
            </p>
            <p>
              <strong>Hotline:</strong> 0123 456 789
            </p>
            <p>
              <strong>{isEn ? 'Address' : 'Địa chỉ'}:</strong> TheWhite Vietnam,{' '}
              {isEn ? 'District 1, Ho Chi Minh City' : 'Quận 1, TP. Hồ Chí Minh'}
            </p>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70">{t('contact.complaint')}</p>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-sm hover:bg-primary/90 transition-all uppercase tracking-wider font-bold shadow-md hover:shadow-lg hover:scale-105"
          >
            {tNav('backToHome')}
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
