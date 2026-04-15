'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { Mail, Phone, Clock, Send, Facebook, Instagram, MessageCircle } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from '@/i18n/Link'

export default function ContactPage() {
  const t = useTranslations('contact')
  const tNav = useTranslations('nav')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    subject: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'general',
        subject: '',
        message: '',
      })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <PageContainer className="overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
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
        <div className="text-center mb-12">
          <h1 className="text-4xl uppercase tracking-wide mb-4">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="bg-muted border border-border rounded-sm p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">{t('form.title')}</h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl mb-2">{t('form.successTitle')}</h3>
                  <p className="text-muted-foreground">{t('form.successDesc')}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">
                      {t('form.namePlaceholder')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder={t('form.namePlaceholder')}
                      className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm uppercase tracking-wide mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder={t('form.emailPlaceholder')}
                        className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm uppercase tracking-wide mb-2">
                        {t('info.phoneLabel')}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t('form.phonePlaceholder')}
                        className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">
                      {t('form.categoryLabel')} *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                    >
                      <option value="general">{t('form.categoryDefault')}</option>
                      <option value="order">{t('form.categoryOrder')}</option>
                      <option value="product">{t('form.categoryProduct')}</option>
                      <option value="return">{t('form.categoryReturn')}</option>
                      <option value="partnership">{t('form.categoryOther')}</option>
                      <option value="other">{t('form.categoryOther')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">
                      {t('form.categoryShipping')} *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder={t('form.messagePlaceholder')}
                      className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-wide mb-2">
                      {t('form.messagePlaceholder')} *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      placeholder={t('form.messagePlaceholder')}
                      className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground transition-colors resize-none bg-background text-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-foreground text-background py-4 rounded-sm hover:opacity-90 transition-colors uppercase tracking-wide flex items-center justify-center gap-2 disabled:bg-muted disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        <span>{t('form.submitting')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>{t('form.submit')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-muted border border-border rounded-sm p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">{t('info.title')}</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-foreground text-background rounded-sm flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">{t('info.phoneLabel')}</h3>
                    <a
                      href="tel:+84877749777"
                      className="text-foreground hover:underline"
                    >
                      {t('info.phoneValue')}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-foreground text-background rounded-sm flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">{t('info.emailLabel')}</h3>
                    <a
                      href="mailto:contact@thewhite.cool"
                      className="text-foreground hover:underline"
                    >
                      {t('info.emailValue')}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-foreground text-background rounded-sm flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="uppercase tracking-wide mb-1">{t('info.hoursLabel')}</h3>
                    <p className="text-foreground">{t('info.hoursValue')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-foreground text-background rounded-sm p-8">
              <h2 className="text-2xl uppercase tracking-wide mb-6">{t('social.title')}</h2>
              <div className="space-y-4">
                <a
                  href="https://www.facebook.com/thewhite.cool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-background/10 rounded-sm hover:bg-background/20 transition-colors"
                >
                  <Facebook className="w-6 h-6" />
                  <div>
                    <p className="uppercase tracking-wide">Facebook</p>
                    <p className="text-sm opacity-60">@thewhite.cool</p>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/thewhite.cool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-background/10 rounded-sm hover:bg-background/20 transition-colors"
                >
                  <Instagram className="w-6 h-6" />
                  <div>
                    <p className="uppercase tracking-wide">Instagram</p>
                    <p className="text-sm opacity-60">@thewhite.cool</p>
                  </div>
                </a>

                <a
                  href="https://zalo.me/84877749777"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-background/10 rounded-sm hover:bg-background/20 transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                  <div>
                    <p className="uppercase tracking-wide">Zalo Official</p>
                    <p className="text-sm opacity-60">+84 877 749 777</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-muted border border-border rounded-sm p-8">
              <h3 className="uppercase tracking-wide mb-4">{t('quickLinks.title')}</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/faq"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  → {t('quickLinks.faq')}
                </Link>
                <Link
                  href="/return-policy"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  → {t('quickLinks.returnPolicy')}
                </Link>
                <Link
                  href="/size-guide"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  → {t('quickLinks.sizeGuide')}
                </Link>
                <Link
                  href="/orders"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  → {t('quickLinks.faq')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
