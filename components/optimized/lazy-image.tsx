"use client"

import { SmartImage } from "./smart-image"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

interface LazyImageProps {
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
  rootMargin?: string
  threshold?: number
  triggerOnce?: boolean
  fallbackSrc?: string
  loadingComponent?: React.ReactNode
}

export function LazyImage({
  rootMargin = "100px", // Start loading 100px before entering viewport
  threshold = 0,
  triggerOnce = true,
  fallbackSrc = "/placeholder.svg",
  loadingComponent,
  className,
  width,
  height,
  src,
  alt,
  ...imageProps
}: LazyImageProps) {
  const { setElement, shouldLoad } = useIntersectionObserver({
    rootMargin,
    threshold,
    triggerOnce,
  })

  // Show loading component while not in viewport
  if (!shouldLoad) {
    return (
      <div
        ref={setElement}
        className={cn(
          "flex items-center justify-center bg-gray-100 dark:bg-gray-800",
          className
        )}
        style={{ 
          width,
          height,
        }}
      >
        {loadingComponent || (
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    )
  }

  // Once in viewport, render the actual image
  return (
    <SmartImage
      {...imageProps}
      src={src || fallbackSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}

// Specialized lazy components
export function LazyHeroImage(props: Omit<LazyImageProps, 'imageType' | 'priority'>) {
  return <LazyImage {...props} imageType="hero" priority={false} />
}

export function LazyThumbnailImage(props: Omit<LazyImageProps, 'imageType'>) {
  return <LazyImage {...props} imageType="thumbnail" />
}

export function LazyAvatarImage(props: Omit<LazyImageProps, 'imageType'>) {
  return <LazyImage {...props} imageType="avatar" />
}

export function LazyRegularImage(props: Omit<LazyImageProps, 'imageType'>) {
  return <LazyImage {...props} imageType="regular" />
}
