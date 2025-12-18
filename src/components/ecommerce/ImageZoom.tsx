'use client'

import { useState, useRef, MouseEvent } from 'react'
import Image from 'next/image'

interface ImageZoomProps {
  src: string
  alt: string
  className?: string
  zoomLevel?: number
  width?: number
  height?: number
}

export function ImageZoom({
  src,
  alt,
  className = '',
  zoomLevel = 2,
  width,
  height,
}: ImageZoomProps) {
  const [isZooming, setIsZooming] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomPosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsZooming(true)
  }

  const handleMouseLeave = () => {
    setIsZooming(false)
  }

  return (
    <div className="relative overflow-hidden group">
      {/* Main Image */}
      <div
        ref={imageRef}
        className={`relative ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {width && height ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: isZooming ? 0.7 : 1 }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover transition-opacity duration-300"
              style={{ opacity: isZooming ? 0.7 : 1 }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        {/* Zoomed Preview Overlay */}
        {isZooming && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: `${zoomLevel * 100}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
      </div>

      {/* Zoom Indicator */}
      <div
        className={`absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-sm text-xs uppercase tracking-wide transition-opacity duration-300 z-20 ${
          isZooming ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Zoom {zoomLevel}x
      </div>

      {/* Hover Hint */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1 rounded-sm text-xs uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        Di chuột để phóng to
      </div>
    </div>
  )
}
