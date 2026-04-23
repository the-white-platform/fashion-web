import type { Metadata } from 'next'

import type { Page, Post } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'

type Locale = 'vi' | 'en'

interface GenerateMetaArgs {
  doc: Page | Post | null | undefined
  locale: Locale
  /**
   * Path WITHOUT the locale prefix, e.g. `/posts/my-slug` or
   * `/about-us`. The `/{locale}` prefix is prepended by the
   * canonical + hreflang builder.
   */
  path: string
}

function absoluteUrl(pathname: string): string {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool').replace(/\/+$/, '')
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${base}${p}`
}

/**
 * Build Next.js `Metadata` for a Payload Page or Post.
 *
 * Emits a self-canonical (`/{locale}{path}`) and the matching
 * hreflang cluster (`vi-VN`, `en-US`, `x-default`). Without this
 * every post inherited the layout's `/{locale}` canonical, which
 * Google Search Console flagged as "duplicate page, user-selected
 * canonical missing".
 */
export const generateMeta = async (args: GenerateMetaArgs): Promise<Metadata> => {
  const { doc, locale, path } = args

  const ogImage =
    typeof doc?.meta?.image === 'object' &&
    doc.meta.image !== null &&
    'url' in doc.meta.image &&
    `${process.env.NEXT_PUBLIC_SERVER_URL}${doc.meta.image.url}`

  const title = doc?.meta?.title ? doc?.meta?.title + ' | THE WHITE' : 'THE WHITE'

  const canonical = absoluteUrl(`/${locale}${path}`)

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: canonical,
    }),
    title,
    alternates: {
      canonical,
      languages: {
        'vi-VN': absoluteUrl(`/vi${path}`),
        'en-US': absoluteUrl(`/en${path}`),
        'x-default': absoluteUrl(`/vi${path}`),
      },
    },
  }
}
