"use client"

import { useEffect, useRef, useCallback } from "react"

// Hook for content visibility optimization
export function useContentVisibility(threshold = 0.1, rootMargin = "200px") {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return
    }

    // Apply CSS containment for performance
    element.style.contain = "layout style paint"

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is visible, enable rendering
            entry.target.classList.add("content-visible")
            entry.target.classList.remove("content-hidden")
          } else {
            // Element is not visible, optimize rendering
            entry.target.classList.remove("content-visible")
            entry.target.classList.add("content-hidden")
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return ref
}

// Hook for optimizing large lists with content visibility
export function useListOptimization(itemCount: number, itemHeight: number = 200) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof window === "undefined") return

    // Apply CSS containment to the container
    container.style.contain = "layout style paint"

    // For very large lists, consider using content-visibility: auto
    if (itemCount > 50) {
      const items = container.querySelectorAll(".list-item")
      
      items.forEach((item, index) => {
        const element = item as HTMLElement
        
        // Set explicit height for content-visibility optimization
        if (itemHeight) {
          element.style.contentVisibility = "auto"
          element.style.containIntrinsicSize = `auto ${itemHeight}px`
        }
        
        // Add performance optimization classes
        element.classList.add("optimize-visibility")
      })
    }
  }, [itemCount, itemHeight])

  return containerRef
}

// Utility to apply content visibility globally
export function applyGlobalContentVisibility() {
  if (typeof document === "undefined") return

  // Apply content-visibility to off-screen sections
  const sections = document.querySelectorAll(".optimize-content-visibility")

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement
        
        if (entry.isIntersecting) {
          element.style.contentVisibility = "visible"
          element.classList.add("content-visible")
        } else {
          element.style.contentVisibility = "auto"
          element.classList.remove("content-visible")
        }
      })
    },
    {
      rootMargin: "200px 0px",
      threshold: 0.01,
    }
  )

  sections.forEach((section) => {
    observer.observe(section)
  })

  return () => {
    sections.forEach((section) => observer.unobserve(section))
  }
}

// Hook for preventing layout shift with content visibility
export function useLayoutStability() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Set minimum height to prevent layout shift
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { height } = entry.contentRect
        if (height > 0) {
          element.style.setProperty("--min-height", `${height}px`)
        }
      })
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return ref
}

// Component wrapper for content visibility optimization
export function ContentVisibilityWrapper({
  children,
  className = "",
  height,
  threshold = 0.1,
  rootMargin = "200px",
}: {
  children: React.ReactNode
  className?: string
  height?: number
  threshold?: number
  rootMargin?: string
}) {
  const ref = useContentVisibility(threshold, rootMargin)

  return (
    <div
      ref={ref}
      className={`optimize-content-visibility ${className}`}
      style={{
        contain: "layout style paint",
        contentVisibility: "auto",
        containIntrinsicSize: height ? `auto ${height}px` : undefined,
      }}
    >
      {children}
    </div>
  )
}
