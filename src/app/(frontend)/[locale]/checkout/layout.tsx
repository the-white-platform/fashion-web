'use client'

import { useEffect } from 'react'
import { useHeaderTheme } from '@/providers/HeaderTheme'

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const { setHeaderHidden } = useHeaderTheme()

  useEffect(() => {
    // Hide header when entering checkout
    setHeaderHidden(true)

    // Show header when leaving checkout
    return () => {
      setHeaderHidden(false)
    }
  }, [setHeaderHidden])

  return <>{children}</>
}
