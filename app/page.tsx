"use client"

import { useState, useEffect, Suspense, lazy, useCallback } from "react"
import { Search, Plus, Sparkles, Filter, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

// Critical above-the-fold components - NO lazy loading
import MainHeader from "@/components/ui/main-header"
import { MobileNavigation } from "@/components/home/mobile-navigation"
import { MainContent } from "@/components/home/main-content"
import { LeaderboardModal } from "@/components/home/leaderboard-modal"
import { MobileBottomNavigation } from "@/components/home/mobile-bottom-navigation"
import { Sidebar } from "@/components/home/sidebar"
import ChallengeTabs from "@/components/challenge/challenge-tabs"
import { AIChatButton } from "@/components/ai-helper/ai-chat-button"

// Only lazy load non-essential modals that appear on user interaction
const CreateChallengeModal = lazy(() => import("@/components/challenge/create-challenge-modal"))

// Simple loading fallback for modals only
const ModalLoadingFallback = () => <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-32 w-full"></div>

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
  const [filterTab, setFilterTab] = useState("all")
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null)
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false)
  const [isHoveringToggleButton, setIsHoveringToggleButton] = useState(false)
  const { isMobile } = useMobile()
  // Handle selected challenge change from ChallengeTabs
  const handleSelectedChallengeChange = useCallback((challenge: any) => {
    setSelectedChallenge(challenge)
  }, [])

  // Handle filter tab change
  const handleFilterTabChange = useCallback((tab: string) => {
    setFilterTab(tab)
  }, [])

  // Get filter tab display name
  const getFilterDisplayName = useCallback((tab: string) => {
    switch(tab) {
      case "user": return "Your Challenges"
      case "beginner": return "Beginner"
      case "intermediate": return "Intermediate"
      case "advanced": return "Advanced"
      default: return searchTerm ? `All 🔍` : "All"
    }
  }, [searchTerm])

  // Auto-switch filter to "all" when search starts
  useEffect(() => {
    if (searchTerm && filterTab !== "all") {
      setFilterTab("all")
    }
  }, [searchTerm, filterTab])

  // Hydration and auto-collapse logic
  useEffect(() => {
    setMounted(true)
    
    // Always start with sidebar expanded (visible) when page loads
    setSidebarCollapsed(false)
    setIsInitialLoad(true)
    
    // Auto-collapse after 5 seconds only on desktop (lg screens and up)
    const autoCollapseTimer = setTimeout(() => {
      // Check if screen is desktop size before auto-collapsing
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarCollapsed(true)
      }
      setIsInitialLoad(false) // Mark as no longer initial load
    }, 5000)
    
    // Cleanup timer if component unmounts
    return () => {
      clearTimeout(autoCollapseTimer)
      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }
    }
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

  // Handle toggle button hover auto-expand/collapse
  const handleToggleButtonHoverEnter = () => {
    if (sidebarCollapsed) {
      setIsHoveringToggleButton(true)
      setSidebarCollapsed(false)
    }
    // Clear any existing timer
    if (hoverTimer) {
      clearTimeout(hoverTimer)
      setHoverTimer(null)
    }
  }

  const handleToggleButtonHoverLeave = () => {
    setIsHoveringToggleButton(false)
    // Start timer to auto-collapse after 3 seconds
    const timer = setTimeout(() => {
      if (!isHoveringToggleButton && !isHoveringSidebar) {
        setSidebarCollapsed(true)
      }
    }, 3000)
    setHoverTimer(timer)
  }

  // Handle sidebar hover to prevent auto-collapse
  const handleSidebarHoverEnter = () => {
    setIsHoveringSidebar(true)
    // Clear any existing timer
    if (hoverTimer) {
      clearTimeout(hoverTimer)
      setHoverTimer(null)
    }
  }

  const handleSidebarHoverLeave = () => {
    setIsHoveringSidebar(false)
    // Start timer to auto-collapse after 3 seconds if not hovering toggle button
    const timer = setTimeout(() => {
      if (!isHoveringToggleButton && !isHoveringSidebar) {
        setSidebarCollapsed(true)
      }
    }, 3000)
    setHoverTimer(timer)
  }

  // Handle practice tool clicks
  const handlePracticeToolClick = (tool: string) => {
    console.log(`Practice tool clicked: ${tool}`)
    // Add navigation logic here
  }

  // Handle leaderboard view
  const handleViewLeaderboard = () => {
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
        <div className="absolute top-10 sm:top-20 left-2 sm:left-10 w-32 h-32 sm:w-64 sm:h-64 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 blur-3xl -z-10 animate-blob contain-paint"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-2 sm:right-10 w-32 h-32 sm:w-64 sm:h-64 rounded-full bg-cantaloupe/10 dark:bg-cassis/10 blur-3xl -z-10 animate-blob animation-delay-2000 contain-paint"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-mellow-yellow/5 dark:bg-mellow-yellow/5 blur-3xl -z-10 animate-blob animation-delay-4000 contain-paint"></div>        <div className="w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8 pb-20 md:pb-4 sm:pb-6 lg:pb-8">
          {/* Top section: Main Content + Sidebar with dynamic layout */}
          <div className={`flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 transition-all duration-500 ease-in-out ${
            sidebarCollapsed 
              ? "justify-center" // Center content when collapsed
              : "justify-between" // Distribute when expanded
          }`}>            {/* Main Content - critical above-the-fold */}
            <MainContent 
              newPostAdded={newPostAdded}
              setNewPostAdded={setNewPostAdded}
              isExpanded={sidebarCollapsed}
              showToggle={true}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={handleToggleSidebar}
              onToggleButtonHoverEnter={handleToggleButtonHoverEnter}
              onToggleButtonHoverLeave={handleToggleButtonHoverLeave}
              onSidebarHoverEnter={handleSidebarHoverEnter}
              onSidebarHoverLeave={handleSidebarHoverLeave}
            />

            {/* Sidebar with conditional rendering and animation */}
            <div 
              className={`transition-all duration-500 ease-in-out w-full lg:w-80 xl:w-96 2xl:w-[420px] lg:flex-shrink-0 lg:max-w-[35%] lg:-mt-5 xl:-mt-0 hidden md:block ${
                sidebarCollapsed 
                  ? "lg:hidden" // Hide only on desktop when collapsed
                  : "md:block" // Show only on desktop/tablet screens (md and up)
              }`}
              onMouseEnter={handleSidebarHoverEnter}
              onMouseLeave={handleSidebarHoverLeave}
            >
              <Sidebar 
                onPracticeToolClick={handlePracticeToolClick}
                onViewLeaderboard={handleViewLeaderboard}
              />
            </div>
          </div>          {/* Challenge Tabs Section - Full width below Main Content + Sidebar */}          <div className="w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-full md:w-auto">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                    <Sparkles className="relative h-4 w-4 sm:h-5 sm:w-5 text-neo-mint dark:text-purist-blue" />
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-xl font-bold leading-tight">Practice Challenges</h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed pr-2 md:pr-0">Choose from various difficulty levels and topics to improve your English skills</p>
              </div>
                {/* Search Bar and Create Button */}
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial md:w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={isMobile ? "Search..." : "Search challenges..."}
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Mobile Filter Button */}
                <div className="flex gap-2 sm:gap-3">
                  <div className="md:hidden flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 text-sm">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => handleFilterTabChange("all")}
                          className={filterTab === "all" ? "bg-accent" : ""}
                        >
                          All {searchTerm && "🔍"}
                        </DropdownMenuItem>
                        {!searchTerm && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleFilterTabChange("user")}
                              className={filterTab === "user" ? "bg-accent" : ""}
                            >
                              Your Challenges
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleFilterTabChange("beginner")}
                              className={filterTab === "beginner" ? "bg-accent" : ""}
                            >
                              Beginner
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleFilterTabChange("intermediate")}
                              className={filterTab === "intermediate" ? "bg-accent" : ""}
                            >
                              Intermediate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleFilterTabChange("advanced")}
                              className={filterTab === "advanced" ? "bg-accent" : ""}
                            >
                              Advanced
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-gradient-to-r from-neo-mint to-purist-blue text-white flex-shrink-0 h-10 w-10 sm:w-auto p-0 sm:px-4 text-sm"
                  >
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Create</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <ChallengeTabs
              searchTerm={searchTerm}
              onSelectedChallengeChange={handleSelectedChallengeChange}
              filterTab={filterTab}
              onFilterTabChange={handleFilterTabChange}
            />
          </div>
        </div>
      </main>

      <Suspense fallback={<ModalLoadingFallback />}>
        <CreateChallengeModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onChallengeCreated={() => {
            setNewPostAdded(true)
            toast({ title: "Challenge created successfully!", description: "Your new challenge has been added."})
          }}  
        />
      </Suspense>

      {/* Leaderboard Modal - Only used on desktop, mobile uses the one in MobileHeaderButtons */}
      {mounted && !isMobile && (
        <LeaderboardModal 
          isOpen={leaderboardModalOpen}
          onClose={() => setLeaderboardModalOpen(false)}
        />
      )}
      {/* Mobile Bottom Navigation - Only show on home route */}
      <MobileBottomNavigation />

      {/* AI Chat Button - Only show on home page and desktop */}
      <AIChatButton />

      <footer className="border-t border-white/10 dark:border-gray-800/10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
          <div className="border-t border-white/10 dark:border-gray-800/10 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground px-3 sm:px-6">
            <p>© 2025 EnglishMasteryHub. All rights reserved.</p>
          </div>
      </footer>
    </div>
  )
}
