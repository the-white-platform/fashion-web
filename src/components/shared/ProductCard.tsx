'use client'

import Image from 'next/image'
import { Link } from '@/i18n/Link'
import { motion } from 'motion/react'
import { Heart, ArrowRightLeft, Star } from 'lucide-react'
import { cn } from '@/utilities/cn'
import { useTranslations } from 'next-intl'
import type { ProductForFrontend } from '@/utilities/getProducts'
import { useCompare } from '@/contexts/CompareContext'

interface ProductCardProps {
  product: ProductForFrontend
  onQuickView?: (product: ProductForFrontend) => void
  showWishlist?: boolean
  isWishlisted?: boolean
  onWishlistToggle?: (product: ProductForFrontend) => void
  showCompare?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  index?: number
}

export function ProductCard({
  product,
  onQuickView,
  showWishlist = false,
  isWishlisted = false,
  onWishlistToggle,
  showCompare = false,
  sizes = '(max-width: 1024px) 50vw, 33vw',
  priority = false,
  className,
  index = 0,
}: ProductCardProps) {
  const t = useTranslations()
  const { addToCompare, removeFromCompare, isInCompare, items: compareItems } = useCompare()
  const productInCompare = isInCompare(product.id)
  const compareIsFull = compareItems.length >= 4 && !productInCompare
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={cn('group', className)}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-muted mb-4 aspect-[3/4] rounded-sm">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes={sizes}
            priority={priority}
          />

          {product.tag && (
            <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {product.tag}
            </div>
          )}

          {!product.inStock && (
            <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 text-xs rounded-sm">
              {t('products.outOfStock')}
            </div>
          )}

          {showWishlist && (
            <button
              className="absolute top-3 right-3 bg-background text-foreground p-2 rounded-full lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:scale-110 shadow-md z-10"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onWishlistToggle?.(product)
              }}
            >
              <Heart
                className={cn('w-4 h-4', isWishlisted && 'fill-destructive text-destructive')}
              />
            </button>
          )}

          {showCompare && (
            <button
              disabled={compareIsFull}
              className={cn(
                'absolute top-3 bg-background text-foreground p-2 rounded-full lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:scale-110 shadow-md z-10',
                showWishlist ? 'right-12' : 'right-3',
                productInCompare && 'bg-primary text-primary-foreground opacity-100',
                compareIsFull && 'opacity-40 cursor-not-allowed',
              )}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (productInCompare) {
                  removeFromCompare(product.id)
                } else {
                  addToCompare(product)
                }
              }}
              title={productInCompare ? t('compare.remove') : t('compare.add')}
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          )}

          {onQuickView && (
            <button
              className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground py-3 lg:py-4 text-center lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 uppercase text-xs lg:text-sm font-bold tracking-widest hover:bg-background hover:text-foreground"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onQuickView(product)
              }}
            >
              {t('products.quickView')}
            </button>
          )}
        </div>

        <div>
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-[0.2em] font-medium">
            {product.category}
          </div>
          {/* `leading-none` + Vietnamese = diacritic clipping (Ầ Ơ Ể Ớ Ấ Ắ
              have marks above the cap line that get chopped when line-height
              equals the font em). `leading-tight` (1.25) restores vertical
              room without breaking the single-line clamp layout. */}
          <h3 className="mb-1 text-lg uppercase font-semibold group-hover:text-muted-foreground transition-colors line-clamp-1 leading-tight">
            {product.name}
          </h3>
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1 mb-1">
              {product.colors.map((color) => (
                <div
                  key={color.hex}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          )}
          {/* Rating stars */}
          {(product.averageRating ?? 0) > 0 && (
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-3 h-3',
                    star <= Math.round(product.averageRating ?? 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-border',
                  )}
                />
              ))}
              {(product.reviewCount ?? 0) > 0 && (
                <span className="text-[10px] text-muted-foreground ml-1">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
          <div className="font-bold text-foreground">{product.price}</div>
        </div>
      </Link>
    </motion.div>
  )
}
