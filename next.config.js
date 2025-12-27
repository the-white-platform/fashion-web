import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

import redirects from './redirects.js'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      {
        hostname: 'images.unsplash.com',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  redirects,
  output: 'standalone',
  // Optimize build performance (swcMinify is enabled by default in Next.js 15)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },
  // Enable experimental features for faster builds
  experimental: {
    // Optimize package imports to reduce bundle size and build time
    optimizePackageImports: [
      '@payloadcms/ui',
      '@payloadcms/richtext-lexical',
      '@payloadcms/plugin-form-builder',
      '@payloadcms/plugin-search',
      '@payloadcms/plugin-seo',
      '@payloadcms/plugin-nested-docs',
      'lucide-react',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      'react-hook-form',
      'prism-react-renderer',
      'swr',
    ],
    // Enable server-side minification
    serverMinification: true,
  },
}

export default withPayload(withNextIntl(nextConfig))
