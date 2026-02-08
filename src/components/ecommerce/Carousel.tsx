'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, MessageCircle, Cookie } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface CarouselSlide {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  backgroundImage?: any
}

interface CarouselProps {
  slides?: CarouselSlide[]
}

export function Carousel({ slides: cmsSlides }: CarouselProps = {}) {
  const t = useTranslations('carousel')
  const tCommon = useTranslations('common')
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 })
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Default slides (fallback if no CMS slides provided)
  const defaultSlides = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=3270&auto=format&fit=crop',
      titleKey: 'slides.winter2024.title',
      subtitleKey: 'slides.winter2024.subtitle',
      ctaKey: 'slides.winter2024.cta',
      link: '/products',
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1572565408388-cdd3afe23e82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920',
      titleKey: 'slides.performancePro.title',
      subtitleKey: 'slides.performancePro.subtitle',
      ctaKey: 'slides.performancePro.cta',
      link: '/products',
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1625515922308-56dcaa45351c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920',
      titleKey: 'slides.styleComfort.title',
      subtitleKey: 'slides.styleComfort.subtitle',
      ctaKey: 'slides.styleComfort.cta',
      link: '/products',
    },
  ]

  // Use CMS slides if available and has items, otherwise use default
  const useCmsSlides = cmsSlides && cmsSlides.length > 0
  const carouselSlides = useCmsSlides ? cmsSlides : defaultSlides

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    // Auto-play
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)

    return () => {
      emblaApi.off('select', onSelect)
      clearInterval(interval)
    }
  }, [emblaApi, onSelect])

  return (
    <section className="relative text-foreground">
      <div className="relative h-screen overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {carouselSlides.map((slide, index) => {
            // Check if this is a CMS slide or default slide
            const isCmsSlide = useCmsSlides
            const slideImage = isCmsSlide
              ? (slide as any).backgroundImage?.url ||
                'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=3270&auto=format&fit=crop'
              : (slide as any).image
            const slideTitle =
              (isCmsSlide ? (slide as any).title : t((slide as any).titleKey)) || ''
            const slideSubtitle =
              (isCmsSlide ? (slide as any).subtitle : t((slide as any).subtitleKey)) || ''
            const slideCta = (isCmsSlide ? (slide as any).ctaText : t((slide as any).ctaKey)) || ''
            const slideLink = (isCmsSlide ? (slide as any).ctaLink : (slide as any).link) || '#'

            return (
              <div
                key={isCmsSlide ? index : (slide as any).id}
                className="relative min-w-0 flex-[0_0_100%]"
              >
                <div className="relative h-full">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={slideImage}
                      alt="Slider Image"
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="100vw"
                    />
                    {/* Dark Overlay - Higher opacity for better text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex items-center">
                    <div className="container mx-auto px-6">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                      >
                        <div className="mb-6 inline-block bg-white text-black px-4 py-2 text-sm tracking-widest rounded-sm">
                          {tCommon('collection')}
                        </div>
                        <h2
                          className="text-6xl lg:text-9xl uppercase leading-[0.9] mb-8 font-heading font-bold tracking-tight text-white"
                          dangerouslySetInnerHTML={{ __html: slideTitle }}
                        />
                        <p className="text-xl lg:text-2xl text-white mb-10 font-medium tracking-wide max-w-2xl text-shadow-sm">
                          {slideSubtitle}
                        </p>
                        <Button
                          size="lg"
                          className="bg-white text-black hover:bg-gray-200 rounded-sm px-8 py-4 text-sm tracking-wide font-bold transition-all hover:scale-105 uppercase"
                          asChild
                        >
                          <Link href={slideLink}>{slideCta}</Link>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm text-white p-3 rounded-sm hover:bg-white/20 transition-all hover:scale-110"
        aria-label={t('previousSlide')}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm text-white p-3 rounded-sm hover:bg-white/20 transition-all hover:scale-110"
        aria-label={t('nextSlide')}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-12 left-0 right-0 z-20">
        <div className="flex items-center justify-center gap-2">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1 rounded-sm transition-all duration-300 ${
                index === selectedIndex ? 'w-12 bg-white' : 'w-12 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`${t('goToSlide')} ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
