'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { ProductForFrontend } from '@/utilities/getProducts'

const STORAGE_KEY = 'thewhite_recently_viewed'
const MAX_ITEMS = 20

interface RecentlyViewedContextType {
  items: ProductForFrontend[]
  trackProduct: (product: ProductForFrontend) => void
  clearRecent: () => void
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined)

function loadFromStorage(): ProductForFrontend[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ProductForFrontend[]>(loadFromStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // localStorage might be unavailable
    }
  }, [items])

  const trackProduct = useCallback((product: ProductForFrontend) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id)
      return [product, ...filtered].slice(0, MAX_ITEMS)
    })
  }, [])

  const clearRecent = useCallback(() => {
    setItems([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return (
    <RecentlyViewedContext.Provider value={{ items, trackProduct, clearRecent }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext)
  if (!context) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider')
  return context
}
