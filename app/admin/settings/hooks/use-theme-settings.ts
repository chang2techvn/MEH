"use client"

import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"

export function useThemeSettings() {
  const { theme, updateTheme, resetTheme } = useTheme()
  const [colorPreview, setColorPreview] = useState<{ primary: string; secondary: string; accent: string } | null>(null)

  // Preview theme colors
  const previewThemeColors = (primary: string, secondary: string, accent: string) => {
    setColorPreview({ primary, secondary, accent })
    // Apply the preview colors temporarily
    updateTheme({ primaryColor: primary, secondaryColor: secondary, accentColor: accent })
  }

  // Clear preview
  const clearPreview = () => {
    setColorPreview(null)
    // Revert to the saved theme
    updateTheme({
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
    })
  }

  // Apply theme preset
  const applyThemePreset = (preset: { primary: string; secondary: string; accent: string }) => {
    updateTheme({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    })
    setColorPreview(null)
  }

  return {
    theme,
    updateTheme,
    resetTheme,
    colorPreview,
    previewThemeColors,
    clearPreview,
    applyThemePreset,
  }
}
