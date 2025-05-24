"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface LazyComponentProps {
  children: React.ReactNode
  threshold?: number
  rootMargin?: string
  placeholder?: React.ReactNode
  className?: string
  fallbackMinHeight?: string | number
}

export default function LazyComponent({
  children,
  threshold = 0.1,
  rootMargin = "200px",
  placeholder,
  className = "",
  fallbackMinHeight = "32px",
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasRendered, setHasRendered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip if SSR or IntersectionObserver not available
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          setHasRendered(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      },
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin])

  // If we've already rendered once, keep showing the component even if it goes out of view
  const shouldRender = isVisible || hasRendered

  return (
    <div
      ref={ref}
      className={className}
      data-testid="lazy-component"
      style={{ minHeight: shouldRender ? undefined : fallbackMinHeight }}
    >
      {shouldRender
        ? children
        : placeholder || (
            <div
              className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-md h-full w-full"
              style={{ minHeight: fallbackMinHeight }}
            />
          )}
    </div>
  )
}
