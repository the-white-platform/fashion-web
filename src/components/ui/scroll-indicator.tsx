'use client'

import * as React from 'react'
import { cn } from '@/utilities/cn'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface ScrollIndicatorProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
  hideScrollbar?: boolean
  withShadows?: boolean
  withScrollButtons?: boolean
}

/**
 * A component that provides a scrollable area with optional invisible scrollbars
 * and top/bottom shadow indicators to show there is more content.
 * Optionally shows scroll up/down buttons for better UX.
 * Fixes layout flicker caused by disappearing scrollbars when overlays/modals open.
 */
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  children,
  className,
  innerClassName,
  hideScrollbar = true,
  withShadows = true,
  withScrollButtons = true,
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

  const scrollTo = React.useCallback((direction: 'up' | 'down') => {
    if (!containerRef.current) return
    const container = containerRef.current
    const scrollAmount = container.clientHeight * 0.8 // Scroll 80% of visible height

    container.scrollBy({
      top: direction === 'down' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    })
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

      {/* Scroll Up Button */}
      {withScrollButtons && (
        <AnimatePresence>
          {showTopShadow && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={() => scrollTo('up')}
              className="absolute top-2 left-1/2 -translate-x-1/2 z-30 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-accent transition-colors shadow-md"
              aria-label="Scroll up"
            >
              <motion.div
                animate={{ y: [-2, 0, -2] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronUp className="w-4 h-4 text-foreground" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
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

      {/* Scroll Down Button */}
      {withScrollButtons && (
        <AnimatePresence>
          {showBottomShadow && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={() => scrollTo('down')}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-accent transition-colors shadow-md"
              aria-label="Scroll down"
            >
              <motion.div
                animate={{ y: [0, 2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-4 h-4 text-foreground" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
