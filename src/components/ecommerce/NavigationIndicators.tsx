'use client'

import { motion } from 'motion/react'

interface NavigationIndicatorsProps {
  totalSections: number
  currentSection: number
  onNavigate: (index: number) => void
}

export function NavigationIndicators({
  totalSections,
  currentSection,
  onNavigate,
}: NavigationIndicatorsProps) {
  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
      role="navigation"
      aria-label="Section navigation"
    >
      {Array.from({ length: totalSections }).map((_, index) => (
        <button
          key={index}
          onClick={() => onNavigate(index)}
          className="group relative"
          aria-label={`Go to section ${index + 1}`}
          aria-current={index === currentSection ? 'true' : 'false'}
        >
          <motion.div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSection
                ? 'bg-primary scale-125'
                : 'bg-muted-foreground/40 hover:bg-foreground hover:scale-110'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
          {/* Tooltip */}
          <span className="absolute right-6 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Section {index + 1}
          </span>
        </button>
      ))}
    </div>
  )
}
