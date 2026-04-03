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
  const [items, setItems] = useState<CartItem[]>(getLocalCart)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { user } = useUser()
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUserRef = useRef<string | null>(null)

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('thewhite_cart', JSON.stringify(items))
  }, [items])

  // Merge on login
  useEffect(() => {
    const userId = user?.id ?? null
    const wasLoggedIn = prevUserRef.current
    prevUserRef.current = userId

    if (userId && !wasLoggedIn) {
      // User just logged in — merge with server cart
      fetch(`/api/users/${userId}?depth=0`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          const serverCart: CartItem[] = (data.cart ?? []).map((c: any) => ({
            id: typeof c.product === 'object' ? c.product.id : c.product,
            name: '',
            price: 0,
            image: '',
            size: c.size ?? '',
            quantity: c.quantity ?? 1,
            color: c.variant ?? undefined,
          }))
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
