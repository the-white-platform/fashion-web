'use client'

import { GlobalModals } from './GlobalModals'
import type { Header } from '@/payload-types'
import { useEffect, useState } from 'react'

export function GlobalModalsWrapper() {
  const [header, setHeader] = useState<Header | null>(null)

  useEffect(() => {
    // Fetch header data from API for client-side use
    const fetchHeader = async () => {
      try {
        const response = await fetch('/api/globals/header')
        if (response.ok) {
          const data = await response.json()
          setHeader(data)
        }
      } catch (error) {
        console.warn('Failed to fetch header for modals:', error)
      }
    }
    fetchHeader()
  }, [])

  return <GlobalModals header={header} />
}
