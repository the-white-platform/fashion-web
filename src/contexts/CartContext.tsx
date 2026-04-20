'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react'
import { useUser } from './UserContext'
import { trackAddToCart } from '@/utilities/analytics'

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  size: string
  quantity: number
  color?: string
  colorHex?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: number, size: string, color?: string) => void
  updateQuantity: (id: number, size: string, quantity: number, color?: string) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function getLocalCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('thewhite_cart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function mergeCartItems(local: CartItem[], server: CartItem[]): CartItem[] {
  const merged = [...local]
  for (const serverItem of server) {
    const idx = merged.findIndex(
      (i) => i.id === serverItem.id && i.size === serverItem.size && i.color === serverItem.color,
    )
    if (idx >= 0) {
      merged[idx] = {
        ...merged[idx],
        quantity: Math.max(merged[idx].quantity, serverItem.quantity),
      }
    } else {
      merged.push(serverItem)
    }
  }
  return merged
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Initial state must match SSR (no localStorage access). Hydrate from
  // localStorage in an effect below so cart-dependent UI (e.g. the nav
  // item-count badge) doesn't flip between server and client renders.
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { user } = useUser()
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUserRef = useRef<string | null>(null)

  // Hydrate cart from localStorage once on mount
  useEffect(() => {
    setItems(getLocalCart())
    setHydrated(true)
  }, [])

  const syncCartToServer = useCallback((userId: string, cartItems: CartItem[]) => {
    const payload = cartItems.map((item) => ({
      product: item.id,
      variant: item.color ?? '',
      size: item.size,
      quantity: item.quantity,
    }))
    fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cart: payload }),
    }).catch(() => {})
  }, [])

  // Persist to localStorage — but not before hydration finishes, or we'd
  // overwrite the saved cart with the empty initial state on first mount.
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('thewhite_cart', JSON.stringify(items))
  }, [items, hydrated])

  // Merge on login
  useEffect(() => {
    const userId = user?.id ?? null
    const wasLoggedIn = prevUserRef.current
    prevUserRef.current = userId

    if (userId && !wasLoggedIn) {
      // User just logged in — fetch server cart, hydrate product data, then merge
      fetch(`/api/users/${userId}?depth=0`, { credentials: 'include' })
        .then((res) => res.json())
        .then(async (data) => {
          const rawItems: Array<{
            productId: number
            size: string
            quantity: number
            color?: string
          }> = (data.cart ?? []).map((c: any) => ({
            productId: typeof c.product === 'object' ? c.product.id : c.product,
            size: c.size ?? '',
            quantity: c.quantity ?? 1,
            color: c.variant ?? undefined,
          }))

          if (rawItems.length === 0) return

          // Batch-fetch product data so we never show zero prices
          const uniqueIds = [...new Set(rawItems.map((c) => c.productId))].join(',')
          const productRes = await fetch(
            `/api/products?where[id][in]=${uniqueIds}&depth=1&limit=${rawItems.length}`,
            { credentials: 'include' },
          )
          if (!productRes.ok) return

          const productData = await productRes.json()
          const productMap = new Map<number, any>(
            (productData.docs ?? []).map((p: any) => [p.id, p]),
          )

          const serverCart: CartItem[] = []
          for (const raw of rawItems) {
            const product = productMap.get(raw.productId)
            if (!product) {
              console.warn(
                `[CartContext] Product id=${raw.productId} no longer exists — dropping from merged cart`,
              )
              continue
            }
            const firstImage = product.colorVariants?.[0]?.images?.[0]?.url ?? ''
            serverCart.push({
              id: raw.productId,
              name: product.name ?? '',
              price: product.price ?? 0,
              image: firstImage,
              size: raw.size,
              quantity: raw.quantity,
              color: raw.color,
            })
          }

          const localCart = getLocalCart()
          const merged = mergeCartItems(localCart, serverCart)
          setItems(merged)
          // Push merged back to server
          syncCartToServer(userId, merged)
        })
        .catch(() => {})
    } else if (!userId && wasLoggedIn) {
      // User just logged out — clear local cart
      setItems([])
      localStorage.removeItem('thewhite_cart')
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedSync = useCallback(
    (cartItems: CartItem[]) => {
      if (!user?.id) return
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = setTimeout(() => {
        syncCartToServer(user.id, cartItems)
      }, 500)
    },
    [user?.id, syncCartToServer],
  )

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color,
      )
      const next = existingItem
        ? prev.map((i) =>
            i.id === item.id && i.size === item.size && i.color === item.color
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          )
        : [...prev, { ...item, quantity: 1 }]
      debouncedSync(next)
      return next
    })
    trackAddToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      size: item.size,
      color: item.color,
      quantity: 1,
    })
  }

  const removeFromCart = (id: number, size: string, color?: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => !(i.id === id && i.size === size && i.color === color))
      debouncedSync(next)
      return next
    })
  }

  const updateQuantity = (id: number, size: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color)
      return
    }
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === id && i.size === size && i.color === color ? { ...i, quantity } : i,
      )
      debouncedSync(next)
      return next
    })
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('thewhite_cart')
    if (user?.id) syncCartToServer(user.id, [])
  }

  const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0)
  const getTotalPrice = () => items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
