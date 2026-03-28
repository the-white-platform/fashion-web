import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

export async function Header() {
  let header: Header | null = null
  try {
    header = await getCachedGlobal('header', 1)()
  } catch (error) {
    // During build time or when database is unavailable, render header without CMS data
    console.warn('Failed to fetch header from CMS:', error)
  }

  return <HeaderClient header={header} />
}
