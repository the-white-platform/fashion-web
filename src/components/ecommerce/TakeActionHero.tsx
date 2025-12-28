'use client'

import React from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export function TakeActionHero() {
  const router = useRouter()
  const t = useTranslations('takeAction')

  const handleExplore = () => {
    router.push('/products')
  }

  return (
    <section className="relative h-screen flex items-center justify-center bg-background text-foreground overflow-hidden py-20">
      {/* Background subtle gradient - uses theme colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background opacity-50" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Claw Logo - Static SVG, Large, Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 mb-8"
          >
            <Image
              src="/logo/claw.svg"
              alt="The White Claw Logo"
              width={224}
              height={224}
              className="w-full h-full dark:invert"
              priority
            />
          </motion.div>

          {/* THE WHITE - Brand Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.2em] font-white mb-6 text-foreground"
          >
            THE WHITE
          </motion.h1>

          {/* TAKE ACTION - Slogan */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="text-2xl md:text-3xl lg:text-4xl tracking-[0.3em] text-muted-foreground font-light font-white mb-16"
          >
            TAKE ACTION
          </motion.h2>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button
              onClick={handleExplore}
              className="group bg-foreground text-background px-10 py-4 hover:bg-foreground/90 transition-all uppercase tracking-[0.15em] font-medium text-sm flex items-center gap-3 hover:scale-105"
            >
              <span>{t('cta.explore')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleExplore}
              className="group border border-border text-foreground px-10 py-4 hover:bg-foreground hover:text-background transition-all uppercase tracking-[0.15em] font-medium text-sm flex items-center gap-3 hover:scale-105"
            >
              <span>{t('cta.collection')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-20"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {t('scroll')}
              </span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-6 h-10 border border-border rounded-full flex items-start justify-center p-2"
              >
                <motion.div className="w-1 h-2 bg-muted-foreground rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative star element (bottom right as in image) */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-8 right-8"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" className="fill-foreground">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </motion.div>
    </section>
  )
}
