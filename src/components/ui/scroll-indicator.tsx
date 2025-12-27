'use client'

import * as React from 'react'
import { cn } from '@/utilities/cn'

interface ScrollIndicatorProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
  hideScrollbar?: boolean
  withShadows?: boolean
}

/**
 * A component that provides a scrollable area with optional invisible scrollbars
 * and top/bottom shadow indicators to show there is more content.
 * Fixes layout flicker caused by disappearing scrollbars when overlays/modals open.
 */
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  children,
  className,
  innerClassName,
  hideScrollbar = true,
  withShadows = true,
}) => {
  const [showTopShadow, setShowTopShadow] = React.useState(false)
  const [showBottomShadow, setShowBottomShadow] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleScroll = React.useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current

    // Using a small buffer (5px) to prevent flickering on edge cases
    setShowTopShadow(scrollTop > 5)
    setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 5)
  }, [])

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    handleScroll()
    container.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)

    // Check when content changes (e.g. images load, dynamic content)
    const observer = new MutationObserver(handleScroll)
    observer.observe(container, { childList: true, subtree: true, characterData: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      observer.disconnect()
    }
  }, [handleScroll])

  return (
    <div className={cn('relative flex flex-col min-h-0 w-full h-full', className)}>
      {withShadows && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-16 z-20 pointer-events-none transition-opacity duration-500',
            'bg-gradient-to-b from-background via-background/10 to-transparent',
            showTopShadow ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden min-h-0',
          hideScrollbar && 'scrollbar-hide',
          innerClassName,
        )}
      >
        {children}
      </div>

      {withShadows && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-16 z-20 pointer-events-none transition-opacity duration-500',
            'bg-gradient-to-t from-background via-background/10 to-transparent',
            showBottomShadow ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  )
}
