/**
 * Utility functions for performance optimization
 */

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit how often a function can be called
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Lazy load images that are not in the viewport
 */
export function lazyLoadImages() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return

  const images = document.querySelectorAll("img[data-src]")
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const image = entry.target as HTMLImageElement
        image.src = image.dataset.src || ""
        image.removeAttribute("data-src")
        imageObserver.unobserve(image)
      }
    })
  })

  images.forEach((image) => {
    imageObserver.observe(image)
  })
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources: string[]) {
  if (typeof window === "undefined") return

  resources.forEach((resource) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = resource
    link.as = resource.endsWith(".js")
      ? "script"
      : resource.endsWith(".css")
        ? "style"
        : resource.endsWith(".woff2") || resource.endsWith(".woff") || resource.endsWith(".ttf")
          ? "font"
          : "fetch"

    if (link.as === "font") {
      link.setAttribute("crossorigin", "anonymous")
    }

    document.head.appendChild(link)
  })
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string) {
  if (process.env.NODE_ENV !== "development") return { start: () => {}, end: () => {} }

  return {
    start: () => {
      console.time(`Render time for ${componentName}`)
    },
    end: () => {
      console.timeEnd(`Render time for ${componentName}`)
    },
  }
}

/**
 * Check if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Get optimized animation settings based on user preferences and device performance
 */
export function getOptimizedAnimationSettings() {
  const reducedMotion = prefersReducedMotion()

  // Check if device is low-end (simplified check)
  const isLowEndDevice =
    typeof navigator !== "undefined" &&
    (navigator.hardwareConcurrency <= 2 ||
      (navigator as any).deviceMemory <= 2 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

  return {
    enableAnimations: !reducedMotion,
    useSimplifiedAnimations: reducedMotion || isLowEndDevice,
    duration: reducedMotion ? 0 : isLowEndDevice ? 0.3 : 0.5,
    staggerChildren: reducedMotion ? 0 : isLowEndDevice ? 0.05 : 0.1,
  }
}

/**
 * Optimize image loading based on network conditions
 */
export function getOptimizedImageQuality() {
  if (typeof navigator === "undefined") return "high"

  // Check connection type if available
  if ("connection" in navigator && (navigator as any).connection) {
    const connection = (navigator as any).connection

    if (connection.saveData) {
      return "low"
    }

    if (connection.effectiveType === "4g") {
      return "high"
    }

    if (connection.effectiveType === "3g") {
      return "medium"
    }

    return "low"
  }

  return "high"
}

/**
 * Use requestIdleCallback for non-critical tasks
 */
export function runWhenIdle(callback: () => void, timeout = 1000) {
  if (typeof window === "undefined") return

  if ("requestIdleCallback" in window) {
    ;(window as any).requestIdleCallback(callback, { timeout })
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, 1)
  }
}

/**
 * Optimize rendering with content-visibility
 */
export function applyContentVisibility() {
  if (typeof document === "undefined") return

  // Apply content-visibility to off-screen elements
  const elements = document.querySelectorAll(".optimize-visibility")

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("content-visible")
          entry.target.classList.remove("content-hidden")
        } else {
          entry.target.classList.remove("content-visible")
          entry.target.classList.add("content-hidden")
        }
      })
    },
    {
      rootMargin: "200px 0px",
    },
  )

  elements.forEach((el) => observer.observe(el))

  return () => {
    elements.forEach((el) => observer.unobserve(el))
  }
}

/**
 * Optimize long task scheduling
 */
export function scheduleTask(task: () => void, priority: "high" | "low" = "low") {
  if (typeof window === "undefined") return

  if (priority === "high") {
    // For high priority tasks, run immediately
    task()
  } else {
    // For low priority tasks, use requestIdleCallback or setTimeout
    runWhenIdle(task)
  }
}

/**
 * Optimize resource hints
 */
export function addResourceHints(urls: { preconnect?: string[]; prefetch?: string[]; preload?: string[] }) {
  if (typeof document === "undefined") return

  // Add preconnect hints
  if (urls.preconnect) {
    urls.preconnect.forEach((url) => {
      const link = document.createElement("link")
      link.rel = "preconnect"
      link.href = url
      document.head.appendChild(link)

      // Also add dns-prefetch as fallback
      const dnsPrefetch = document.createElement("link")
      dnsPrefetch.rel = "dns-prefetch"
      dnsPrefetch.href = url
      document.head.appendChild(dnsPrefetch)
    })
  }

  // Add prefetch hints for resources likely to be needed soon
  if (urls.prefetch) {
    urls.prefetch.forEach((url) => {
      const link = document.createElement("link")
      link.rel = "prefetch"
      link.href = url
      document.head.appendChild(link)
    })
  }

  // Add preload hints for critical resources
  if (urls.preload) {
    urls.preload.forEach((url) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = url

      // Set correct as attribute based on file extension
      if (url.endsWith(".js")) {
        link.as = "script"
      } else if (url.endsWith(".css")) {
        link.as = "style"
      } else if (url.endsWith(".woff2") || url.endsWith(".woff") || url.endsWith(".ttf")) {
        link.as = "font"
        link.setAttribute("crossorigin", "anonymous")
      } else if (
        url.endsWith(".jpg") ||
        url.endsWith(".jpeg") ||
        url.endsWith(".png") ||
        url.endsWith(".webp") ||
        url.endsWith(".avif")
      ) {
        link.as = "image"
      }

      document.head.appendChild(link)
    })
  }
}
