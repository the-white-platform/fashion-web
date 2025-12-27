'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function BrandStory() {
  const t = useTranslations('brandStory')

  return (
    <section className="py-20 bg-transparent text-foreground">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[500px] lg:h-[600px]"
          >
            <div className="absolute inset-0 bg-muted rounded-sm overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
                alt="TheWhite Brand Story"
                fill
                className="object-cover hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-8 left-8 right-8 bg-card text-card-foreground p-6 shadow-lg rounded-sm border border-border"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-1 font-bold">2024</div>
                  <div className="text-sm text-muted-foreground">{t('stats.founded')}</div>
                </div>
                <div className="border-l border-r border-border">
                  <div className="text-2xl mb-1 font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">{t('stats.vietnam')}</div>
                </div>
                <div>
                  <div className="text-2xl mb-1 font-bold">∞</div>
                  <div className="text-sm text-muted-foreground">{t('stats.passion')}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl lg:text-5xl uppercase leading-tight font-bold">{t('title')}</h2>

            <div className="space-y-4 text-muted-foreground">
              <p>{t('desc1')}</p>
              <p>{t('desc2')}</p>
              <p>{t('desc3')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/products"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-none hover:bg-primary/90 transition-all hover:scale-105 uppercase tracking-widest font-bold text-sm text-center shadow-lg"
              >
                {t('cta.explore')}
              </Link>
              <Link
                href="/contact"
                className="border-2 border-primary px-8 py-4 rounded-none hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105 uppercase tracking-widest font-bold text-sm text-center"
              >
                {t('cta.story')}
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-lg mb-2">✓ {t('feature.material')}</div>
                <div className="text-sm text-muted-foreground">{t('feature.materialDesc')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-lg mb-2">✓ {t('feature.design')}</div>
                <div className="text-sm text-muted-foreground">{t('feature.designDesc')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-lg mb-2">✓ {t('feature.durable')}</div>
                <div className="text-sm text-muted-foreground">{t('feature.durableDesc')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-lg mb-2">✓ {t('feature.origin')}</div>
                <div className="text-sm text-muted-foreground">{t('feature.originDesc')}</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
