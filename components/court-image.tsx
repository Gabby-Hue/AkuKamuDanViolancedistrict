'use client'

import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'

interface CourtImageProps {
  src: string
  alt: string
  fallbackId: string
}

export default function CourtImage({ src, alt, fallbackId }: CourtImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Don't render img if src is empty or null
  if (!src || src.trim() === '') {
    return (
      <div className="aspect-video bg-muted relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-video bg-muted relative">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-200"
        style={{
          display: imageLoaded && !imageError ? 'block' : 'none',
          opacity: imageLoaded ? 1 : 0
        }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      {!imageLoaded || imageError ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
        </div>
      ) : null}
    </div>
  )
}