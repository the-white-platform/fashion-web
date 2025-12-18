'use client'

import React from 'react'
import Image from 'next/image'

interface LogoProps {
  showSlogan?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ showSlogan = true, className }) => {
  return (
    <div className={`flex flex-col items-center lg:items-start ${className || ''}`}>
      <Image
        src="/assets/logo.jpg"
        alt="TheWhite"
        width={120}
        height={32}
        className="h-6 lg:h-8 w-auto"
        priority
      />
      {showSlogan && (
        <Image
          src="/assets/slogan.jpg"
          alt="Take Action"
          width={80}
          height={16}
          className="h-3 lg:h-4 w-auto mt-1 hidden lg:block"
          priority={false}
        />
      )}
    </div>
  )
}
