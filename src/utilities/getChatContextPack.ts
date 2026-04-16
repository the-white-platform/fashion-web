import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCachedProducts } from './getProducts'

/**
 * Assemble the Wolfies assistant's per-turn grounding into a single
 * Markdown string. Three sources:
 *
 *  1. `chat-context` global (brand bio, size guide, policies, site
 *     features, tone).
 *  2. A compact catalog table from `products` (name, category, price,
 *     sizes, colors, stock) plus a "Product details" section listing
 *     per-product feature bullets + a short description snippet so the
 *     assistant can match features to customer needs (e.g. "moisture-
 *     wicking" → recommend a specific product).
 *  3. (Caller adds "Currently viewing" separately if a product page.)
 *
 * Both sources are 10-min cached — `findGlobal` hits the already-
 * populated Payload cache and `getCachedProducts` wraps unstable_cache.
 * Typical output is ~3–5 KB, well within any model's context window.
 */

/** Truncate text to ~200 chars at the nearest sentence boundary. */
function truncate(text: string, max = 200): string {
  const s = text.trim().replace(/\s+/g, ' ')
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '))
  return (lastStop > max * 0.5 ? cut.slice(0, lastStop + 1) : cut).trim() + '…'
}

export async function getChatContextPack(locale: 'vi' | 'en'): Promise<string> {
  const payload = await getPayload({ config: configPromise })

  const [ctx, products] = await Promise.all([
    payload.findGlobal({ slug: 'chat-context', locale, depth: 0 }).catch(() => null) as Promise<{
      brandBio?: string | null
      sizeGuide?: string | null
      shippingPolicy?: string | null
      returnPolicy?: string | null
      contactInfo?: string | null
      siteFeatures?: string | null
      tonePrompt?: string | null
    } | null>,
    getCachedProducts({ locale })(),
  ])

  const sections: string[] = []

  if (ctx?.brandBio?.trim()) sections.push(`## About THE WHITE\n${ctx.brandBio.trim()}`)
  if (ctx?.sizeGuide?.trim()) sections.push(`## Size guide\n${ctx.sizeGuide.trim()}`)
  if (ctx?.shippingPolicy?.trim()) sections.push(`## Shipping\n${ctx.shippingPolicy.trim()}`)
  if (ctx?.returnPolicy?.trim()) sections.push(`## Returns\n${ctx.returnPolicy.trim()}`)
  if (ctx?.contactInfo?.trim()) sections.push(`## Contact\n${ctx.contactInfo.trim()}`)
  if (ctx?.siteFeatures?.trim()) sections.push(`## Website features\n${ctx.siteFeatures.trim()}`)

  if (products.length) {
    const inStockLabel = locale === 'vi' ? 'còn' : 'in stock'
    const outLabel = locale === 'vi' ? 'hết' : 'sold out'

    // Compact table for quick price/size/color lookups.
    const rows = products
      .map(
        (p) =>
          `| ${p.name} | ${p.category} | ${p.price} | ${p.sizes.join('/') || '-'} | ${
            p.colors.map((c) => c.name).join('/') || '-'
          } | ${p.inStock ? inStockLabel : outLabel} |`,
      )
      .join('\n')

    sections.push(
      `## Current catalog\n| Product | Category | Price | Sizes | Colors | Stock |\n|---|---|---|---|---|---|\n${rows}`,
    )

    // Per-product detail — features + description snippet. Helps the
    // assistant recommend the right product for a stated use case
    // ("cần quần gym thoáng khí" → match by feature keyword).
    const details = products
      .map((p) => {
        const bits: string[] = []
        if (p.features?.length) bits.push(`features: ${p.features.join(', ')}`)
        if (p.description) bits.push(`about: ${truncate(p.description, 220)}`)
        if (!bits.length) return null
        return `- **${p.name}** (${p.slug})\n  ${bits.join('\n  ')}`
      })
      .filter(Boolean)
      .join('\n')

    if (details) sections.push(`## Product details\n${details}`)
  }

  if (ctx?.tonePrompt?.trim()) sections.push(`## Tone\n${ctx.tonePrompt.trim()}`)

  return sections.join('\n\n')
}
