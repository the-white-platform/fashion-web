'use client'

import { ProductCard } from '@/components/shared/ProductCard'
import { motion } from 'motion/react'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { ProductForFrontend } from '@/utilities/getProducts'
import { useWishlist } from '@/contexts/WishlistContext'

interface QuickFilter {
  id: string
  label: string
  filterType: 'all' | 'category' | 'tag'
  categoryId?: number
  tagFilter?: 'sale' | 'new' | 'bestseller' | 'hot'
}

interface FeaturedProductsProps {
  products?: ProductForFrontend[]
  quickFilters?: QuickFilter[]
  onProductClick?: (product: ProductForFrontend) => void
  onViewAll?: () => void
}

export function FeaturedProducts({
  products,
  quickFilters,
  onProductClick,
  onViewAll,
}: FeaturedProductsProps) {
  const t = useTranslations()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [activeFilterId, setActiveFilterId] = useState<string>('')

  // CMS-only: if the admin hasn't flagged any product as `featured` or
  // configured quick filters, the whole section hides. No Unsplash
  // demo products, no "Tất Cả" placeholder — the admin sees exactly
  // what is configured.
  const baseProducts = products ?? []
  const filters = quickFilters ?? []

  if (baseProducts.length === 0) return null

  // Set initial active filter on first render
  const initialFilterId = filters[0]?.id || 'all'
  if (activeFilterId === '' && filters.length > 0) {
    setActiveFilterId(initialFilterId)
  }

  // Get the current active filter
  const activeFilter = filters.find((f) => f.id === activeFilterId) || filters[0]

  // Apply filtering. Ordering comes from the server (product id desc, i.e.
  // newest first) and is intentional — no client-side sort UI: the featured
  // block is a curated hero, not a shoppable index.
  const displayProducts = useMemo(() => {
    let filtered = [...baseProducts]

    // Apply filter based on filter type
    if (activeFilter && activeFilter.filterType !== 'all') {
      filtered = filtered.filter((product) => {
        switch (activeFilter.filterType) {
          case 'category':
            // Filter by category name (check if product belongs to category)
            return (
              activeFilter.label &&
              (product.categories
                ? product.categories.includes(activeFilter.label)
                : product.category === activeFilter.label)
            )
          case 'tag':
            // Filter by tag code. Tag is now a relation to `product-tags`
            // whose stable identifier is the `code` field (e.g. 'new',
            // 'bestseller', 'sale-20', 'hot'). Sale matches any code
            // starting with 'sale-'.
            switch (activeFilter.tagFilter) {
              case 'sale':
                return product.tag.startsWith('sale-')
              case 'new':
                return product.tag === 'new'
              case 'bestseller':
                return product.tag === 'bestseller'
              case 'hot':
                return product.tag === 'hot'
              default:
                return true
            }
          default:
            return true
        }
      })
    }

    // Trim to the largest multiple of 4 (desktop) / 2 (mobile) so the
    // last row is always complete. An orphan row with 1-2 cards next to
    // empty columns looks broken. On lg the grid is 4 cols, so we floor
    // to a multiple of 4; below lg it's 2 cols and any multiple of 4 is
    // also a multiple of 2, so this single cap works for both. If fewer
    // than 4 products are featured, show whatever is there rather than
    // zero.
    const GRID_COLS_DESKTOP = 4
    if (filtered.length >= GRID_COLS_DESKTOP) {
      const complete = Math.floor(filtered.length / GRID_COLS_DESKTOP) * GRID_COLS_DESKTOP
      return filtered.slice(0, complete)
    }

    return filtered
  }, [baseProducts, activeFilter])

  return (
    <section className="py-20 bg-transparent text-foreground">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-6xl uppercase mb-2 font-heading font-bold tracking-tight"
            >
              {t('products.title')}
            </motion.h2>
            <p className="text-muted-foreground font-normal tracking-wide text-lg">
              {t('products.subtitle')}
            </p>
          </div>
        </div>

        {/* Filters - CMS Configurable */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilterId(filter.id)}
                className={`px-5 py-2 border rounded-sm transition-all hover:bg-primary hover:text-primary-foreground uppercase text-sm font-medium tracking-wider ${
                  activeFilterId === filter.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {displayProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onQuickView={onProductClick}
                showWishlist
                isWishlisted={isWishlisted(product.id)}
                onWishlistToggle={toggleWishlist}
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">{t('products.noResults')}</p>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <button
            className="bg-primary text-primary-foreground border-2 border-primary px-10 py-4 rounded-sm hover:bg-background hover:text-foreground transition-all uppercase tracking-wide font-bold text-sm"
            onClick={onViewAll}
          >
            {t('products.viewAll')}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
