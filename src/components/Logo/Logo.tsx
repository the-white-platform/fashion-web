'use client'

import React from 'react'

interface LogoProps {
  showSlogan?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ showSlogan = true, className }) => {
  return (
    <div className={`flex flex-col items-center lg:items-start ${className || ''}`}>
      <h1 className="text-2xl lg:text-3xl font-bold tracking-wider text-white">THE WHITE</h1>
      {showSlogan && (
        <p className="text-xs lg:text-sm text-gray-300 mt-1 hidden lg:block tracking-wide">
          TAKE ACTION
        </p>
      )}
    </div>
  )
}
