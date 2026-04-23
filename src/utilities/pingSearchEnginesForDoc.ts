import { pingIndexNow } from './indexNow'

const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool').replace(/\/+$/, '')

/**
 * Build vi + en URLs for a collection doc and ping IndexNow so
 * Bing / Yandex crawl the change immediately. Fire-and-forget —
 * the hook that calls it never awaits.
 */
export async function pingSearchEnginesForDoc(
  collection: 'products' | 'posts' | 'pages',
  slugOrId: string,
): Promise<void> {
  const path =
    collection === 'products'
      ? `/products/${slugOrId}`
      : collection === 'posts'
        ? `/posts/${slugOrId}`
        : slugOrId === 'home'
          ? ''
          : `/${slugOrId}`
  const urls = [`${BASE_URL}/vi${path}`, `${BASE_URL}/en${path}`]
  await pingIndexNow(urls)
}
