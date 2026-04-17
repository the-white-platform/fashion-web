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

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'TheWhite — Thời trang thể thao hiện đại, tối giản, bền bỉ. Khám phá bộ sưu tập mới nhất.',
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
  locale: 'vi_VN',
  alternateLocale: ['en_US'],
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
