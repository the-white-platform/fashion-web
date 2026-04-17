import { HeaderClient } from './Component.client'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import type { Header } from '@/payload-types'

export async function Header() {
  let header: Header | null = null
  try {
    const locale = (await getLocale()) as 'vi' | 'en'
    // Direct Payload call instead of the `getCachedGlobal` wrapper:
    // `unstable_cache` was keying by the wrapper function identity, so
    // the first call (whichever locale hit first) poisoned the cache and
    // every subsequent request — including the other locale — received
    // the first locale's data. Payload's own request-level cache still
    // dedupes the query inside a single render; Next's route-level
    // `revalidate` handles cross-request caching.
    const payload = await getPayload({ config: configPromise })
    header = (await payload.findGlobal({
      slug: 'header',
      locale,
      depth: 1,
    })) as Header
  } catch (error) {
    // During build time or when database is unavailable, render header without CMS data
    console.warn('Failed to fetch header from CMS:', error)
  }

  return <HeaderClient header={header} />
}
