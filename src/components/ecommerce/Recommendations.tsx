'use client'

import { useEffect, useRef, useCallback, useReducer } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { ProductCard } from '@/components/shared/ProductCard'
import { useUser } from '@/contexts/UserContext'
import type { ProductForFrontend } from '@/utilities/getProducts'
import { cn } from '@/utilities/cn'

export type RecommendationType = 'for-you' | 'similar' | 'cart-based' | 'popular'

interface RecommendationsProps {
  type: RecommendationType
  productId?: number
  limit?: number
  title?: string
  className?: string
}

interface State {
  products: ProductForFrontend[]
  // seq tracks the current request — when pendingSeq > resolvedSeq, we're loading
  pendingSeq: number
  resolvedSeq: number
}

type Action =
  | { type: 'FETCH_START'; seq: number }
  | { type: 'FETCH_DONE'; seq: number; products: ProductForFrontend[] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, pendingSeq: action.seq }
    case 'FETCH_DONE':
      // Ignore stale responses
      if (action.seq !== state.pendingSeq) return state
      return { ...state, resolvedSeq: action.seq, products: action.products }
    default:
      return state
  }
}

const TYPE_LABELS: Record<RecommendationType, { vi: string; en: string }> = {
  'for-you': { vi: 'Gợi Ý Cho Bạn', en: 'For You' },
  similar: { vi: 'Sản Phẩm Tương Tự', en: 'Similar Products' },
  'cart-based': { vi: 'Có Thể Bạn Cũng Thích', en: 'You May Also Like' },
  popular: { vi: 'Sản Phẩm Phổ Biến', en: 'Popular Products' },
}

export function Recommendations({
  type,
  productId,
  limit = 8,
  title,
  className,
}: RecommendationsProps) {
  const { user } = useUser()
  const [state, dispatch] = useReducer(reducer, { products: [], pendingSeq: 0, resolvedSeq: -1 })
  const seqRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useReducer((_: boolean, v: boolean) => v, false)
  const [canScrollRight, setCanScrollRight] = useReducer((_: boolean, v: boolean) => v, false)

  useEffect(() => {
    const seq = ++seqRef.current
    dispatch({ type: 'FETCH_START', seq })

    const params = new URLSearchParams()
    params.set('type', type)
    params.set('limit', String(limit))
    if (user?.id) params.set('userId', String(user.id))
    if (productId) params.set('productId', String(productId))

    fetch(`/api/recommendations?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => dispatch({ type: 'FETCH_DONE', seq, products: data.products ?? [] }))
      .catch(() => dispatch({ type: 'FETCH_DONE', seq, products: [] }))
  }, [type, productId, limit, user?.id])

  const isLoading = state.pendingSeq !== state.resolvedSeq
  const { products } = state

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    updateScrollButtons()
  }, [products, updateScrollButtons])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
    setTimeout(updateScrollButtons, 350)
  }

  if (!isLoading && products.length === 0) return null

  const displayTitle = title ?? TYPE_LABELS[type].vi

  return (
    <section className={cn('py-8', className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl uppercase tracking-wide flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {displayTitle}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-2 border border-border rounded-sm hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-2 border border-border rounded-sm hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-52 shrink-0 bg-muted animate-pulse rounded-sm aspect-[3/4]" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        >
          {products.map((product) => (
            <div key={product.id} className="w-52 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
