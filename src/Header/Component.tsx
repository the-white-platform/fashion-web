import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

export async function Header() {
  try {
    const header: Header | null = await getCachedGlobal('header', 1)()
    return <HeaderClient header={header} />
  } catch (error) {
    // During build time or when database is unavailable, render header without CMS data
    console.warn('Failed to fetch header from CMS:', error)
    return <HeaderClient header={null} />
  }
}
