import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Product } from '@/payload-types'

// Revalidate the feed every hour. Merchant Center polls on its
// own schedule; shorter TTLs just burn DB cycles for no gain.
export const revalidate = 3600

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool').replace(/\/+$/, '')

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function firstImageUrl(product: Product): string | null {
  const variants = (product as { colorVariants?: Array<{ images?: Array<unknown> }> }).colorVariants
  if (variants && variants.length > 0) {
    for (const v of variants) {
      const imgs = v.images ?? []
      for (const img of imgs) {
        if (typeof img === 'object' && img !== null) {
          const obj = img as { image?: unknown; url?: unknown }
          const source = obj.image ?? obj
          if (typeof source === 'object' && source !== null && 'url' in source) {
            const url = (source as { url?: string }).url
            if (url) return url.startsWith('http') ? url : `${BASE_URL}${url}`
          }
        }
      }
    }
  }
  const topLevel = (product as { images?: Array<unknown> }).images ?? []
  for (const img of topLevel) {
    if (typeof img === 'object' && img !== null) {
      const obj = img as { image?: unknown; url?: unknown }
      const source = obj.image ?? obj
      if (typeof source === 'object' && source !== null && 'url' in source) {
        const url = (source as { url?: string }).url
        if (url) return url.startsWith('http') ? url : `${BASE_URL}${url}`
      }
    }
  }
  return null
}

function inStock(product: Product): boolean {
  const variants = (
    product as { colorVariants?: Array<{ sizeInventory?: Array<{ stock?: number }> }> }
  ).colorVariants
  if (!variants) return false
  for (const v of variants) {
    for (const s of v.sizeInventory ?? []) {
      if ((s.stock ?? 0) > 0) return true
    }
  }
  return false
}

/**
 * Google Merchant Center product feed — RSS 2.0 with the Google
 * Shopping namespace. Loadable at https://thewhite.cool/products-feed.xml
 * and can be plugged into Merchant Center under Products → Feeds.
 *
 * Canonical URLs target the `vi` locale because that's the
 * default storefront and keeps one feed per product (Merchant
 * Center prefers a single canonical item; language variants are
 * declared via separate feeds if we ever add EN-targeted ads).
 */
export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 5000,
    pagination: false,
    locale: 'vi',
    overrideAccess: false,
  })

  const items: string[] = []
  for (const product of docs as Product[]) {
    const slug = product.slug || product.id
    const link = `${BASE_URL}/vi/products/${slug}`
    const title = (product.name || '').trim()
    const description =
      ((product as { description?: string }).description || '').trim() || `${title} | THE WHITE`
    const priceRaw = (product as { price?: number }).price
    if (!title || typeof priceRaw !== 'number' || priceRaw <= 0) continue
    const price = `${priceRaw.toFixed(2)} VND`
    const image = firstImageUrl(product)
    if (!image) continue
    const availability = inStock(product) ? 'in_stock' : 'out_of_stock'
    const categoryRaw = (product as { category?: unknown }).category
    const category = (() => {
      if (!categoryRaw) return 'Apparel'
      const arr = Array.isArray(categoryRaw) ? categoryRaw : [categoryRaw]
      const names = arr
        .map((c) => {
          if (typeof c === 'string') return c
          if (typeof c === 'object' && c !== null && 'name' in c) {
            return (c as { name?: string }).name ?? ''
          }
          return ''
        })
        .filter(Boolean)
      return names[0] || 'Apparel'
    })()

    items.push(
      `    <item>
      <g:id>${xmlEscape(String(product.id))}</g:id>
      <title>${xmlEscape(title)}</title>
      <description>${xmlEscape(description)}</description>
      <link>${xmlEscape(link)}</link>
      <g:image_link>${xmlEscape(image)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${xmlEscape(price)}</g:price>
      <g:brand>THE WHITE</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${xmlEscape(category)}</g:product_type>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing &gt; Activewear</g:google_product_category>
    </item>`,
    )
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>THE WHITE — Products</title>
    <link>${BASE_URL}</link>
    <description>Activewear by THE WHITE.</description>
${items.join('\n')}
  </channel>
</rss>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
