'use client'

import { useState, useEffect } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, ShoppingCart, Share2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useTranslations } from 'next-intl'

interface WishlistItem {
  id: number
  name: string
  category: string
  price: number
  priceDisplay: string
  image: string
  inStock: boolean
  sizes: string[]
}

export default function WishlistPage() {
  const router = useRouter()
  const t = useTranslations('wishlist')
  const tNav = useTranslations('nav')
  const { addToCart, setIsCartOpen } = useCart()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({})

  // Load wishlist from localStorage only after mount (client-side)
  // This ensures server and client initial renders match
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('thewhite_wishlist')
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist))
      }
    } catch (e) {
      console.error('Error loading wishlist:', e)
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('thewhite_wishlist', JSON.stringify(wishlistItems))
    } catch (e) {
      console.error('Error saving wishlist:', e)
    }
  }, [wishlistItems])

  const removeFromWishlist = (id: number) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id))
  }

  const handleAddToCart = (item: WishlistItem) => {
    const size = selectedSizes[item.id] || item.sizes[0]
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: size,
    })
    setIsCartOpen(true)
  }

  const handleAddAllToCart = () => {
    wishlistItems.forEach((item) => {
      if (item.inStock) {
        const size = selectedSizes[item.id] || item.sizes[0]
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          size: size,
        })
      }
    })
    setIsCartOpen(true)
  }

  const handleShare = () => {
    const wishlistIds = wishlistItems.map((item) => item.id).join(',')
    const shareUrl = `${window.location.origin}/wishlist?items=${wishlistIds}`
    navigator.clipboard.writeText(shareUrl)
    alert(t('shareLinkCopied'))
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-12 transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">{tNav('home')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('breadcrumb')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl uppercase tracking-wide mb-2 text-foreground font-bold">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('itemCount', { count: wishlistItems.length })}
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-sm hover:border-primary transition-colors bg-card text-foreground"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">{t('share')}</span>
              </button>
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">{t('addAllToCart')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-card border border-border rounded-sm overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${item.id}`}
                    className="relative aspect-[3/4] bg-muted overflow-hidden block"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        removeFromWishlist(item.id)
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-sm flex items-center justify-center hover:bg-destructive/10 transition-colors z-10"
                    >
                      <Heart className="w-5 h-5 fill-destructive text-destructive" />
                    </button>

                    {/* Stock Badge */}
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge className="bg-background text-foreground border-0">
                          {t('outOfStock')}
                        </Badge>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1 uppercase">{item.category}</p>
                    <Link href={`/products/${item.id}`}>
                      <h3 className="mb-2 font-medium text-foreground hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold mb-4 text-foreground">{item.priceDisplay}</p>

                    {/* Size Selection */}
                    {item.inStock && (
                      <div className="mb-4">
                        <label className="block text-xs text-muted-foreground mb-2 uppercase">
                          {t('size')}
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {item.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() =>
                                setSelectedSizes({ ...selectedSizes, [item.id]: size })
                              }
                              className={`px-3 py-1 text-xs rounded-sm border-2 transition-colors ${
                                (selectedSizes[item.id] || item.sizes[0]) === size
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-card text-foreground border-border hover:border-primary'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    {item.inStock ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors uppercase tracking-wide font-medium"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t('addToCart')}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 border-2 border-muted text-muted-foreground rounded-sm uppercase tracking-wide cursor-not-allowed"
                      >
                        {t('outOfStock')}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl uppercase tracking-wide mb-3 text-foreground font-semibold">
              {t('empty')}
            </h2>
            <p className="text-muted-foreground mb-8">{t('emptyDesc')}</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-sm hover:bg-primary/90 transition-colors uppercase tracking-wide font-bold shadow-md hover:shadow-lg hover:scale-105"
            >
              {t('explore')}
            </button>
          </motion.div>
        )}

        {/* Info Section */}
        {wishlistItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-card rounded-sm p-8 border border-border shadow-sm"
          >
            <h3 className="uppercase tracking-wide mb-4 text-foreground font-semibold">
              💡 {t('tips.title')}
            </h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>• {t('tips.l1')}</li>
              <li>• {t('tips.l2')}</li>
              <li>• {t('tips.l3')}</li>
              <li>• {t('tips.l4')}</li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  )
}
