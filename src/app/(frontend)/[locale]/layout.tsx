import type { Metadata } from 'next'

import { cn } from 'src/utilities/cn'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/layout/Footer/Component'
import { Header } from '@/components/layout/Header/Component'
import { FloatingActions } from '@/components/ecommerce/FloatingActions'
import { Cart } from '@/components/ecommerce/Cart'
import { GlobalModalsWrapper } from '@/components/ecommerce/GlobalModalsWrapper'
import { CompareBar } from '@/components/ecommerce/CompareBar'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header as HeaderType } from '@/payload-types'

import '../globals.css'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// The White font - configured with multiple weights
const theWhite = localFont({
  src: [
    {
      path: '../../../fonts/the-white-light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../../fonts/the-white-regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../fonts/the-white-bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../../fonts/the-white-italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../../fonts/the-white-bold-italic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../../fonts/the-white-light-italic.otf',
      weight: '300',
      style: 'italic',
    },
  ],
  variable: '--font-white',
  display: 'swap',
  fallback: ['serif'],
})

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: Props) {
  const { isEnabled } = await draftMode()
  const { locale } = await params
  const messages = await getMessages()
  const tMeta = await getTranslations({ locale, namespace: 'meta.rootLayout' })
  const orgDescription = tMeta('orgDescription')

  let headerData: HeaderType | null = null
  try {
    headerData = (await getCachedGlobal('header', locale as 'vi' | 'en', 1)()) as HeaderType | null
  } catch {
    // Header data unavailable during build or when DB is unreachable
  }

  return (
    <html className={cn(inter.variable, theWhite.variable)} lang={locale} suppressHydrationWarning>
      <head>
        {/* Zalo Platform site verification — keep early in <head> so
            Zalo's crawler finds it within its 512KB head-scan budget. */}
        <meta
          name="zalo-platform-site-verification"
          content="EjcV1Cl65Lq1zQvzXS8YOth3iZgMjMTdCJSs"
        />
        <InitTheme />
        <link rel="preload" href="/logo/W.svg" as="image" type="image/svg+xml" />
        {/* Organization schema — helps Google/LinkedIn render richer
            link previews (brand name, logo, social profiles). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'TheWhite',
              alternateName: 'The White',
              url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool',
              logo: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'}/logo/W.svg`,
              description: orgDescription,
              sameAs: ['https://www.facebook.com/thewhite', 'https://www.instagram.com/thewhite'],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'TheWhite',
              url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool',
              inLanguage: ['vi-VN', 'en-US'],
              potentialAction: {
                '@type': 'SearchAction',
                target: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="relative font-sans antialiased">
        {/* Noisy Background Texture - matching prototype */}
        <div className="fixed inset-0 opacity-40 pointer-events-none mix-blend-multiply z-0">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.8'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }}
          />
        </div>
        <div className="relative z-10 min-h-screen">
          <NextIntlClientProvider messages={messages} locale={locale}>
            <Providers>
              <ProgressBar />
              <AdminBar
                adminBarProps={{
                  preview: isEnabled,
                }}
              />
              <LivePreviewListener />

              <Header />
              <FloatingActions />
              <Cart />
              <GlobalModalsWrapper header={headerData} />
              <CompareBar />
              <div className="pt-0">{children}</div>
              <Footer />
            </Providers>
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const tMeta = await getTranslations({ locale, namespace: 'meta.rootLayout' })

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'),
    title: {
      default: tMeta('titleDefault'),
      template: tMeta('titleTemplate'),
    },
    description: tMeta('description'),
    applicationName: 'TheWhite',
    keywords: [
      // Vietnamese keywords help SEO on both locales — search engines
      // match original terms regardless of the browsing language.
      'thời trang thể thao',
      'activewear',
      'gym',
      'training',
      'sportswear',
      'The White',
      'thời trang nam',
      'thời trang Việt',
    ],
    openGraph: mergeOpenGraph({ locale }),
    twitter: {
      card: 'summary_large_image',
      creator: '@thewhite',
      site: '@thewhite',
      title: tMeta('twitterTitle'),
      description: tMeta('twitterDescription'),
      images: ['/demo/carousel-1.jpg'],
    },
    icons: {
      icon: [
        { url: '/logo/W-dark.ico', media: '(prefers-color-scheme: light)' },
        { url: '/logo/W-light.ico', media: '(prefers-color-scheme: dark)' },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
  }
}
