'use client'

import { motion } from 'motion/react'
import { Sparkles, Upload, User, Ruler, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'

export function VirtualTryOnDemo() {
  const t = useTranslations('virtualTryOnDemo')
  const router = useRouter()

  return (
    <section className="py-20 text-foreground">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm tracking-widest">{t('badge')}</span>
          </div>
          <h2 className="text-4xl lg:text-5xl uppercase mb-4">{t('title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('description')}</p>
        </motion.div>

        {/* How It Works - 3 Steps */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-card border-2 border-border rounded-sm p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-sm flex items-center justify-center shrink-0">
                    <span className="text-lg">1</span>
                  </div>
                  <h3 className="text-lg uppercase tracking-wide">{t('steps.1.title')}</h3>
                </div>

                {/* Mock Product Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="aspect-square bg-muted rounded-sm relative overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200"
                      alt="Product"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <div className="aspect-square bg-muted rounded-sm relative overflow-hidden border-2 border-primary">
                    <Image
                      src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=200"
                      alt="Product"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{t('steps.1.description')}</p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-card border-2 border-border rounded-sm p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-sm flex items-center justify-center shrink-0">
                    <span className="text-lg">2</span>
                  </div>
                  <h3 className="text-lg uppercase tracking-wide">{t('steps.2.title')}</h3>
                </div>

                {/* Mock Upload */}
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-sm p-4 mb-3 flex flex-col items-center">
                  <User className="w-10 h-10 text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {t('steps.2.uploadText')}
                  </p>
                </div>

                {/* Mock Inputs */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="border-2 border-border rounded-sm p-2 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">170 cm</span>
                  </div>
                  <div className="border-2 border-border rounded-sm p-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">65 kg</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{t('steps.2.description')}</p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-card border-2 border-border rounded-sm p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-sm flex items-center justify-center shrink-0">
                    <span className="text-lg">3</span>
                  </div>
                  <h3 className="text-lg uppercase tracking-wide">{t('steps.3.title')}</h3>
                </div>

                {/* Mock Result */}
                <div className="bg-muted/50 rounded-sm aspect-square mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-muted-foreground/50 animate-pulse" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{t('steps.3.description')}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-primary text-primary-foreground rounded-sm p-12 max-w-4xl mx-auto"
        >
          <Sparkles className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-3xl uppercase mb-4">{t('cta.title')}</h3>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">{t('cta.description')}</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-background text-foreground px-8 py-4 rounded-sm hover:bg-background/90 transition-all hover:scale-105 uppercase tracking-wide font-bold"
          >
            {t('cta.button')}
          </button>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto"
        >
          <div className="bg-card border border-border rounded-sm p-6 text-center">
            <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-primary-foreground" />
            </div>
            <h4 className="uppercase tracking-wide mb-2">{t('features.upload.title')}</h4>
            <p className="text-sm text-muted-foreground">{t('features.upload.description')}</p>
          </div>

          <div className="bg-card border border-border rounded-sm p-6 text-center">
            <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h4 className="uppercase tracking-wide mb-2">{t('features.ai.title')}</h4>
            <p className="text-sm text-muted-foreground">{t('features.ai.description')}</p>
          </div>

          <div className="bg-card border border-border rounded-sm p-6 text-center">
            <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <h4 className="uppercase tracking-wide mb-2">{t('features.personal.title')}</h4>
            <p className="text-sm text-muted-foreground">{t('features.personal.description')}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
