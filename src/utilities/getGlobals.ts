import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Global = keyof Config['globals']
type Locale = 'vi' | 'en'

// `locale` is optional so existing callers keep working — when omitted,
// Payload returns the default locale (vi) with fallback. Wire callers
// through to pass the active locale when they know it.
async function getGlobal(slug: Global, locale?: Locale, depth = 0) {
  try {
    const payload = await getPayload({ config: configPromise })

    const global = await payload.findGlobal({
      slug,
      depth,
      ...(locale ? { locale } : {}),
    })

    return global
  } catch (error) {
    // During build time or when database is unavailable, return null
    console.warn(`Failed to fetch global "${slug}" from CMS:`, error)
    return null
  }
}

/**
 * @deprecated Use `payload.findGlobal({ slug, locale, depth })` directly.
 *
 * The `unstable_cache` wrapper here was keying by the wrapper function
 * identity, which caused cross-locale cache poisoning: the first locale
 * that rendered populated the cache, and every subsequent render — even
 * for the other locale — got the cached response. Callers should call
 * Payload directly and rely on route-level `revalidate` for caching.
 *
 * Kept here for any external import until the next major refactor.
 */
export function getCachedGlobal(slug: Global, depth?: number): () => Promise<unknown>
export function getCachedGlobal(
  slug: Global,
  locale: Locale,
  depth?: number,
): () => Promise<unknown>
export function getCachedGlobal(
  slug: Global,
  localeOrDepth?: Locale | number,
  maybeDepth?: number,
) {
  const locale: Locale | undefined = typeof localeOrDepth === 'string' ? localeOrDepth : undefined
  const depth: number = typeof localeOrDepth === 'number' ? localeOrDepth : (maybeDepth ?? 0)
  const cacheKey = [slug, locale ?? 'default']
  const tag = locale ? `global_${slug}_${locale}` : `global_${slug}`
  return unstable_cache(async () => getGlobal(slug, locale, depth), cacheKey, { tags: [tag] })
}
