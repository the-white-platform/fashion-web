'use client'

import { GlobalModals } from './GlobalModals'
import type { Header } from '@/payload-types'

interface GlobalModalsWrapperProps {
  header: Header | null
}

export function GlobalModalsWrapper({ header }: GlobalModalsWrapperProps) {
  return <GlobalModals header={header} />
}
