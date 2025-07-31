"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"

// Define theme colors with hex values
export const themeColors = [
  { name: "neo-mint", value: "#7FFFD4", variable: "--neo-mint" },
  { name: "purist-blue", value: "#3B82F6", variable: "--purist-blue" },
  { name: "cassis", value: "#BB2649", variable: "--cassis" },
  { name: "cantaloupe", value: "#FFBD59", variable: "--cantaloupe" },
  { name: "mellow-yellow", value: "#FFD166", variable: "--mellow-yellow" },
  { name: "dark-blue", value: "#1E40AF", variable: "--dark-blue" },
  { name: "vibrant-orange", value: "#F06F25", variable: "--vibrant-orange" },
]

export type ThemeMode = "light" | "dark"

interface ThemeSettings {
  mode: ThemeMode
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontSize: "small" | "medium" | "large"
  borderRadius: number
  shadowIntensity: number
  reducedMotion: boolean
}

interface ThemeContextType {
  theme: ThemeSettings
  updateTheme: (settings: Partial<ThemeSettings>) => void
  resetTheme: () => void
  applyThemeColors: (primary: string, secondary: string, accent: string) => void
}

const defaultTheme: ThemeSettings = {
  mode: "light",
  primaryColor: "vibrant-orange",
  secondaryColor: "vibrant-orange", 
  accentColor: "cantaloupe",
  fontSize: "medium",
  borderRadius: 8,
  shadowIntensity: 50,
  reducedMotion: false,
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)
  const [isLoaded, setIsLoaded] = useState(false)

  // Memoize hex to HSL conversion function
  const hexToHSL = useCallback((hex: string) => {
    // Remove the # if present
    hex = hex.replace(/^#/, "")

    // Parse the hex values
    const r = Number.parseInt(hex.substring(0, 2), 16) / 255
    const g = Number.parseInt(hex.substring(2, 4), 16) / 255
    const b = Number.parseInt(hex.substring(4, 6), 16) / 255

    // Find the min and max values to calculate the lightness
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, // Initialize with default values
      s = 0,
      l = (max + min) / 2

    if (max === min) {
      // Achromatic
      h = 0
      s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }

      h /= 6
    }

    // Convert to degrees, percentage, percentage
    h = Math.round(h * 360)
    s = Math.round(s * 100)
    l = Math.round(l * 100)

    return { h, s, l }
  }, [])

  // Memoize theme colors application
  const applyThemeColors = useCallback((primary: string, secondary: string, accent: string) => {
    // Only run in browser environment
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement

    // Find the color values from our themeColors array
    const primaryColorObj = themeColors.find((c) => c.name === primary)
    const secondaryColorObj = themeColors.find((c) => c.name === secondary)
    const accentColorObj = themeColors.find((c) => c.name === accent)

    // Convert hex to HSL and apply to CSS variables
    if (primaryColorObj) {
      const hsl = hexToHSL(primaryColorObj.value)
      root.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`)
      root.style.setProperty("--primary-hsl", `${hsl.h}, ${hsl.s}%, ${hsl.l}%`)
    }

    if (secondaryColorObj) {
      const hsl = hexToHSL(secondaryColorObj.value)
      root.style.setProperty("--secondary", `${hsl.h} ${hsl.s}% ${hsl.l}%`)
      root.style.setProperty("--neo-mint", `${hsl.h} ${hsl.s}% ${hsl.l}%`)
    }

    if (accentColorObj) {
      const hsl = hexToHSL(accentColorObj.value)
      root.style.setProperty("--accent", `${hsl.h} ${hsl.s}% ${hsl.l}%`)
      root.style.setProperty("--cassis", `${hsl.h} ${hsl.s}% ${hsl.l}%`)
    }
  }, [hexToHSL])

  // Memoize other settings application
  const applyOtherSettings = useCallback((settings: ThemeSettings) => {
    // Only run in browser environment
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    
    const root = document.documentElement

    // Update border radius
    root.style.setProperty("--radius", `${settings.borderRadius}px`)

    // Update shadow intensity
    const shadowOpacity = settings.shadowIntensity / 100
    root.style.setProperty("--shadow-opacity", shadowOpacity.toString())

    // Apply font size
    switch (settings.fontSize) {
      case "small":
        root.style.fontSize = "14px"
        break
      case "medium":
        root.style.fontSize = "16px"
        break
      case "large":
        root.style.fontSize = "18px"
        break
    }

    // Apply reduced motion if needed
    if (settings.reducedMotion) {
      document.body.classList.add("reduce-motion")
    } else {
      document.body.classList.remove("reduce-motion")
    }

    // Apply theme mode
    if (settings.mode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme")
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme)
        setTheme(parsedTheme)
        applyThemeColors(parsedTheme.primaryColor, parsedTheme.secondaryColor, parsedTheme.accentColor)
        applyOtherSettings(parsedTheme)
      } catch (error) {
        console.error("Error parsing saved theme:", error)
      }
    } else {
      // Apply default theme if no saved theme
      applyThemeColors(defaultTheme.primaryColor, defaultTheme.secondaryColor, defaultTheme.accentColor)
      applyOtherSettings(defaultTheme)
    }
    setIsLoaded(true)
  }, [applyThemeColors, applyOtherSettings])

  // Debounced save theme to localStorage
  useEffect(() => {
    if (!isLoaded) return
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem("app-theme", JSON.stringify(theme))
    }, 100) // Debounce by 100ms

    return () => clearTimeout(timeoutId)
  }, [theme, isLoaded])

  // Memoize update theme function
  const updateTheme = useCallback((settings: Partial<ThemeSettings>) => {
    const newTheme = { ...theme, ...settings }
    setTheme(newTheme)

    // Apply color changes if colors were updated
    if (settings.primaryColor || settings.secondaryColor || settings.accentColor) {
      applyThemeColors(
        settings.primaryColor || theme.primaryColor,
        settings.secondaryColor || theme.secondaryColor,
        settings.accentColor || theme.accentColor,
      )
    }

    // Apply other settings if they were updated
    applyOtherSettings(newTheme)
  }, [theme, applyThemeColors, applyOtherSettings])

  // Memoize reset theme function
  const resetTheme = useCallback(() => {
    setTheme(defaultTheme)
    applyThemeColors(defaultTheme.primaryColor, defaultTheme.secondaryColor, defaultTheme.accentColor)
    applyOtherSettings(defaultTheme)
  }, [applyThemeColors, applyOtherSettings])

  // Memoize context value
  const contextValue = useMemo(() => ({
    theme,
    updateTheme,
    resetTheme,
    applyThemeColors,
  }), [theme, updateTheme, resetTheme, applyThemeColors])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
