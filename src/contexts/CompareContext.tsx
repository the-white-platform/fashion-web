'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { ProductForFrontend } from '@/utilities/getProducts'

const STORAGE_KEY = 'thewhite_compare'
const MAX_ITEMS = 4

interface CompareContextType {
  items: ProductForFrontend[]
  addToCompare: (product: ProductForFrontend) => boolean
  removeFromCompare: (productId: number) => void
  isInCompare: (productId: number) => boolean
  clearCompare: () => void
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

function loadFromStorage(): ProductForFrontend[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ProductForFrontend[]>(loadFromStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // localStorage might be unavailable
    }
  }, [items])

  // Returns true if added, false if max reached
  const addToCompare = useCallback((product: ProductForFrontend): boolean => {
    let added = false
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        added = true
        return prev
      }
      if (prev.length >= MAX_ITEMS) {
        added = false
        return prev
      }
      added = true
      return [...prev, product]
    })
    return added
  }, [])

  const removeFromCompare = useCallback((productId: number) => {
    setItems((prev) => prev.filter((p) => p.id !== productId))
  }, [])

  const isInCompare = useCallback(
    (productId: number) => items.some((p) => p.id === productId),
    [items],
  )

  const clearCompare = useCallback(() => {
    setItems([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return (
    <CompareContext.Provider
      value={{ items, addToCompare, removeFromCompare, isInCompare, clearCompare }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) throw new Error('useCompare must be used within CompareProvider')
  return context
}
