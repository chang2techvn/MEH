"use client"

import { useState, useEffect } from 'react'

/**
 * Custom hook to track the position of a button element
 * @returns Default button position for AIChatBox components
 */
export function useButtonPosition() {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Set default position bottom right corner
    setButtonPosition({
      x: window.innerWidth - 80, // 80px from right
      y: window.innerHeight - 80, // 80px from bottom
    })

    const handleResize = () => {
      setButtonPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return buttonPosition
}
