'use client'

import { Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const { t } = useLanguage()
  const [activeFilter, setActiveFilter] = useState('common.all')
  const [activeSort, setActiveSort] = useState('common.newest')

  const filters = ['common.all', 'nav.men', 'nav.women', 'products.accessories', 'products.sale']
  const sorts = ['common.newest', 'common.priceAsc', 'common.priceDesc', 'common.popular']

  return (
    <section className="py-20 bg-transparent text-black">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl uppercase mb-2"
            >
              {t('products.title')}
            </motion.h2>
            <p className="text-gray-400">{t('products.subtitle')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 border rounded-sm transition-all hover:scale-105 uppercase text-sm ${
                  activeFilter === filter
                    ? 'bg-white text-black border-white'
                    : 'border-gray-600 hover:border-white'
                }`}
              >
                {t(filter)}
              </button>
            ))}
          </div>

          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
            className="w-full sm:w-auto bg-transparent border border-gray-600 px-4 py-2 pr-8 rounded-sm outline-none hover:border-white transition-colors appearance-none cursor-pointer uppercase text-sm"
          >
            {sorts.map((sort) => (
              <option key={sort} value={sort} className="bg-white text-black">
                {t(sort)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link
                href={`/products/${product.id}`}
                onClick={(e) => {
                  if (onProductClick) {
                    e.preventDefault()
                    onProductClick(product)
                  }
                }}
                className="block"
              >
                <div className="relative overflow-hidden bg-gray-900 mb-4 aspect-[3/4] rounded-sm">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Tag */}
                  <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-xs font-bold rounded-sm">
                    {product.tag}
                  </div>

                  {/* Wishlist Button - Hidden on mobile, shown on hover/touch */}
                  <button
                    className="absolute top-4 right-4 bg-white text-black p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // TODO: Add to wishlist
                    }}
                  >
                    <Heart className="w-5 h-5" />
                  </button>

                  {/* Quick Add - Hidden on mobile */}
                  <button
                    className="hidden lg:block absolute bottom-4 left-4 right-4 bg-white text-black py-3 text-center opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-200 rounded-sm font-medium"
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
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {product.category}
                  </div>
                  <h3 className="mb-2 font-medium group-hover:text-gray-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="font-bold">{product.price}</div>
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
          className="mt-12 text-center"
        >
          <button
            className="border-2 border-black px-8 py-3 rounded-sm hover:bg-black hover:text-white transition-all hover:scale-105 uppercase tracking-wide font-medium"
            onClick={onViewAll}
          >
            {t('products.viewAll')}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
