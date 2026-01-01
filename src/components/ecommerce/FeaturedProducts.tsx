'use client'

import { Heart, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { motion } from 'motion/react'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'

interface Product {
  id: number
  name: string
  category: string
  categoryId?: number
  categoryIds?: number[]
  price: string
  priceNumber: number
  image: string
  tag: string
}

interface QuickFilter {
  id: string
  label: string
  filterType: 'all' | 'category' | 'tag'
  categoryId?: number
  tagFilter?: 'sale' | 'new' | 'bestseller'
}

interface FeaturedProductsProps {
  products?: Product[]
  quickFilters?: QuickFilter[]
  onProductClick?: (product: Product) => void
  onViewAll?: () => void
}

// Default products fallback (shown if no products passed from server)
const defaultProducts: Product[] = [
  {
    id: 1,
    name: 'Áo Training Performance',
    category: 'Áo Thể Thao',
    price: '890.000₫',
    priceNumber: 890000,
    image:
      'https://images.unsplash.com/photo-1679768763201-e07480531b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    tag: 'MỚI',
  },
  {
    id: 2,
    name: 'Giày Chạy Bộ Elite',
    category: 'Giày Thể Thao',
    price: '1.890.000₫',
    priceNumber: 1890000,
    image:
      'https://images.unsplash.com/photo-1619253341026-74c609e6ce50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    tag: 'BÁN CHẠY',
  },
  {
    id: 3,
    name: 'Set Tập Gym Premium',
    category: 'Bộ Tập Luyện',
    price: '1.590.000₫',
    priceNumber: 1590000,
    image:
      'https://images.unsplash.com/photo-1734191979156-57972139dfee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    tag: 'GIẢM 20%',
  },
  {
    id: 4,
    name: 'Quần Short Training',
    category: 'Quần Thể Thao',
    price: '690.000₫',
    priceNumber: 690000,
    image:
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    tag: 'MỚI',
  },
]

// Default filters fallback
const defaultFilters: QuickFilter[] = [{ id: 'all', label: 'Tất Cả', filterType: 'all' }]

export function FeaturedProducts({
  products,
  quickFilters,
  onProductClick,
  onViewAll,
}: FeaturedProductsProps) {
  const t = useTranslations()
  const [activeFilterId, setActiveFilterId] = useState<string>('')
  const [activeSort, setActiveSort] = useState('newest')

  // Use passed products/filters if available, otherwise use fallback
  const baseProducts = products && products.length > 0 ? products : defaultProducts
  const filters = quickFilters && quickFilters.length > 0 ? quickFilters : defaultFilters

  // Set initial active filter on first render
  const initialFilterId = filters[0]?.id || 'all'
  if (activeFilterId === '' && filters.length > 0) {
    setActiveFilterId(initialFilterId)
  }

  // Get the current active filter
  const activeFilter = filters.find((f) => f.id === activeFilterId) || filters[0]

  // Apply filtering and sorting
  const displayProducts = useMemo(() => {
    let filtered = [...baseProducts]

    // Apply filter based on filter type
    if (activeFilter && activeFilter.filterType !== 'all') {
      filtered = filtered.filter((product) => {
        switch (activeFilter.filterType) {
          case 'category':
            // Filter by category ID (check if product belongs to category)
            return (
              activeFilter.categoryId &&
              (product.categoryIds
                ? product.categoryIds.includes(activeFilter.categoryId)
                : product.categoryId === activeFilter.categoryId)
            )
          case 'tag':
            // Filter by tag
            const tagLower = product.tag.toLowerCase()
            switch (activeFilter.tagFilter) {
              case 'sale':
                return (
                  tagLower.includes('giảm') || tagLower.includes('sale') || tagLower.includes('%')
                )
              case 'new':
                return tagLower.includes('mới') || tagLower.includes('new')
              case 'bestseller':
                return tagLower.includes('bán chạy') || tagLower.includes('best')
              default:
                return true
            }
          default:
            return true
        }
      })
    }

    // Apply sorting
    switch (activeSort) {
      case 'priceAsc':
        filtered.sort((a, b) => a.priceNumber - b.priceNumber)
        break
      case 'priceDesc':
        filtered.sort((a, b) => b.priceNumber - a.priceNumber)
        break
      case 'popular':
        filtered.sort((a, b) => {
          const tagOrder: { [key: string]: number } = { 'BÁN CHẠY': 0, MỚI: 1 }
          const aOrder = tagOrder[a.tag] ?? 2
          const bOrder = tagOrder[b.tag] ?? 2
          return aOrder - bOrder
        })
        break
      case 'newest':
      default:
        filtered.sort((a, b) => b.id - a.id)
        break
    }

    return filtered
  }, [baseProducts, activeFilter, activeSort])

  const sorts = [
    { key: 'newest', label: t('filter.sort.newest') },
    { key: 'priceAsc', label: t('filter.sort.priceAsc') },
    { key: 'priceDesc', label: t('filter.sort.priceDesc') },
    { key: 'popular', label: t('filter.sort.popular') },
  ]

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
        <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-between items-start sm:items-center">
          <div className="flex gap-2 flex-wrap">
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

          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="px-4 py-2 pr-10 border border-border rounded-sm bg-background text-sm font-medium uppercase tracking-wider focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              {sorts.map((sort) => (
                <option key={sort.key} value={sort.key}>
                  {sort.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Products Grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative overflow-hidden bg-muted mb-4 aspect-[3/4] rounded-sm shadow-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Tag */}
                    <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      {product.tag}
                    </div>

                    {/* Wishlist Button - Always visible on mobile, hover on desktop */}
                    <button
                      className="absolute top-3 right-3 bg-background text-foreground p-2 rounded-full lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:scale-110 shadow-md"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        // TODO: Add to wishlist
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </button>

                    {/* Quick View Button - Always visible on mobile, slide up on desktop hover */}
                    <button
                      className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground py-3 lg:py-4 text-center lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 uppercase text-xs lg:text-sm font-bold tracking-widest hover:bg-background hover:text-foreground"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (onProductClick) {
                          onProductClick(product)
                        }
                      }}
                    >
                      {t('products.quickView')}
                    </button>
                  </div>

                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-[0.2em] font-medium">
                      {product.category}
                    </div>
                    <h3 className="mb-1 text-lg uppercase font-semibold group-hover:text-muted-foreground transition-colors line-clamp-1 leading-none">
                      {product.name}
                    </h3>
                    <div className="font-bold text-foreground">{product.price}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Không tìm thấy sản phẩm phù hợp</p>
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
