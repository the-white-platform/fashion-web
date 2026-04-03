'use client'

import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext'
import { ProductCard } from '@/components/shared/ProductCard'
import { useTranslations } from 'next-intl'

interface RecentlyViewedProps {
  excludeId?: number
  maxItems?: number
}

export function RecentlyViewed({ excludeId, maxItems = 10 }: RecentlyViewedProps) {
  const { items } = useRecentlyViewed()
  const t = useTranslations('recentlyViewed')

  const displayItems = items.filter((p) => p.id !== excludeId).slice(0, maxItems)

  if (displayItems.length === 0) return null

  return (
    <section className="mt-20">
      <h2 className="text-2xl mb-8 uppercase">{t('title')}</h2>
      <div className="relative">
        <div
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          {displayItems.map((product, index) => (
            <div key={product.id} className="shrink-0 w-[220px] sm:w-[260px]">
              <ProductCard product={product} index={index} sizes="260px" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
