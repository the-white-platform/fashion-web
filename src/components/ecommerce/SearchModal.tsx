'use client'

import { X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const popularSearches = [
  'Áo thun nam',
  'Giày chạy bộ',
  'Quần yoga',
  'Áo khoác thể thao',
  'Giày training',
]

const recentProducts = [
  {
    id: 1,
    name: 'Áo Training Performance',
    price: '890.000₫',
    image:
      'https://images.unsplash.com/photo-1679768763201-e07480531b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
  },
  {
    id: 2,
    name: 'Giày Chạy Bộ Elite',
    price: '1.890.000₫',
    image:
      'https://images.unsplash.com/photo-1619253341026-74c609e6ce50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
  },
]

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const t = useTranslations('search')

  const popularSearches = [
    { key: 'tshirt', label: t('terms.tshirt') },
    { key: 'shoes', label: t('terms.shoes') },
    { key: 'yoga', label: t('terms.yoga') },
    { key: 'jacket', label: t('terms.jacket') },
    { key: 'training', label: t('terms.training') },
  ]

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 z-50 backdrop-blur-sm"
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 right-0 bg-background text-foreground z-[60] shadow-2xl border-b border-border"
          >
            <div className="container mx-auto px-6 py-8">
              {/* Search Input */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border-2 border-border rounded-sm outline-none focus:border-primary transition-colors text-lg bg-background text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <button
                  onClick={onClose}
                  className="p-4 hover:bg-muted rounded-sm transition-colors text-foreground"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Popular Searches */}
                <div>
                  <h3 className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                    {t('popular')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <button
                        key={search.key}
                        onClick={() => {
                          setSearchQuery(search.label)
                          // Could navigate to search results here
                        }}
                        className="px-4 py-2 border border-border rounded-sm text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        {search.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Products */}
                <div>
                  <h3 className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                    {t('recent')}
                  </h3>
                  <div className="space-y-4">
                    {recentProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex gap-4 p-2 hover:bg-muted rounded-sm transition-colors cursor-pointer group"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover rounded-sm group-hover:scale-105 transition-transform"
                            sizes="64px"
                          />
                        </div>
                        <div>
                          <h4 className="mb-1 text-foreground font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
