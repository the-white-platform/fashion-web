import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://thewhite.cool'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/',
          '/_next/data/',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/profile',
          '/profile/*',
          '/orders',
          '/orders/*',
          '/wishlist',
          '/return-request',
          '/unsubscribe',
          '/search',
          '/compare',
          '/next/preview',
          '/next/exit-preview',
          // Block common bot probe paths so we waste no crawl budget on them.
          '/wp-admin/',
          '/wp-login.php',
          '/wp-content/',
          '/xmlrpc.php',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
