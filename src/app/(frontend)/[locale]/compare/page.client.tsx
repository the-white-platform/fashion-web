'use client'

import Image from 'next/image'
import { X, ShoppingCart, Heart, ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import { useCompare } from '@/contexts/CompareContext'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/Link'
import { PageContainer } from '@/components/layout/PageContainer'
import { cn } from '@/utilities/cn'
import { useState } from 'react'

export default function ComparePageClient() {
  const { items, removeFromCompare, clearCompare } = useCompare()
  const { addToCart, setIsCartOpen } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const t = useTranslations('compare')
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({})

  const handleAddToCart = (productId: number) => {
    const product = items.find((p) => p.id === productId)
    if (!product) return
    const size = selectedSizes[productId] || product.sizes[0] || ''
    addToCart({
      id: product.id,
      name: product.name,
      price: product.priceNumber,
      image: product.image,
      size,
    })
    setIsCartOpen(true)
  }

  // Determine which rows have all-same values (no difference) vs differ
  const hasDifference = (getter: (p: (typeof items)[number]) => string) => {
    if (items.length < 2) return false
    const vals = items.map(getter)
    return vals.some((v) => v !== vals[0])
  }

  const rowClass = (differs: boolean) =>
    cn('divide-x divide-border', differs && 'bg-amber-50 dark:bg-amber-950/20')

  const colCount = items.length || 1
  const colWidth = `${100 / (colCount + 1)}%` // +1 for label column

  if (items.length === 0) {
    return (
      <PageContainer>
        <div className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="text-6xl mb-6">⚖️</div>
            <h1 className="text-2xl uppercase font-bold mb-4">{t('emptyTitle')}</h1>
            <p className="text-muted-foreground mb-8">{t('emptyDesc')}</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 uppercase text-xs font-bold tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors rounded-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('browseProducts')}
            </Link>
          </motion.div>
        </div>
      </PageContainer>
    )
  }

  if (items.length === 1) {
    return (
      <PageContainer>
        <div className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <h1 className="text-2xl uppercase font-bold mb-4">{t('pageTitle')}</h1>
            <p className="text-muted-foreground mb-8">{t('minRequired')}</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 uppercase text-xs font-bold tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors rounded-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('addMore')}
            </Link>
          </motion.div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToProducts')}
            </Link>
            <h1 className="text-2xl md:text-3xl uppercase font-bold">{t('pageTitle')}</h1>
          </div>
          <button
            onClick={clearCompare}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            {t('clearAll')}
          </button>
        </div>

        {/* Comparison table — horizontally scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table
            className="w-full border-collapse border border-border text-sm"
            style={{ minWidth: `${items.length * 200 + 160}px` }}
          >
            <colgroup>
              <col style={{ width: '160px' }} />
              {items.map((p) => (
                <col key={p.id} style={{ width: `${Math.max(200, 100 / colCount)}px` }} />
              ))}
            </colgroup>

            {/* Images + remove row */}
            <thead>
              <tr className="divide-x divide-border border-b border-border">
                <th className="p-3 text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/30 font-medium sticky left-0 z-10 bg-background">
                  {t('product')}
                </th>
                {items.map((product) => (
                  <th key={product.id} className="p-3 text-center relative min-w-[200px]">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 bg-muted hover:bg-destructive hover:text-destructive-foreground rounded-full p-1 transition-colors"
                      title={t('remove')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <Link href={`/products/${product.id}`}>
                      <div className="relative w-full aspect-[3/4] max-w-[160px] mx-auto mb-2 overflow-hidden rounded-sm bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="160px"
                        />
                        {product.tag && (
                          <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase">
                            {product.tag}
                          </div>
                        )}
                      </div>
                    </Link>
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold uppercase text-xs leading-tight hover:text-muted-foreground transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {/* Price */}
              <tr className={rowClass(hasDifference((p) => p.price))}>
                <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sticky left-0 bg-background border-r border-border">
                  {t('price')}
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <div className="font-bold text-base">{product.price}</div>
                    {product.originalPrice && (
                      <div className="text-xs text-muted-foreground line-through">
                        {product.originalPrice}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr className={rowClass(hasDifference((p) => p.category))}>
                <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sticky left-0 bg-background border-r border-border">
                  {t('category')}
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-3 text-center text-sm">
                    {product.category}
                  </td>
                ))}
              </tr>

              {/* Colors */}
              <tr className={rowClass(hasDifference((p) => p.colors.map((c) => c.hex).join(',')))}>
                <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sticky left-0 bg-background border-r border-border">
                  {t('colors')}
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    {product.colors.length > 0 ? (
                      <div className="flex gap-1.5 justify-center flex-wrap">
                        {product.colors.map((color) => (
                          <div
                            key={color.hex}
                            className="w-5 h-5 rounded-full border border-border"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Sizes */}
              <tr className={rowClass(hasDifference((p) => p.sizes.join(',')))}>
                <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sticky left-0 bg-background border-r border-border">
                  {t('sizes')}
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    {product.sizes.length > 0 ? (
                      <div className="flex gap-1 justify-center flex-wrap">
                        {product.sizes.map((size) => (
                          <span
                            key={size}
                            className="border border-border px-1.5 py-0.5 text-[11px] rounded-sm"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Stock */}
              <tr className={rowClass(hasDifference((p) => String(p.inStock)))}>
                <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sticky left-0 bg-background border-r border-border">
                  {t('stock')}
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    {product.inStock ? (
                      <span className="text-green-600 dark:text-green-400 text-xs font-semibold">
                        ✓ {t('inStock')}
                      </span>
                    ) : (
                      <span className="text-destructive text-xs font-semibold">
                        ✗ {t('outOfStock')}
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Description */}
              <tr>
                <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sticky left-0 bg-background border-r border-border align-top">
                  {t('description')}
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-3 text-sm text-muted-foreground align-top">
                    {product.description ? (
                      <p className="line-clamp-4">{product.description}</p>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Features */}
              <tr>
                <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sticky left-0 bg-background border-r border-border align-top">
                  {t('features')}
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-3 align-top">
                    {product.features.length > 0 ? (
                      <ul className="space-y-1">
                        {product.features.slice(0, 5).map((feature, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                            <span className="text-primary mt-0.5 shrink-0">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Add to cart row */}
              <tr className="divide-x divide-border border-t-2 border-foreground">
                <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sticky left-0 bg-background border-r border-border">
                  {t('actions')}
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-3">
                    <div className="flex flex-col gap-2">
                      {/* Size selector */}
                      {product.sizes.length > 0 && (
                        <select
                          value={selectedSizes[product.id] || product.sizes[0] || ''}
                          onChange={(e) =>
                            setSelectedSizes((prev) => ({ ...prev, [product.id]: e.target.value }))
                          }
                          className="w-full border border-border rounded-sm px-2 py-1.5 text-xs bg-background"
                        >
                          {product.sizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={!product.inStock}
                        className="w-full flex items-center justify-center gap-1.5 bg-foreground text-background py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {t('addToCart')}
                      </button>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className={cn(
                          'w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-sm border-2 transition-colors',
                          isWishlisted(product.id)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-foreground',
                        )}
                      >
                        <Heart
                          className={cn('w-3.5 h-3.5', isWishlisted(product.id) && 'fill-current')}
                        />
                        {isWishlisted(product.id) ? t('wishlisted') : t('addToWishlist')}
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}
