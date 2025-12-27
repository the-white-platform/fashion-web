'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/utilities/cn'

/**
 * A component that adds top and bottom shadow indicators to the entire page
 * based on the window scroll position. This provides visual feedback for
 * scrollability when the native scrollbar is hidden.
 */
export function PageScrollIndicator() {
  const [showTopShadow, setShowTopShadow] = useState(false)
  const [showBottomShadow, setShowBottomShadow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight

      // We use a small buffer to avoid flickering
      setShowTopShadow(scrollTop > 10)
      setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 10)
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    // Observe changes in content height (e.g. dynamic loading, images)
    const observer = new MutationObserver(handleScroll)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* Top Shadow - Fixed below header level usually, but since it's an indicator, we can put it high */}
      <div
        className={cn(
          'fixed top-0 left-0 right-0 h-20 z-[60] pointer-events-none transition-opacity duration-700 ease-in-out',
          'bg-gradient-to-b from-background via-background/20 to-transparent',
          showTopShadow ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Bottom Shadow */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 h-20 z-[60] pointer-events-none transition-opacity duration-700 ease-in-out',
          'bg-gradient-to-t from-background via-background/20 to-transparent',
          showBottomShadow ? 'opacity-100' : 'opacity-0',
        )}
      />
    </>
  )
}
