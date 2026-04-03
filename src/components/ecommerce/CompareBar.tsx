'use client'

import Image from 'next/image'
import { X, ArrowRightLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useCompare } from '@/contexts/CompareContext'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/Link'

export function CompareBar() {
  const { items, removeFromCompare, clearCompare } = useCompare()
  const t = useTranslations('compare')

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 border-foreground shadow-2xl"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Product thumbnails */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs uppercase tracking-widest font-bold shrink-0 text-muted-foreground">
                  {t('comparing')}
                </span>
                <div className="flex gap-2 overflow-x-auto">
                  {items.map((product) => (
                    <div key={product.id} className="relative shrink-0 group">
                      <div className="w-12 h-14 rounded-sm overflow-hidden border border-border bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute -top-1 -right-1 bg-foreground text-background rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title={t('remove')}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      <div className="absolute inset-0 bottom-0 flex items-end p-0.5 pointer-events-none">
                        <span className="text-[9px] leading-tight font-medium text-white bg-black/60 px-1 rounded-sm line-clamp-1 w-full">
                          {product.name}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: 4 - items.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="w-12 h-14 rounded-sm border-2 border-dashed border-border shrink-0 flex items-center justify-center"
                    >
                      <span className="text-[10px] text-muted-foreground">+</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={clearCompare}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  {t('clearAll')}
                </button>

                <Link
                  href="/compare"
                  className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                    items.length >= 2
                      ? 'bg-foreground text-background hover:bg-primary hover:text-primary-foreground hover:border-primary'
                      : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
                  }`}
                  onClick={(e) => {
                    if (items.length < 2) e.preventDefault()
                  }}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  {t('compareCount', { count: items.length })}
                </Link>
              </div>
            </div>

            {items.length < 2 && (
              <p className="text-[10px] text-muted-foreground mt-1">{t('minRequired')}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
