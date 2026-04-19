import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type Locale = 'vi' | 'en'

const LOCALES: Locale[] = ['vi', 'en']

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'

// Public, indexable static routes — auth/checkout/account routes are excluded
// because robots.ts disallows them.
const STATIC_PATHS = [
  '',
  '/products',
  '/posts',
  '/contact',
  '/faq',
  '/shipping',
  '/return-policy',
  '/terms-of-use',
  '/privacy-policy',
  '/loyalty',
  '/shopping-guide',
  '/payment-shipping',
] as const

function localizedAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const loc of LOCALES) {
    languages[loc === 'vi' ? 'vi-VN' : 'en-US'] = `${SITE_URL}/${loc}${path}`
  }
  // x-default points at the Vietnamese version (default locale)
  languages['x-default'] = `${SITE_URL}/vi${path}`
  return languages
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  const now = new Date()

  for (const path of STATIC_PATHS) {
    for (const loc of LOCALES) {
      entries.push({
        url: `${SITE_URL}/${loc}${path}`,
        lastModified: now,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1.0 : 0.7,
        alternates: { languages: localizedAlternates(path) },
      })
    }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const products = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 1000,
      pagination: false,
    })

    for (const p of products.docs) {
      const slugOrId = p.slug || p.id
      const path = `/products/${slugOrId}`
      const lastMod = p.updatedAt ? new Date(p.updatedAt) : now
      for (const loc of LOCALES) {
        entries.push({
          url: `${SITE_URL}/${loc}${path}`,
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: { languages: localizedAlternates(path) },
        })
      }
    }

    const posts = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { _status: { equals: 'published' } },
    })

    for (const post of posts.docs) {
      if (!post.slug) continue
      const path = `/posts/${post.slug}`
      const lastMod = post.updatedAt ? new Date(post.updatedAt) : now
      for (const loc of LOCALES) {
        entries.push({
          url: `${SITE_URL}/${loc}${path}`,
          lastModified: lastMod,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: { languages: localizedAlternates(path) },
        })
      }
    }

    const pages = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { _status: { equals: 'published' } },
    })

    for (const page of pages.docs) {
      if (!page.slug || page.slug === 'home') continue
      const path = `/${page.slug}`
      const lastMod = page.updatedAt ? new Date(page.updatedAt) : now
      for (const loc of LOCALES) {
        entries.push({
          url: `${SITE_URL}/${loc}${path}`,
          lastModified: lastMod,
          changeFrequency: 'monthly',
          priority: 0.5,
          alternates: { languages: localizedAlternates(path) },
        })
      }
    }
  } catch {
    // DB unreachable during build — fall back to static entries only.
  }

  return entries
}
