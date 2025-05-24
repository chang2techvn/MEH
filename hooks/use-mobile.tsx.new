"use client"

import { useState, useEffect } from "react"

export function useMobile(): { isMobile: boolean } {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return { isMobile }
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    
    // Initial check
    setMatches(mediaQueryList.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern approach with addEventListener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handleChange)
      return () => mediaQueryList.removeEventListener("change", handleChange)
    } 
    // Legacy approach for older browsers
    else {
      // @ts-ignore - Using deprecated API for backward compatibility
      mediaQueryList.addListener(handleChange)
      return () => {
        // @ts-ignore - Using deprecated API for backward compatibility
        mediaQueryList.removeListener(handleChange)
      }
    }
  }, [query])

  return matches
}
