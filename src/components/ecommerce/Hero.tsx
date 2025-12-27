'use client'

import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

export function Hero() {
  const t = useTranslations('hero')

  return (
    <section className="relative min-h-screen bg-background text-foreground pt-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 lg:space-y-8 relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block bg-primary text-primary-foreground px-4 py-2 tracking-widest rounded-sm text-xs lg:text-sm font-medium"
            >
              {t('subtitle')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-7xl uppercase leading-tight font-black"
            >
              {t.rich('title', {
                br: () => <br />,
                span: (chunks) => <span className="text-muted-foreground">{chunks}</span>,
              })}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base lg:text-lg text-muted-foreground max-w-md"
            >
              {t('description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/products"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-sm hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center gap-2 group uppercase tracking-wide font-bold text-sm"
              >
                {t('cta')}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="border-2 border-primary px-8 py-4 rounded-sm hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105 uppercase tracking-wide font-bold text-sm">
                {t('lookbook')}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-8 pt-4 border-t border-border mt-8"
            >
              <div>
                <div className="text-2xl lg:text-3xl font-bold">500+</div>
                <div className="text-xs lg:text-sm text-muted-foreground uppercase tracking-wide">
                  {t('stats.products')}
                </div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold">50K+</div>
                <div className="text-xs lg:text-sm text-muted-foreground uppercase tracking-wide">
                  {t('stats.customers')}
                </div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold">4.9★</div>
                <div className="text-xs lg:text-sm text-muted-foreground uppercase tracking-wide">
                  {t('stats.rating')}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Images */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative h-[400px] sm:h-[500px] lg:h-[700px] mt-8 lg:mt-0"
          >
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute top-0 right-0 w-[75%] h-[70%] overflow-hidden shadow-2xl rounded-sm z-10"
            >
              <Image
                src="https://images.unsplash.com/photo-1734191979156-57972139dfee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd2VhciUyMG1vZGVsfGVufDF8fHx8MTc2NTkxNjc0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Sportswear model"
                fill
                className="object-cover hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 1024px) 75vw, 600px"
              />
            </motion.div>

            {/* Secondary Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-0 left-0 w-[60%] h-[50%] overflow-hidden shadow-2xl rounded-sm z-20"
            >
              <Image
                src="https://images.unsplash.com/photo-1679768763201-e07480531b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHNwb3J0c3dlYXJ8ZW58MXx8fHwxNzY1OTE2NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Athletic wear"
                fill
                className="object-cover hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 1024px) 60vw, 400px"
              />
            </motion.div>

            {/* Accent Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className="absolute top-[35%] left-[20%] lg:left-[25%] bg-card text-card-foreground px-4 py-3 lg:px-6 lg:py-4 shadow-xl rounded-sm z-30 border border-border"
            >
              <div className="text-xs text-muted-foreground font-bold tracking-wider mb-1">
                {t('discount.upto')}
              </div>
              <div className="text-2xl lg:text-4xl font-black">{t('discount.value')}</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
