'use client'

import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext'
import { ProductCard } from '@/components/shared/ProductCard'
import { useTranslations } from 'next-intl'
import { History } from 'lucide-react'

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
      <h2 className="text-2xl mb-8 uppercase tracking-wide flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        {t('title')}
      </h2>
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
