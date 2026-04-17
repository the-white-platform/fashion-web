import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from 'next-intl/server'
import React from 'react'

import type { Header } from '@/payload-types'

export async function Header() {
  let header: Header | null = null
  try {
    const locale = (await getLocale()) as 'vi' | 'en'
    header = (await getCachedGlobal('header', locale, 1)()) as Header | null
  } catch (error) {
    // During build time or when database is unavailable, render header without CMS data
    console.warn('Failed to fetch header from CMS:', error)
  }

  return <HeaderClient header={header} />
}
