'use client'

import Image from 'next/image'
import { Link } from '@/i18n/Link'
import { motion } from 'motion/react'
import { Heart } from 'lucide-react'
import { cn } from '@/utilities/cn'
import type { ProductForFrontend } from '@/utilities/getProducts'

interface ProductCardProps {
  product: ProductForFrontend
  onQuickView?: (product: ProductForFrontend) => void
  showWishlist?: boolean
  isWishlisted?: boolean
  onWishlistToggle?: (product: ProductForFrontend) => void
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
  sizes = '(max-width: 1024px) 50vw, 33vw',
  priority = false,
  className,
  index = 0,
}: ProductCardProps) {
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
              HET HANG
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
              <Heart className={cn('w-4 h-4', isWishlisted && 'fill-destructive text-destructive')} />
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
              Xem Nhanh
            </button>
          )}
        </div>

        <div>
          <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-[0.2em] font-medium">
            {product.category}
          </div>
          <h3 className="mb-1 text-lg uppercase font-semibold group-hover:text-muted-foreground transition-colors line-clamp-1 leading-none">
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
          <div className="font-bold text-foreground">{product.price}</div>
        </div>
      </Link>
    </motion.div>
  )
}
