'use client'

import React from 'react'
import Image from 'next/image'

interface LogoProps {
  showSlogan?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ showSlogan = true, className }) => {
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      {/* Logo Image */}
      <Image
        src="/logo.png"
        alt="The White Logo"
        width={40}
        height={40}
        className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
      />
      {/* Text */}
      <div className="flex flex-col items-start">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-wider font-white">THE WHITE</h1>
        {showSlogan && (
          <p className="text-xs lg:text-sm mt-0.5 tracking-[0.2em] font-white block uppercase">
            TAKE ACTION
          </p>
        )}
      </div>
    </div>
  )
}
