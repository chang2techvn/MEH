"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ResponsiveImageProps {
  src: string
  alt: string
  sizes?: string
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  width?: number
  height?: number
  fill?: boolean
  loading?: "eager" | "lazy"
}

export default function ResponsiveImage({
  src,
  alt,
  sizes = "100vw",
  className = "",
  priority = false,
  quality = 75,
  placeholder,
  blurDataURL,
  width,
  height,
  fill = false,
  loading,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imgSrc, setImgSrc] = useState(src)
  const [imgError, setImgError] = useState(false)

  // Handle image errors
  useEffect(() => {
    if (imgError) {
      // Set a fallback image if the original fails to load
      setImgSrc("/placeholder.svg?height=400&width=600")
    }
  }, [imgError])

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(src)
    setImgError(false)
    setIsLoaded(false)
  }, [src])

  // Generate a placeholder blur data URL if not provided
  const generatedBlurDataURL =
    !blurDataURL && placeholder === "blur"
      ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+"
      : blurDataURL

  return (
    <div className={`relative ${className} ${!isLoaded ? "bg-gray-200 dark:bg-gray-800 animate-pulse" : ""}`}>
      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={generatedBlurDataURL}
        width={width}
        height={height}
        fill={fill}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setImgError(true)}
        className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  )
}
