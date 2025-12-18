'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const carouselSlides = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1758875568971-7388ba15012b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920',
    title: 'Bộ Sưu Tập Mùa Đông 2024',
    subtitle: 'Khám phá phong cách thể thao hiện đại với thiết kế đột phá',
    cta: 'Khám Phá Ngay',
    link: '/products',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1572565408388-cdd3afe23e82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920',
    title: 'Performance Pro',
    subtitle: 'Công nghệ tiên tiến cho hiệu suất tối đa trong mọi hoạt động',
    cta: 'Xem Sản Phẩm',
    link: '/products',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1625515922308-56dcaa45351c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920',
    title: 'Style & Comfort',
    subtitle: 'Kết hợp hoàn hảo giữa thời trang và sự thoải mái',
    cta: 'Mua Ngay',
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
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={slide.id === 1}
                    sizes="100vw"
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex items-center">
                  <div className="container mx-auto px-6">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="max-w-2xl"
                    >
                      <div className="mb-6 inline-block bg-white text-black px-4 py-2 text-sm tracking-widest rounded-sm">
                        THEWHITE COLLECTION
                      </div>
                      <h2 className="text-5xl lg:text-7xl uppercase leading-tight mb-6 font-bold">
                        {slide.title}
                      </h2>
                      <p className="text-xl lg:text-2xl text-gray-300 mb-8">{slide.subtitle}</p>
                      <Button size="lg" asChild>
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
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm text-white p-3 rounded-sm hover:bg-white/20 transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm text-white p-3 rounded-sm hover:bg-white/20 transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="flex items-center justify-center gap-2">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1 rounded-sm transition-all ${
                index === selectedIndex ? 'w-12 bg-white' : 'w-12 bg-white/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
