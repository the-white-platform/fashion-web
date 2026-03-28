'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { ProductForFrontend } from '@/utilities/getProducts'

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

interface WishlistContextType {
  items: WishlistItem[]
  isWishlisted: (productId: number) => boolean
  toggleWishlist: (product: ProductForFrontend) => void
  removeFromWishlist: (productId: number) => void
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('thewhite_wishlist')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('thewhite_wishlist', JSON.stringify(items))
  }, [items])

  const isWishlisted = useCallback(
    (productId: number) => items.some(item => item.id === productId),
    [items],
  )

  const toggleWishlist = useCallback((product: ProductForFrontend) => {
    setItems(prev => {
      const exists = prev.some(item => item.id === product.id)
      if (exists) return prev.filter(item => item.id !== product.id)
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.priceNumber,
          priceDisplay: product.price,
          image: product.image,
          inStock: product.inStock,
          sizes: product.sizes,
        },
      ]
    })
  }, [])

  const removeFromWishlist = useCallback((productId: number) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }, [])

  const clearWishlist = useCallback(() => {
    setItems([])
    localStorage.removeItem('thewhite_wishlist')
  }, [])

  return (
    <WishlistContext.Provider
      value={{ items, isWishlisted, toggleWishlist, removeFromWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
