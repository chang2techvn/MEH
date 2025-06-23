"use client"

import { useState, useEffect } from "react"

export function useMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    if (typeof window === 'undefined') return

    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return {
    prefersReducedMotion,
    isClient,
    shouldAnimate: isClient && !prefersReducedMotion,
  }
}

// Helper hook for conditional animation classes
export function useAnimationClass(
  normalClass: string,
  reducedClass: string = ""
) {
  const { shouldAnimate } = useMotionPreference()
  
  return shouldAnimate ? normalClass : reducedClass
}

// Helper hook for conditional Framer Motion variants
export function useMotionVariants<T>(
  normalVariants: T,
  reducedVariants: Partial<T> = {}
): T {
  const { shouldAnimate } = useMotionPreference()
  
  if (!shouldAnimate) {
    // Create reduced motion variants
    const reducedDefaults = {
      initial: { opacity: 1, scale: 1, x: 0, y: 0 },
      animate: { opacity: 1, scale: 1, x: 0, y: 0 },
      exit: { opacity: 1, scale: 1, x: 0, y: 0 },
      transition: { duration: 0.01 },
    }
    
    return { ...reducedDefaults, ...reducedVariants } as T
  }
  
  return normalVariants
}
