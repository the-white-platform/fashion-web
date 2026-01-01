'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'

interface LogoProps {
  showSlogan?: boolean
  className?: string
}

// Animation timing (matches W.svg CSS animation)
const TOTAL_ANIMATION_DURATION = 1.2

export const Logo: React.FC<LogoProps> = ({ showSlogan = true, className }) => {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only animating after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      {/* W Logo - Animation is embedded in the SVG file */}
      <motion.div className="w-12 h-8 lg:w-14 lg:h-10">
        <Image
          src="/logo/W.svg"
          alt="The White Logo"
          width={56}
          height={40}
          className="w-full h-full dark:invert"
          priority
        />
      </motion.div>

      {/* Text */}
      <div className="flex flex-col items-center">
        <motion.h1
          initial={{ opacity: mounted ? 0 : 1, y: mounted ? -20 : 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: mounted ? TOTAL_ANIMATION_DURATION + 0.1 : 0,
            ease: [0.33, 1, 0.68, 1],
          }}
          className="text-2xl lg:text-3xl font-bold tracking-wider font-white"
        >
          THE WHITE
        </motion.h1>
        {showSlogan && (
          <motion.div
            initial={{ opacity: mounted ? 0 : 1, y: mounted ? 10 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: mounted ? TOTAL_ANIMATION_DURATION + 0.2 : 0,
              ease: [0.33, 1, 0.68, 1],
            }}
            className="flex w-full text-muted-foreground justify-between mt-0.5 font-white uppercase text-xs lg:text-sm"
          >
            {'TAKE ACTION'.split('').map((char, index) => (
              <span key={index}>{char === ' ' ? '\u00A0' : char}</span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
