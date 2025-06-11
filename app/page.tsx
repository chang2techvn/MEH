"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

// Lazy load components that aren't needed immediately
const MainHeader = lazy(() => import("@/components/main-header"))
const AIChatButtonComponent = lazy(() =>
  import("@/components/ai-chat-button").then((mod) => ({ default: mod.AIChatButton })),
)
const MobileNavigation = lazy(() => import("@/app/components/mobile-navigation").then((mod) => ({ default: mod.MobileNavigation })))
const MainContent = lazy(() => import("@/app/components/main-content").then((mod) => ({ default: mod.MainContent })))
const Sidebar = lazy(() => import("@/app/components/sidebar").then((mod) => ({ default: mod.Sidebar })))

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
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
                  EnglishMastery
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Master English through our innovative 4-Skill Video Crucible methodology. Practice listening, speaking,
                reading, and writing in an engaging community.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/challenges" className="text-muted-foreground hover:text-foreground transition-colors">
                    Challenges
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Subscribe</h3>
              <p className="text-sm text-muted-foreground mb-2">Get the latest updates and news</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Your email"
                    className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                  />
                </div>
                <Button className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 dark:border-gray-800/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 EnglishMastery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
