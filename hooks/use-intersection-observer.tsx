"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean
  skip?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = "50px", // Start loading 50px before entering viewport
    triggerOnce = true,
    skip = false,
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<Element | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const setElement = useCallback((element: Element | null) => {
    elementRef.current = element
  }, [])

  useEffect(() => {
    if (skip || !elementRef.current) return

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting
        setIsIntersecting(isCurrentlyIntersecting)
        
        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true)
          
          // If triggerOnce is true, disconnect observer after first intersection
          if (triggerOnce) {
            observer.disconnect()
          }
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    )

    observer.observe(elementRef.current)
    observerRef.current = observer

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, triggerOnce, skip, hasIntersected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return {
    setElement,
    isIntersecting,
    hasIntersected,
    shouldLoad: triggerOnce ? hasIntersected : isIntersecting,
  }
}
