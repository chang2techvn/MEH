"use client"

import { useState, useEffect, Suspense, lazy, useCallback } from "react"
import { Search, Plus, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

// Critical above-the-fold components - NO lazy loading
import MainHeader from "@/components/ui/main-header"
import { MobileNavigation } from "@/components/home/mobile-navigation"
import { MainContent } from "@/components/home/main-content"
import { LeaderboardModal } from "@/components/home/leaderboard-modal"

// Non-critical components - keep lazy loading  
const AIChatButtonComponent = lazy(() =>
  import("@/components/ai-helper/ai-chat-button").then((mod) => ({ default: mod.AIChatButton })),
)
const Sidebar = lazy(() => import("@/components/home/sidebar").then((mod) => ({ default: mod.Sidebar })))
const ChallengeTabs = lazy(() => import("@/components/challenge/challenge-tabs"))
const CreateChallengeModal = lazy(() => import("@/components/challenge/create-challenge-modal"))
// Loading fallback component
const LoadingFallback = () => <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-32 w-full"></div>

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newPostAdded, setNewPostAdded] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const isMobile = useMobile()
  // Handle selected challenge change from ChallengeTabs
  const handleSelectedChallengeChange = useCallback((challenge: any) => {
    setSelectedChallenge(challenge)
  }, [])

  // Hydration and auto-collapse logic
  useEffect(() => {
    setMounted(true)
    
    // Always start with sidebar expanded (visible) when page loads
    setSidebarCollapsed(false)
    setIsInitialLoad(true)
    
    // Auto-collapse after 5 seconds
    const autoCollapseTimer = setTimeout(() => {
      setSidebarCollapsed(true)
      setIsInitialLoad(false) // Mark as no longer initial load
    }, 5000)
    
    // Cleanup timer if component unmounts
    return () => clearTimeout(autoCollapseTimer)
  }, [])

  // Handle user manual toggle (save to localStorage only after auto-collapse)
  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    
    // Save to localStorage only when user manually toggles AND it's not initial load
    if (!isInitialLoad && typeof window !== 'undefined') {
      localStorage.setItem('english-learning-sidebar-collapsed', JSON.stringify(newState))
    }
  }

  // Handle practice tool clicks
  const handlePracticeToolClick = (tool: string) => {
    console.log(`Practice tool clicked: ${tool}`)
    // Add navigation logic here
  }

  // Handle leaderboard view
  const handleViewLeaderboard = () => {
    console.log("View leaderboard clicked")
    setLeaderboardModalOpen(true)
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80">      {/* Critical above-the-fold components - NO Suspense */}
      <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Mobile menu */}
      <MobileNavigation 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      <main className="flex-1 relative overflow-hidden">
        {/* Background decorations - optimized with contain property */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 blur-3xl -z-10 animate-blob contain-paint"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-cantaloupe/10 dark:bg-cassis/10 blur-3xl -z-10 animate-blob animation-delay-2000 contain-paint"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-mellow-yellow/5 dark:bg-mellow-yellow/5 blur-3xl -z-10 animate-blob animation-delay-4000 contain-paint"></div>        <div className="container py-8">
          {/* Top section: Main Content + Sidebar with dynamic layout */}
          <div className={`grid gap-6 mb-8 transition-all duration-500 ease-in-out ${
            sidebarCollapsed 
              ? "grid-cols-1" // Full width when collapsed
              : "grid-cols-1 md:grid-cols-3" // Normal layout when expanded
          }`}>            {/* Main Content - critical above-the-fold */}
            <MainContent 
              newPostAdded={newPostAdded}
              setNewPostAdded={setNewPostAdded}
              isExpanded={sidebarCollapsed}
              showToggle={true}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={handleToggleSidebar}
            />

            {/* Sidebar with conditional rendering and animation */}
            <div className={`transition-all duration-500 ease-in-out ${
              sidebarCollapsed 
                ? "hidden" // Hide completely when collapsed
                : "block" // Show normally
            }`}>
              <Suspense fallback={<LoadingFallback />}>
                <Sidebar 
                  onPracticeToolClick={handlePracticeToolClick}
                  onViewLeaderboard={handleViewLeaderboard}
                />
              </Suspense>
            </div>
          </div>          {/* Challenge Tabs Section - Full width below Main Content + Sidebar */}          <div className="w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                    <Sparkles className="relative h-5 w-5 text-neo-mint dark:text-purist-blue" />
                  </div>
                  <h2 className="text-xl font-bold">Practice Challenges</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Choose from various difficulty levels and topics to improve your English skills</p>
              </div>
                {/* Search Bar and Create Button */}
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial md:w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search challenges..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-gradient-to-r from-neo-mint to-purist-blue text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </div>
            </div>
            
            <Suspense fallback={<LoadingFallback />}>
              <ChallengeTabs
                searchTerm={searchTerm}
                onSelectedChallengeChange={handleSelectedChallengeChange}
              />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Floating Chat Icon - lazy loaded */}
      <Suspense fallback={null}>
        <AIChatButtonComponent />
      </Suspense>
      <CreateChallengeModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onChallengeCreated={() => {
          setNewPostAdded(true)
          toast({ title: "Challenge created successfully!", description: "Your new challenge has been added."})
        }}  
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal 
        isOpen={leaderboardModalOpen}
        onClose={() => setLeaderboardModalOpen(false)}
      />
      <footer className="border-t border-white/10 dark:border-gray-800/10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
          <div className="border-t border-white/10 dark:border-gray-800/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 EnglishMasteryHub. All rights reserved.</p>
          </div>
      </footer>
    </div>
  )
}
