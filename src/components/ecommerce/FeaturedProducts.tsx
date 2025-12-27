'use client'

import { Heart } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface Product {
  id: number
  name: string
  category: string
  price: string
  priceNumber: number
  image: string
  tag: string
}

const products: Product[] = [
  {
    id: 1,
    name: 'Áo Training Performance',
    category: 'Áo Thể Thao',
    price: '890.000₫',
    priceNumber: 890000,
    image:
      'https://images.unsplash.com/photo-1679768763201-e07480531b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHNwb3J0c3dlYXJ8ZW58MXx8fHwxNzY1OTE2NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tag: 'MỚI',
  },
  {
    id: 2,
    name: 'Giày Chạy Bộ Elite',
    category: 'Giày Thể Thao',
    price: '1.890.000₫',
    priceNumber: 1890000,
    image:
      'https://images.unsplash.com/photo-1619253341026-74c609e6ce50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBzcG9ydHN8ZW58MXx8fHwxNzY1OTE2NzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tag: 'BÁN CHẠY',
  },
  {
    id: 3,
    name: 'Set Tập Gym Premium',
    category: 'Bộ Tập Luyện',
    price: '1.590.000₫',
    priceNumber: 1590000,
    image:
      'https://images.unsplash.com/photo-1734191979156-57972139dfee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd2VhciUyMG1vZGVsfGVufDF8fHx8MTc2NTkxNjc0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tag: 'GIẢM 20%',
  },
  {
    id: 4,
    name: 'Quần Short Training',
    category: 'Quần Thể Thao',
    price: '690.000₫',
    priceNumber: 690000,
    image:
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NjU4OTUyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tag: 'MỚI',
  },
]

interface FeaturedProductsProps {
  onProductClick?: (product: Product) => void
  onViewAll?: () => void
}

export function FeaturedProducts({ onProductClick, onViewAll }: FeaturedProductsProps) {
  const t = useTranslations()
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSort, setActiveSort] = useState('newest')

  const filters = [
    { key: 'all', label: t('common.all') },
    { key: 'men', label: t('nav.men') },
    { key: 'women', label: t('nav.women') },
    { key: 'accessories', label: t('products.accessories') },
    { key: 'sale', label: t('products.sale') },
  ]

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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-between items-start sm:items-center">
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-5 py-2 border rounded-sm transition-all hover:bg-primary hover:text-primary-foreground uppercase text-sm font-medium tracking-wider ${
                  activeFilter === filter.key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
            className="px-4 py-2 border border-border rounded-sm bg-background text-sm font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
          >
            {sorts.map((sort) => (
              <option key={sort.key} value={sort.key}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {products.map((product, index) => (
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
