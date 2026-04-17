import type { Metadata } from 'next'

// Pointed at /demo/carousel-1.jpg (1280x589) which actually exists on
// disk. The previous /assets/logo.jpg 500'd in prod, so every Messenger
// / Zalo / iMessage link preview rendered the empty dark box.
//
// TODO (design): replace with a purpose-built 1200x630 branded OG card
// (wordmark + product shot + tagline). Drop it at public/og/default.jpg
// and update the three constants below. A hero photo without the brand
// mark is a stopgap — the wordmark should be baked into the image for
// social previews.
const DEFAULT_OG_IMAGE = '/demo/carousel-1.jpg'
const DEFAULT_OG_IMAGE_WIDTH = 1280
const DEFAULT_OG_IMAGE_HEIGHT = 589

const absolute = (path: string): string => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL
  return base ? `${base}${path}` : path
}

const DESCRIPTIONS: Record<string, string> = {
  vi: 'TheWhite — Thời trang thể thao hiện đại, tối giản, bền bỉ. Khám phá bộ sưu tập mới nhất.',
  en: 'TheWhite — modern, minimalist, durable activewear. Discover our latest collection.',
}

const OG_LOCALES: Record<string, string> = {
  vi: 'vi_VN',
  en: 'en_US',
}

const buildDefaultOpenGraph = (locale: string = 'vi'): Metadata['openGraph'] => ({
  type: 'website',
  description: DESCRIPTIONS[locale] ?? DESCRIPTIONS.vi,
  images: [
    {
      url: absolute(DEFAULT_OG_IMAGE),
      width: DEFAULT_OG_IMAGE_WIDTH,
      height: DEFAULT_OG_IMAGE_HEIGHT,
      alt: 'TheWhite — Modern athletic apparel',
      type: 'image/jpeg',
    },
  ],
  siteName: 'TheWhite',
  title: 'TheWhite — Take Action',
  locale: OG_LOCALES[locale] ?? OG_LOCALES.vi,
  alternateLocale: locale === 'vi' ? ['en_US'] : ['vi_VN'],
})

type MergeOpenGraphInput = Metadata['openGraph'] & { locale?: string }

export const mergeOpenGraph = (
  input?: MergeOpenGraphInput | { locale?: string },
): Metadata['openGraph'] => {
  const locale = (input as { locale?: string } | undefined)?.locale ?? 'vi'
  const { locale: _omit, ...og } = (input ?? {}) as MergeOpenGraphInput
  const base = buildDefaultOpenGraph(locale)
  return {
    ...base,
    ...og,
    images: og?.images ? og.images : base!.images,
  }
}
