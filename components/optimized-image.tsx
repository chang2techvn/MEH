"use client"

import { useState, useEffect, useRef } from "react"
import Image, { type ImageProps } from "next/image"
import { getOptimizedImageParams } from "@/lib/image-optimization"

interface OptimizedImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string
  alt: string
  width: number
  height: number
  fallbackSrc?: string
  lazyBoundary?: string
  blurhash?: string
  aspectRatio?: number
  priority?: boolean
  fetchPriority?: "high" | "low" | "auto"
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fallbackSrc = "/placeholder.svg",
  lazyBoundary = "200px",
  blurhash,
  aspectRatio,
  priority = false,
  fetchPriority = "auto",
  className = "",
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Get optimized parameters
  const optimizedParams = getOptimizedImageParams({
    src,
    width,
    height,
    priority,
  })

  // Calculate aspect ratio if not provided
  const calculatedAspectRatio = aspectRatio || (height / width) * 100

  // Handle image load error
  const handleError = () => {
    setError(true)
    if (fallbackSrc && fallbackSrc !== src) {
      setImgSrc(fallbackSrc)
    }
  }

  // Handle image load success
  const handleLoad = () => {
    setIsLoaded(true)
  }

  // Use Intersection Observer for advanced lazy loading
  useEffect(() => {
    if (!imgRef.current || priority) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // When image is about to enter viewport, set the real src
            if (error && fallbackSrc) {
              setImgSrc(fallbackSrc)
            } else {
              setImgSrc(src)
            }
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: lazyBoundary,
        threshold: 0.01,
      },
    )

    observer.observe(imgRef.current)

    return () => {
      observer.disconnect()
    }
  }, [src, fallbackSrc, error, lazyBoundary, priority])

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ paddingBottom: `${calculatedAspectRatio}%` }}
      data-testid="optimized-image-container"
    >
      {blurhash && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-md scale-110"
          style={{ backgroundImage: `url(${blurhash})` }}
          aria-hidden="true"
        />
      )}

      <Image
        ref={imgRef}
        src={priority ? src : imgSrc}
        alt={alt}
        width={optimizedParams.width}
        height={optimizedParams.height}
        onError={handleError}
        onLoad={handleLoad}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={fetchPriority}
        quality={optimizedParams.quality}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width}px`}
        decoding={priority ? "sync" : "async"}
        {...props}
      />

      {!isLoaded && !blurhash && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
          aria-hidden="true"
          style={{
            backgroundSize: `${width}px ${height}px`,
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  )
}
