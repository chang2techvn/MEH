"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "@/contexts/theme-context"

export default function ThemeToggle() {
  const { theme, updateTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only show the toggle after component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newMode = theme.mode === "dark" ? "light" : "dark"
    updateTheme({ mode: newMode })
  }

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative group hover:bg-muted transition-colors"
    >
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
      <div className="relative">
        {theme.mode === "dark" ? (
          <Moon className="h-5 w-5 transition-all" />
        ) : (
          <Sun className="h-5 w-5 transition-all" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
