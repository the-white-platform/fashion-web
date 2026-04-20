import { sendGAEvent } from '@next/third-parties/google'

// GA4 ecommerce event helpers. Wrap sendGAEvent so call sites stay
// tight and the GA-disabled branch (no NEXT_PUBLIC_GA_ID env var)
// stays a no-op without crashing in tests / dev.
//
// Currency is hard-coded to VND because the storefront is single-market
// — change here if/when we add a second currency.

const CURRENCY = 'VND'

type Item = {
  id: number | string
  name: string
  price: number
  category?: string
  size?: string
  color?: string
  quantity?: number
}

function toGAItem(item: Item) {
  return {
    item_id: String(item.id),
    item_name: item.name,
    price: item.price,
    quantity: item.quantity ?? 1,
    item_category: item.category,
    item_variant: [item.color, item.size].filter(Boolean).join(' / ') || undefined,
  }
}

function safe(fn: () => void) {
  if (typeof window === 'undefined') return
  try {
    fn()
  } catch {
    // GA not loaded (NEXT_PUBLIC_GA_ID empty) or blocked — never break UX.
  }
}

export function trackViewItem(item: Item) {
  safe(() =>
    sendGAEvent('event', 'view_item', {
      currency: CURRENCY,
      value: item.price,
      items: [toGAItem(item)],
    }),
  )
}

export function trackAddToCart(item: Item) {
  safe(() =>
    sendGAEvent('event', 'add_to_cart', {
      currency: CURRENCY,
      value: item.price * (item.quantity ?? 1),
      items: [toGAItem(item)],
    }),
  )
}

export function trackBeginCheckout(items: Item[], total: number) {
  safe(() =>
    sendGAEvent('event', 'begin_checkout', {
      currency: CURRENCY,
      value: total,
      items: items.map(toGAItem),
    }),
  )
}

export function trackPurchase(params: {
  orderId: string
  total: number
  items: Item[]
  shipping?: number
  tax?: number
  coupon?: string
}) {
  safe(() =>
    sendGAEvent('event', 'purchase', {
      transaction_id: params.orderId,
      currency: CURRENCY,
      value: params.total,
      shipping: params.shipping,
      tax: params.tax,
      coupon: params.coupon,
      items: params.items.map(toGAItem),
    }),
  )
}
