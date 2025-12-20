'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, MessageCircle, Cookie } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const carouselSlides = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=3270&auto=format&fit=crop',
    title: 'HST MÙA ĐÔNG<br/>2024',
    subtitle: 'Sức mạnh trong từng bước chân',
    cta: 'KHÁM PHÁ NGAY',
    link: '/products',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1572565408388-cdd3afe23e82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920',
    title: 'PERFORMANCE<br/>PRO',
    subtitle: 'Công nghệ tiên tiến cho hiệu suất tối đa',
    cta: 'XEM SẢN PHẨM',
    link: '/products',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1625515922308-56dcaa45351c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920',
    title: 'STYLE<br/>& COMFORT',
    subtitle: 'Kết hợp hoàn hảo giữa thời trang và sự thoải mái',
    cta: 'MUA NGAY',
    link: '/products',
  },
]

export function Carousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 })
  const [selectedIndex, setSelectedIndex] = useState(0)

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
    <section className="relative bg-black text-white -mt-24">
      <div className="relative h-screen overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {carouselSlides.map((slide) => (
            <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative h-full">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={slide.image}
                    alt="Slider Image"
                    fill
                    className="object-cover"
                    priority={slide.id === 1}
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
                        THEWHITE COLLECTION
                      </div>
                      <h2
                        className="text-6xl lg:text-9xl uppercase leading-[0.9] mb-8 font-heading font-bold tracking-tight"
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                      />
                      <p className="text-xl lg:text-2xl text-white mb-10 font-medium tracking-wide max-w-2xl text-shadow-sm">
                        {slide.subtitle}
                      </p>
                      <Button
                        size="lg"
                        className="bg-white text-black hover:bg-gray-200 rounded-sm px-8 py-4 text-sm tracking-wide font-bold transition-all hover:scale-105 uppercase"
                        asChild
                      >
                        <Link href={slide.link}>{slide.cta}</Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm text-white p-3 rounded-sm hover:bg-white/20 transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm text-white p-3 rounded-sm hover:bg-white/20 transition-all hover:scale-110"
        aria-label="Next slide"
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
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
