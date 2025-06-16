"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

// Lazy load components that aren't needed immediately
const MainHeader = lazy(() => import("@/components/ui/main-header"))
const AIChatButtonComponent = lazy(() =>
  import("@/components/ai-helper/ai-chat-button").then((mod) => ({ default: mod.AIChatButton })),
)
const MobileNavigation = lazy(() => import("@/components/home/mobile-navigation").then((mod) => ({ default: mod.MobileNavigation })))
const MainContent = lazy(() => import("@/components/home/main-content").then((mod) => ({ default: mod.MainContent })))
const Sidebar = lazy(() => import("@/components/home/sidebar").then((mod) => ({ default: mod.Sidebar })))

// Loading fallback component
const LoadingFallback = () => <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-32 w-full"></div>

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newPostAdded, setNewPostAdded] = useState(false)
  const isMobile = useMobile()

  // Hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle practice tool clicks
  const handlePracticeToolClick = (tool: string) => {
    console.log(`Practice tool clicked: ${tool}`)
    // Add navigation logic here
  }

  // Handle leaderboard view
  const handleViewLeaderboard = () => {
    console.log("View leaderboard clicked")
    // Add navigation logic here
  }

  if (!mounted) {
    // Return a lightweight loading state
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80">
      <Suspense fallback={<div className="h-16 bg-background"></div>}>
        <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      </Suspense>

      {/* Mobile menu */}
      <Suspense fallback={null}>
        <MobileNavigation 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
      </Suspense>

      <main className="flex-1 relative overflow-hidden">
        {/* Background decorations - optimized with contain property */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 blur-3xl -z-10 animate-blob contain-paint"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-cantaloupe/10 dark:bg-cassis/10 blur-3xl -z-10 animate-blob animation-delay-2000 contain-paint"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-mellow-yellow/5 dark:bg-mellow-yellow/5 blur-3xl -z-10 animate-blob animation-delay-4000 contain-paint"></div>

        <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          {/* Main Content */}
          <Suspense fallback={<LoadingFallback />}>
            <MainContent 
              newPostAdded={newPostAdded}
              setNewPostAdded={setNewPostAdded}
            />
          </Suspense>

          {/* Sidebar */}
          <Suspense fallback={<LoadingFallback />}>
            <Sidebar 
              onPracticeToolClick={handlePracticeToolClick}
              onViewLeaderboard={handleViewLeaderboard}
            />
          </Suspense>
        </div>
      </main>

      {/* Floating Chat Icon - lazy loaded */}
      <Suspense fallback={null}>
        <AIChatButtonComponent />
      </Suspense>

      <footer className="border-t border-white/10 dark:border-gray-800/10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
          <div className="border-t border-white/10 dark:border-gray-800/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 EnglishMastery. All rights reserved.</p>
          </div>
      </footer>
    </div>
  )
}
