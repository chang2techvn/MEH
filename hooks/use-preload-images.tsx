"use client"

import { useEffect } from "react"

interface PreloadImageOptions {
  priority?: boolean
  quality?: number
  format?: "avif" | "webp" | "jpg"
}

export function usePreloadImages(
  images: Array<{ src: string; options?: PreloadImageOptions }>
) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const preloadPromises = images.map(({ src, options = {} }) => {
      return new Promise<void>((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = src
        
        // Add responsive srcset for better loading
        if (options.format) {
          link.type = `image/${options.format}`
        }
        
        link.onload = () => resolve()
        link.onerror = () => reject(new Error(`Failed to preload ${src}`))
        
        // Only add to head if priority is true or not specified
        if (options.priority !== false) {
          document.head.appendChild(link)
        }
      })
    })

    // Track preload success/failure
    Promise.allSettled(preloadPromises).then(results => {
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      if (failed > 0) {
        console.log(`Preloaded ${successful}/${images.length} images`)
      }
    })

    // Cleanup function
    return () => {
      // Remove preload links to clean up DOM
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]')
      preloadLinks.forEach(link => {
        if (images.some(img => img.src === link.getAttribute('href'))) {
          link.remove()
        }
      })
    }
  }, [images])
}

// Helper hook for preloading hero images
export function usePreloadHeroImages(heroImages: string[]) {
  const images = heroImages.map(src => ({
    src,
    options: { priority: true, quality: 85, format: 'avif' as const }
  }))
  
  usePreloadImages(images)
}

// Helper hook for preloading critical assets
export function usePreloadCriticalAssets() {
  const criticalImages = [
    '/placeholder-logo.svg',
    '/placeholder-user.jpg',
    '/placeholder.svg',
  ]
  
  const images = criticalImages.map(src => ({
    src,
    options: { priority: true }
  }))
  
  usePreloadImages(images)
}
