"use client"

import Image from "next/image"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface SmartImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  loading?: "lazy" | "eager"
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  imageType?: "hero" | "thumbnail" | "regular" | "avatar"
  onLoad?: () => void
  onError?: () => void
}

// Generate LQIP (Low Quality Image Placeholder) from dimensions
function generateLQIP(width: number = 400, height: number = 300): string {
  // SVG-based LQIP for better quality than data URL
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <circle cx="50%" cy="40%" r="20%" fill="#d1d5db" opacity="0.3" />
      <rect x="20%" y="70%" width="60%" height="8%" fill="#d1d5db" opacity="0.4" rx="4%" />
      <rect x="20%" y="80%" width="40%" height="6%" fill="#d1d5db" opacity="0.3" rx="3%" />
    </svg>
  `.trim()
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Smart quality based on image type
function getSmartQuality(imageType: SmartImageProps['imageType']): number {
  switch (imageType) {
    case 'hero':
      return 85  // High quality for hero images
    case 'thumbnail':
      return 60  // Lower quality for thumbnails
    case 'avatar':
      return 70  // Medium quality for avatars
    case 'regular':
    default:
      return 75  // Standard quality
  }
}

// Responsive sizes based on image type
function getResponsiveSizes(imageType: SmartImageProps['imageType']): string {
  switch (imageType) {
    case 'hero':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
    case 'thumbnail':
      return '(max-width: 768px) 150px, 200px'
    case 'avatar':
      return '(max-width: 768px) 40px, 60px'
    case 'regular':
    default:
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px'
  }
}

export function SmartImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority = false,
  quality,
  sizes,
  loading = "lazy",
  placeholder = "blur",
  blurDataURL,
  imageType = "regular",
  onLoad,
  onError,
  ...props
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Use smart quality if not provided
  const finalQuality = quality ?? getSmartQuality(imageType)
  
  // Use responsive sizes if not provided
  const finalSizes = sizes ?? getResponsiveSizes(imageType)
  
  // Generate LQIP if not provided and placeholder is blur
  const finalBlurDataURL = blurDataURL ?? (
    placeholder === "blur" ? generateLQIP(width, height) : undefined
  )

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Fallback for error state
  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400",
          className
        )}
        style={{ width, height }}
      >
        <svg 
          className="w-8 h-8" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        quality={finalQuality}
        sizes={finalSizes}
        loading={loading}
        placeholder={placeholder}
        blurDataURL={finalBlurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          fill ? "object-cover" : undefined
        )}
        {...props}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800",
          "animate-pulse"
        )}>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// Specialized components for different use cases
export function HeroImage(props: Omit<SmartImageProps, 'imageType' | 'priority'>) {
  return <SmartImage {...props} imageType="hero" priority />
}

export function ThumbnailImage(props: Omit<SmartImageProps, 'imageType'>) {
  return <SmartImage {...props} imageType="thumbnail" />
}

export function AvatarImage(props: Omit<SmartImageProps, 'imageType'>) {
  return <SmartImage {...props} imageType="avatar" />
}

export function RegularImage(props: Omit<SmartImageProps, 'imageType'>) {
  return <SmartImage {...props} imageType="regular" />
}
