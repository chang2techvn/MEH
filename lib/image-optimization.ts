/**
 * Utility functions for image optimization
 */

/**
 * Get optimized image parameters based on device and network
 */
export function getOptimizedImageParams(options: {
  src: string
  width: number
  height: number
  quality?: number
  format?: "webp" | "avif" | "jpeg" | "png"
  priority?: boolean
}) {
  // Default values
  const defaultParams = {
    width: options.width,
    height: options.height,
    quality: 75, // Reduced default quality from 80 to 75
    format: "webp" as const,
    priority: false,
  }

  // Merge with provided options
  const params = { ...defaultParams, ...options }

  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return params
  }

  // Adjust quality based on connection
  if ("connection" in navigator && (navigator as any).connection) {
    const connection = (navigator as any).connection

    if (connection.saveData) {
      params.quality = 60
      params.width = Math.round(params.width * 0.8) // Reduce dimensions by 20% on save-data
      params.height = Math.round(params.height * 0.8)
    } else if (connection.effectiveType === "4g") {
      params.quality = 75
    } else if (connection.effectiveType === "3g") {
      params.quality = 65
      params.width = Math.round(params.width * 0.9) // Reduce dimensions by 10% on 3G
      params.height = Math.round(params.height * 0.9)
    } else {
      params.quality = 60
      params.width = Math.round(params.width * 0.8) // Reduce dimensions by 20% on slower connections
      params.height = Math.round(params.height * 0.8)
    }
  }

  // Use modern formats if supported
  if (
    "connection" in navigator &&
    (navigator as any).connection &&
    (navigator as any).connection.effectiveType === "4g"
  ) {
    // Check for AVIF support
    if (typeof window !== "undefined" && window.document && "createElement" in window.document) {
      try {
        const canvas = document.createElement("canvas")
        if (canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0) {
          params.format = "avif"
        }
      } catch (e) {
        // Format not supported, continue with default
      }
    }
  }

  return params
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(src: string, widths: number[], format = "webp"): string {
  return widths
    .map((width) => {
      const url = new URL(src, typeof window !== "undefined" ? window.location.href : "https://englishmastery.com")
      url.searchParams.set("width", width.toString())
      url.searchParams.set("format", format)
      return `${url.toString()} ${width}w`
    })
    .join(", ")
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(sizes: { breakpoint: number; width: string }[]): string {
  return sizes
    .map((size) => `(max-width: ${size.breakpoint}px) ${size.width}`)
    .concat(["100vw"])
    .join(", ")
}

/**
 * Calculate aspect ratio for responsive images
 */
export function calculateAspectRatio(width: number, height: number): number {
  return (height / width) * 100
}

/**
 * Generate placeholder image URL
 */
export function getPlaceholderImage(width: number, height: number, text = ""): string {
  return `/placeholder.svg?height=${height}&width=${width}${text ? `&text=${encodeURIComponent(text)}` : ""}`
}

/**
 * Check if an image is in the viewport
 */
export function isImageInViewport(element: HTMLImageElement, threshold = 0): boolean {
  if (typeof window === "undefined") return false

  const rect = element.getBoundingClientRect()

  return (
    rect.top >= -threshold &&
    rect.left >= -threshold &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + threshold
  )
}

/**
 * Preload critical images
 */
export function preloadCriticalImages(imagePaths: string[]): void {
  if (typeof window === "undefined") return

  imagePaths.forEach((path) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = path
    document.head.appendChild(link)
  })
}

/**
 * Generate low-quality image placeholder (LQIP)
 */
export function generateLQIP(src: string, width = 20): string {
  // In a real implementation, this would generate a tiny version of the image
  // For this example, we'll just append parameters to the URL
  const url = new URL(src, typeof window !== "undefined" ? window.location.href : "https://englishmastery.com")
  url.searchParams.set("width", width.toString())
  url.searchParams.set("quality", "10")
  return url.toString()
}

/**
 * Optimize image dimensions based on device pixel ratio
 */
export function optimizeImageDimensions(width: number, height: number): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width, height }
  }

  const devicePixelRatio = window.devicePixelRatio || 1

  // For high DPR devices, we might want to serve higher resolution images
  // But we also want to balance this with performance
  if (devicePixelRatio > 1) {
    // For DPR 2 or higher, increase dimensions but cap at 1.5x to save bandwidth
    const dprFactor = Math.min(devicePixelRatio, 1.5)
    return {
      width: Math.round(width * dprFactor),
      height: Math.round(height * dprFactor),
    }
  }

  return { width, height }
}

/**
 * Determine if WebP is supported
 */
export function supportsWebP(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  // Check for WebP support
  try {
    const canvas = document.createElement("canvas")
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0
  } catch (e) {
    return false
  }
}

/**
 * Determine if AVIF is supported
 */
export function supportsAVIF(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  // Check for AVIF support
  try {
    const canvas = document.createElement("canvas")
    return canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0
  } catch (e) {
    return false
  }
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): "avif" | "webp" | "jpg" {
  if (supportsAVIF()) {
    return "avif"
  }

  if (supportsWebP()) {
    return "webp"
  }

  return "jpg"
}
