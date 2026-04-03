'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { useUser } from './UserContext'
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

function getLocalWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('thewhite_wishlist')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(getLocalWishlist)
  const { user } = useUser()
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUserRef = useRef<string | null>(null)

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('thewhite_wishlist', JSON.stringify(items))
  }, [items])

  // Merge on login
  useEffect(() => {
    const userId = user?.id ?? null
    const wasLoggedIn = prevUserRef.current
    prevUserRef.current = userId

    if (userId && !wasLoggedIn) {
      fetch(`/api/users/${userId}?depth=0`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          const serverIds: number[] = (data.wishlist ?? []).map((w: any) =>
            typeof w.product === 'object' ? w.product.id : w.product,
          )
          const localItems = getLocalWishlist()
          // Union: keep all local items + add server-only IDs as minimal items
          const localIds = new Set(localItems.map((i) => i.id))
          const merged = [...localItems]
          for (const sid of serverIds) {
            if (!localIds.has(sid)) {
              merged.push({
                id: sid,
                name: '',
                category: '',
                price: 0,
                priceDisplay: '',
                image: '',
                inStock: true,
                sizes: [],
              })
            }
          }
          setItems(merged)
          syncWishlistToServer(userId, merged)
        })
        .catch(() => {})
    } else if (!userId && wasLoggedIn) {
      setItems([])
      localStorage.removeItem('thewhite_wishlist')
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const syncWishlistToServer = useCallback((userId: string, wishlistItems: WishlistItem[]) => {
    const payload = wishlistItems.map((item) => ({ product: item.id }))
    fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ wishlist: payload }),
    }).catch(() => {})
  }, [])

  const debouncedSync = useCallback(
    (wishlistItems: WishlistItem[]) => {
      if (!user?.id) return
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = setTimeout(() => {
        syncWishlistToServer(user.id, wishlistItems)
      }, 500)
    },
    [user?.id, syncWishlistToServer],
  )

  const isWishlisted = useCallback(
    (productId: number) => items.some((item) => item.id === productId),
    [items],
  )

  const toggleWishlist = useCallback(
    (product: ProductForFrontend) => {
      setItems((prev) => {
        const exists = prev.some((item) => item.id === product.id)
        const next = exists
          ? prev.filter((item) => item.id !== product.id)
          : [
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
        debouncedSync(next)
        return next
      })
    },
    [debouncedSync],
  )

  const removeFromWishlist = useCallback(
    (productId: number) => {
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== productId)
        debouncedSync(next)
        return next
      })
    },
    [debouncedSync],
  )

  const clearWishlist = useCallback(() => {
    setItems([])
    localStorage.removeItem('thewhite_wishlist')
    if (user?.id) syncWishlistToServer(user.id, [])
  }, [user?.id, syncWishlistToServer])

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
