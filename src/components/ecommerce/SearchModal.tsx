'use client'

import { X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from '@/i18n/useRouter'
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext'
import { slugify } from '@/utilities/slugify'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PopularCategory {
  title: string
  slug: string
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [popular, setPopular] = useState<PopularCategory[]>([])
  const t = useTranslations('search')
  const router = useRouter()
  const { items: recentItems } = useRecentlyViewed()

  // Pull "popular" category labels from the real catalog so the chips
  // mirror what the admin actually has, not a stale i18n list.
  useEffect(() => {
    if (!isOpen) return
    if (popular.length > 0) return
    fetch('/api/categories?limit=20&depth=0', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.docs) return
        setPopular(
          data.docs
            .filter((c: { title?: string }) => Boolean(c?.title))
            .slice(0, 8)
            .map((c: { title: string }) => ({ title: c.title, slug: slugify(c.title) })),
        )
      })
      .catch(() => {})
  }, [isOpen, popular.length])

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

  const submitSearch = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    router.push(`/products?q=${encodeURIComponent(trimmed)}`)
    onClose()
    setSearchQuery('')
  }

  const recent = recentItems.slice(0, 4)

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
            className="fixed inset-0 bg-background/80 z-[90] backdrop-blur-sm"
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 right-0 bg-background text-foreground z-[100] shadow-2xl border-b border-border"
          >
            <div className="container mx-auto px-6 py-8">
              {/* Search Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  submitSearch(searchQuery)
                }}
                className="flex items-center gap-4 mb-8"
              >
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
                  type="button"
                  onClick={onClose}
                  className="p-4 hover:bg-muted rounded-sm transition-colors text-foreground"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </form>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Popular Searches — categories with at least one product */}
                {popular.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                      {t('popular')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {popular.map((cat) => (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => {
                            router.push(`/products?category=${cat.slug}`)
                            onClose()
                            setSearchQuery('')
                          }}
                          className="px-4 py-2 border border-border rounded-sm text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          {cat.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently viewed — driven by RecentlyViewedContext */}
                {recent.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                      {t('recent')}
                    </h3>
                    <div className="space-y-4">
                      {recent.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            router.push(`/products/${product.slug}`)
                            onClose()
                          }}
                          className="w-full flex gap-4 p-2 hover:bg-muted rounded-sm transition-colors cursor-pointer group text-left"
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
                          <div className="min-w-0">
                            <h4 className="mb-1 text-foreground font-medium truncate">
                              {product.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{product.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
