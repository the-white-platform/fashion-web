'use client'

import { motion } from 'motion/react'
import { Sparkles, Upload, User } from 'lucide-react'
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

                {/* Mock single product card — only one at a time */}
                <div className="aspect-square bg-muted rounded-sm relative overflow-hidden border-2 border-primary mb-3">
                  <Image
                    src="/demo/step1-product.jpg"
                    alt="TheWhite tank top"
                    fill
                    className="object-cover"
                    sizes="400px"
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

                {/* Mock Upload — preview the kind of photo we need (full-body TheWhite shot) */}
                <div className="relative aspect-square rounded-sm overflow-hidden mb-3 border-2 border-dashed border-muted-foreground/30">
                  <Image
                    src="/demo/step2-upload.jpg"
                    alt="Sample full-body upload"
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center text-center p-4">
                    <User className="w-10 h-10 text-foreground mb-2" />
                    <p className="text-xs text-foreground text-center font-semibold">
                      {t('steps.2.uploadText')}
                    </p>
                    <p className="text-[10px] text-foreground/80 text-center mt-2 max-w-[220px]">
                      {t('steps.2.onePhotoHint')}
                    </p>
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

                {/* Mock Result — real generated-style TheWhite editorial shot */}
                <div className="relative aspect-square rounded-sm overflow-hidden mb-3 border-2 border-primary">
                  <Image
                    src="/demo/step3-result.jpg"
                    alt="AI virtual try-on result"
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">AI</span>
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
