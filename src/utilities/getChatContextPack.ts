import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getCachedProducts } from './getProducts'

/**
 * Assemble the Wolfies assistant's per-turn grounding into a single
 * Markdown string. Three sources:
 *
 *  1. `chat-context` global (brand bio, size guide, policies, tone).
 *  2. A compact catalog table from `products`.
 *  3. (Caller adds "Currently viewing" separately if a product page.)
 *
 * Both sources are 10-min cached — `findGlobal` hits the already-
 * populated Payload cache and `getCachedProducts` wraps unstable_cache.
 * Typical output is ~2–3 KB, well within any model's context window.
 */
export async function getChatContextPack(locale: 'vi' | 'en'): Promise<string> {
  const payload = await getPayload({ config: configPromise })

  const [ctx, products] = await Promise.all([
    payload.findGlobal({ slug: 'chat-context', locale, depth: 0 }).catch(() => null) as Promise<{
      brandBio?: string | null
      sizeGuide?: string | null
      shippingPolicy?: string | null
      returnPolicy?: string | null
      contactInfo?: string | null
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

  if (products.length) {
    const inStockLabel = locale === 'vi' ? 'còn' : 'in stock'
    const outLabel = locale === 'vi' ? 'hết' : 'sold out'
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
  }

  if (ctx?.tonePrompt?.trim()) sections.push(`## Tone\n${ctx.tonePrompt.trim()}`)

  return sections.join('\n\n')
}
