"use client"

import { useState, useEffect, useCallback, useMemo, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import OptimizedChallengeGrid from "@/components/optimized/optimized-challenge-grid"
import CreateChallengeModal from "@/components/challenge/create-challenge-modal"
import { getChallenges } from "@/app/actions/youtube-video"
import { type Challenge } from '@/lib/utils/challenge-constants'
import { toast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-performance"
import { useChallenge } from "@/contexts/challenge-context"
import { useAuthState } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface ChallengeTabsProps {
  searchTerm: string
  onSelectedChallengeChange: (challenge: Challenge | null) => void
  filterTab?: string
  onFilterTabChange?: (tab: string) => void
}

export default function ChallengeTabs({
  searchTerm,
  onSelectedChallengeChange,
  filterTab,
  onFilterTabChange
}: ChallengeTabsProps) {  
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([])
  const [activeTab, setActiveTab] = useState(filterTab || "all")
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { setChallengeMode, setCurrentChallenge } = useChallenge()
  const { user } = useAuthState() // Get current user for permission checks
  
  // Use React 18 useTransition for smoother updates
  const [isPending, startTransition] = useTransition()
  
  // Sync activeTab with filterTab prop
  useEffect(() => {
    if (filterTab && filterTab !== activeTab) {
      setActiveTab(filterTab)
    }
  }, [filterTab, activeTab])

  // Handle tab change and notify parent
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab)
    onFilterTabChange?.(newTab)
  }, [onFilterTabChange])
  
  // Optimize search term processing
  const effectiveSearchTerm = useMemo(() => searchTerm.trim(), [searchTerm])
  
  // Debounced version for very smooth filtering
  const debouncedSearchTerm = useDebounce(effectiveSearchTerm, 150) // Faster debounce for responsiveness

  // Debounced localStorage save function
  const saveToLocalStorage = useCallback((key: string, data: any) => {
    try {
      // Only save essential data to localStorage
      const essentialData = data.map((challenge: Challenge) => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        duration: challenge.duration,
        createdAt: challenge.createdAt,
        thumbnailUrl: challenge.thumbnailUrl,
        videoUrl: challenge.videoUrl,
        // Skip large fields like topics array if not essential
      }))
      localStorage.setItem(key, JSON.stringify(essentialData))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      // If localStorage is full, clear old data
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        localStorage.removeItem('admin_challenges')
        localStorage.removeItem('lastChallengeRefresh')
        // Retry with smaller dataset
        try {
          localStorage.setItem(key, JSON.stringify(data.slice(0, 10)))
        } catch (retryError) {
          console.error('Failed to save even reduced data:', retryError)
        }
      }
    }
  }, [])

  // Load challenges when component mounts
  const loadChallenges = useCallback(async () => {
    try {
      // Set loading to false immediately to show skeleton content
      setLoading(false)

      // Load practice challenges and user challenges in parallel
      const [practiceData, userData] = await Promise.all([
        getChallenges('practice', { limit: 15 }), // Get latest 15 practice videos
        getChallenges('user_generated', { 
          limit: 50,
          userId: user?.id // Only get challenges created by current user
        })
      ])

      // Convert to Challenge format if needed
      const practicesChallenges: Challenge[] = practiceData.map((challenge: any) => {
        // Extract video ID from video_url for YouTube player functionality
        let videoId = challenge.id // Default to challenge ID
        
        if (challenge.video_url) {
          // Try YouTube URL formats
          const youtubeMatch = challenge.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
          if (youtubeMatch) {
            videoId = youtubeMatch[1]
          } else {
            // Fallback to simple extraction
            videoId = challenge.video_url.split('v=')[1]?.split('&')[0] || 
                     challenge.video_url.split('/').pop() || 
                     challenge.id
          }
        }

        return {
          id: challenge.id, // Keep database ID as main ID for database operations
          databaseId: challenge.id, // Also store as databaseId for clarity
          videoId: videoId, // Store video ID separately for YouTube player
          title: challenge.title,
          description: challenge.description || '',
          difficulty: challenge.difficulty || 'intermediate',
          duration: challenge.duration || 0,
          thumbnailUrl: challenge.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          videoUrl: challenge.video_url || `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: challenge.embed_url || `https://www.youtube.com/embed/${videoId}`,
          topics: Array.isArray(challenge.topics) ? challenge.topics : [],
          isAutoGenerated: true,
          createdAt: challenge.created_at,
          transcript: challenge.transcript || '',
          challenge_type: challenge.challenge_type || 'practice',
          user_id: challenge.user_id
        }
      })

      const userCreatedChallenges: Challenge[] = userData.map((challenge: any) => {
        // Extract video ID from video_url for YouTube player functionality
        let videoId = challenge.id // Default to challenge ID
        
        if (challenge.video_url) {
          // Try YouTube URL formats
          const youtubeMatch = challenge.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
          if (youtubeMatch) {
            videoId = youtubeMatch[1]
          } else {
            // Fallback to simple extraction
            videoId = challenge.video_url.split('v=')[1]?.split('&')[0] || 
                     challenge.video_url.split('/').pop() || 
                     challenge.id
          }
        }

        return {
          id: challenge.id, // Keep database ID as main ID for database operations
          databaseId: challenge.id, // Also store as databaseId for clarity
          videoId: videoId, // Store video ID separately for YouTube player
          title: challenge.title,
          description: challenge.description || '',
          difficulty: challenge.difficulty || 'intermediate',
          duration: challenge.duration || 0,
          thumbnailUrl: challenge.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          videoUrl: challenge.video_url || `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: challenge.embed_url || `https://www.youtube.com/embed/${videoId}`,
          topics: Array.isArray(challenge.topics) ? challenge.topics : [],
          isAutoGenerated: false,
          createdAt: challenge.created_at,
          transcript: challenge.transcript || '',
          challenge_type: challenge.challenge_type || 'user_generated',
          user_id: challenge.user_id
        }
      })

      // Check for local user challenges
      const savedChallenges = localStorage.getItem("userChallenges")
      let localUserChallenges: Challenge[] = []

      if (savedChallenges && user?.id) {
        try {
          const allLocalChallenges = JSON.parse(savedChallenges)
          // Filter local challenges to only include ones created by current user
          localUserChallenges = allLocalChallenges.filter((challenge: Challenge) => 
            challenge.user_id === user.id
          )
        } catch (error) {
          console.error("Error parsing saved challenges:", error)
          localUserChallenges = []
        }
      }

      // Combine all challenges
      const combinedChallenges = [
        ...practicesChallenges,      // Practice challenges first
        ...userCreatedChallenges,    // User challenges from database
        ...localUserChallenges       // Local user challenges
      ]
      
      // Set separate states
      setUserChallenges([...userCreatedChallenges, ...localUserChallenges])
      setChallenges(combinedChallenges)

    } catch (error: any) {
      console.error("Error loading challenges:", error)
      toast({
        title: "Error",
        description: "Failed to load challenges. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }, [user?.id]) // Add user?.id as dependency

  useEffect(() => {
    loadChallenges()
  }, [loadChallenges])

  // Setup realtime subscription for challenges
  useEffect(() => {
    // Subscribe to challenges table changes
    const subscription = supabase
      .channel('challenges_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'challenges',
          filter: 'challenge_type=in.(practice,user_generated)' // Only listen to relevant challenge types
        },
        (payload) => {
          console.log('📡 Realtime challenge update:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newChallenge = payload.new
            console.log('➕ New challenge created:', newChallenge)
            
            // Convert to Challenge format and add to state
            const challengeToAdd: Challenge = {
              id: newChallenge.id,
              databaseId: newChallenge.id,
              videoId: newChallenge.video_url?.split('v=')[1]?.split('&')[0] || newChallenge.id,
              title: newChallenge.title,
              description: newChallenge.description || '',
              difficulty: newChallenge.difficulty,
              duration: newChallenge.duration || 0,
              thumbnailUrl: newChallenge.thumbnail_url || '',
              videoUrl: newChallenge.video_url || '',
              embedUrl: newChallenge.embed_url || '',
              topics: newChallenge.topics || [],
              isAutoGenerated: false,
              createdAt: newChallenge.created_at || new Date().toISOString(),
              transcript: newChallenge.transcript || '',
              challenge_type: newChallenge.challenge_type,
              user_id: newChallenge.user_id
            }
            
            // Only add if it's a user_generated challenge created by current user or a practice challenge
            if (newChallenge.challenge_type === 'practice' || 
                (newChallenge.challenge_type === 'user_generated' && newChallenge.user_id === user?.id)) {
              
              setChallenges(prev => {
                // Check if challenge already exists
                const exists = prev.some(c => c.databaseId === challengeToAdd.databaseId)
                if (exists) return prev
                
                console.log('✅ Adding new challenge to UI:', challengeToAdd.title)
                return [challengeToAdd, ...prev]
              })
              
              // Update user challenges if it's user_generated
              if (newChallenge.challenge_type === 'user_generated' && newChallenge.user_id === user?.id) {
                setUserChallenges(prev => {
                  const exists = prev.some(c => c.databaseId === challengeToAdd.databaseId)
                  if (exists) return prev
                  return [challengeToAdd, ...prev]
                })
              }
              
              // Show success toast
              toast({
                title: "Challenge created!",
                description: `Your challenge "${challengeToAdd.title}" is now available.`,
              })
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedChallenge = payload.new
            console.log('🔄 Challenge updated:', updatedChallenge)
            
            // Update in challenges list
            setChallenges(prev => prev.map(challenge => 
              challenge.databaseId === updatedChallenge.id 
                ? { ...challenge, 
                    title: updatedChallenge.title,
                    description: updatedChallenge.description || '',
                    difficulty: updatedChallenge.difficulty,
                    thumbnailUrl: updatedChallenge.thumbnail_url || '',
                    // Add other fields as needed
                  }
                : challenge
            ))
            
            // Update in user challenges if applicable
            if (updatedChallenge.challenge_type === 'user_generated' && updatedChallenge.user_id === user?.id) {
              setUserChallenges(prev => prev.map(challenge => 
                challenge.databaseId === updatedChallenge.id 
                  ? { ...challenge, 
                      title: updatedChallenge.title,
                      description: updatedChallenge.description || '',
                      difficulty: updatedChallenge.difficulty,
                      thumbnailUrl: updatedChallenge.thumbnail_url || '',
                    }
                  : challenge
              ))
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedChallengeId = payload.old.id
            console.log('🗑️ Challenge deleted:', deletedChallengeId)
            
            // Remove from challenges list
            setChallenges(prev => prev.filter(challenge => challenge.databaseId !== deletedChallengeId))
            
            // Remove from user challenges
            setUserChallenges(prev => prev.filter(challenge => challenge.databaseId !== deletedChallengeId))
            
            toast({
              title: "Challenge removed",
              description: "A challenge has been deleted.",
            })
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Unsubscribing from challenges realtime')
      supabase.removeChannel(subscription)
    }
  }, [user?.id]) // Re-setup subscription when user changes

  // Auto-switch to "all" tab when search starts with smooth transition
  useEffect(() => {
    if (effectiveSearchTerm && activeTab !== "all") {
      startTransition(() => {
        handleTabChange("all")
      })
    }
  }, [effectiveSearchTerm, activeTab, handleTabChange])

  // Stable filter function to prevent recreations
  const filterChallenges = useCallback((
    allChallenges: Challenge[], 
    userOnlyChallenges: Challenge[], 
    searchTerm: string, 
    tabFilter: string
  ) => {
    // Use search term if available
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      return allChallenges.filter(challenge => {
        const titleMatch = challenge.title.toLowerCase().includes(lowerSearchTerm)
        const descMatch = challenge.description.toLowerCase().includes(lowerSearchTerm)
        const topicMatch = challenge.topics?.some(topic => 
          topic.toLowerCase().includes(lowerSearchTerm)
        )
        return titleMatch || descMatch || topicMatch
      })
    }

    // No search - filter by tab
    switch (tabFilter) {
      case "user":
        return userOnlyChallenges
      case "all":
        return allChallenges
      case "beginner":
      case "intermediate":
      case "advanced":
        return allChallenges.filter(challenge => challenge.difficulty === tabFilter)
      default:
        return allChallenges
    }
  }, [])
  // Optimized filtering with stable dependencies and smooth updates
  const filteredChallenges = useMemo(() => {
    // Use debounced search for smoother filtering
    const searchTermToUse = debouncedSearchTerm || effectiveSearchTerm
    
    return filterChallenges(challenges, userChallenges, searchTermToUse, activeTab)
  }, [challenges, userChallenges, debouncedSearchTerm, effectiveSearchTerm, activeTab, filterChallenges])

  // Stable grid key to prevent unnecessary re-mounts
  const gridKey = useMemo(() => {
    const searchKey = debouncedSearchTerm ? `search-${debouncedSearchTerm}` : `tab-${activeTab}`
    return `${searchKey}-${filteredChallenges.length}`
  }, [debouncedSearchTerm, activeTab, filteredChallenges.length])

  // Handle challenge creation - optimized
  const handleChallengeCreated = useCallback((newChallenge: Challenge) => {
    // Ensure the new challenge has the current user's ID
    const challengeWithUserId = {
      ...newChallenge,
      user_id: user?.id || newChallenge.user_id
    }
    
    // Thêm thử thách mới vào danh sách user challenges
    const updatedUserChallenges = [challengeWithUserId, ...userChallenges]
    const updatedAllChallenges = [challengeWithUserId, ...challenges]
    
    setUserChallenges(updatedUserChallenges)
    setChallenges(updatedAllChallenges)    
    
    // Debounced localStorage save to avoid blocking UI
    saveToLocalStorage('userChallenges', updatedUserChallenges)

    // Hiển thị thông báo thành công
    toast({
      title: "Challenge created",
      description: "Your challenge has been added to the list",
    })
    
    // Switch to user challenges tab to show the new challenge
    handleTabChange("user")
  }, [userChallenges, challenges, saveToLocalStorage, handleTabChange, user?.id])

  // Handle when user starts a challenge
  const handleStartChallenge = useCallback((id: string) => {
    // Tìm challenge với id tương ứng
    const challenge = challenges.find(c => c.id === id)
    
    if (challenge) {
      // Convert challenge to have proper format for unified challenges table
      const practiceChallenge: Challenge = {
        ...challenge,
        // Ensure it has proper video properties for the database lookup
        videoUrl: challenge.videoUrl || challenge.embedUrl || "",
        embedUrl: challenge.embedUrl || challenge.videoUrl || "",
      }
      
      // Set practice mode and challenge
      setChallengeMode('practice')
      setCurrentChallenge(practiceChallenge)
      
      // Set challenge được chọn để hiển thị ở "Your Current Challenge"
      onSelectedChallengeChange(practiceChallenge)
      
      toast({
        title: "Practice Challenge started",
        description: `Started: ${challenge.title}`,
      })
      
      // Scroll lên top để user có thể thấy "Your Practice Challenge"
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      console.error("❌ [ChallengeTabs] Challenge not found with ID:", id)
      toast({
        title: "Error",
        description: "Challenge not found",
        variant: "destructive",
      })
    }
  }, [challenges, onSelectedChallengeChange, setChallengeMode, setCurrentChallenge])

  // Handle when a challenge is deleted
  const handleChallengeDeleted = useCallback((deletedId: string) => {
    // Remove from both challenges and userChallenges arrays
    setChallenges(prev => prev.filter(c => c.id !== deletedId))
    setUserChallenges(prev => prev.filter(c => c.id !== deletedId))
    
    // Also remove from localStorage (only if it belongs to current user)
    try {
      const savedChallenges = localStorage.getItem("userChallenges")
      if (savedChallenges && user?.id) {
        const parsedChallenges = JSON.parse(savedChallenges)
        const updatedChallenges = parsedChallenges.filter((c: Challenge) => 
          c.id !== deletedId && c.user_id === user.id // Only keep challenges that don't match deletedId and belong to current user
        )
        localStorage.setItem("userChallenges", JSON.stringify(updatedChallenges))
      }
    } catch (error) {
      console.error("Error updating localStorage after deletion:", error)
    }
    
    toast({
      title: "Challenge deleted",
      description: "Your challenge has been successfully removed.",
    })
  }, [user?.id])

  return (
    <>      
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Desktop tabs - visible on md+ screens */}
        <TabsList className="hidden md:grid w-full grid-cols-5 mb-6">
          <TabsTrigger 
            value="all" 
            className={`challenge-tab-trigger transition-all duration-200 ${effectiveSearchTerm ? "bg-blue-100 text-blue-800" : ""}`}
          >
            All {effectiveSearchTerm && "🔍"}
          </TabsTrigger>
          <TabsTrigger value="user" disabled={!!effectiveSearchTerm} className="challenge-tab-trigger">Your Challenges</TabsTrigger>
          <TabsTrigger value="beginner" disabled={!!effectiveSearchTerm} className="challenge-tab-trigger">Beginner</TabsTrigger>
          <TabsTrigger value="intermediate" disabled={!!effectiveSearchTerm} className="challenge-tab-trigger">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced" disabled={!!effectiveSearchTerm} className="challenge-tab-trigger">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user" className="challenge-tab-content mt-6">
          <div className="mb-4 transition-opacity duration-200" style={{ opacity: isPending ? 0.7 : 1 }}>
            <h3 className="text-lg font-semibold text-foreground">Your Created Challenges</h3>
            <p className="text-sm text-muted-foreground">
              {!user ? 'Please log in to see your challenges' : `Challenges you've created • ${filteredChallenges.length} available`}
            </p>
          </div>
          
          {!user ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You need to be logged in to view your challenges.</p>
              <Button onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
            </div>
          ) : (
            <div 
              key={gridKey}
              className="challenge-filter-transition transition-all duration-300 ease-in-out"
              style={{ 
                opacity: isPending ? 0.8 : 1,
                transform: isPending ? 'translateY(4px)' : 'translateY(0px)'
              }}
            >
              <OptimizedChallengeGrid
                challenges={filteredChallenges}
                onStartChallenge={handleStartChallenge}
                loading={loading}
                emptyMessage="You haven't created any challenges yet"
                emptyAction={() => setCreateModalOpen(true)}
                emptyActionLabel="Create Your First Challenge"
                useVirtualScroll={filteredChallenges.length > 20}
                showDeleteButton={true}
                userId={user?.id}
                onChallengeDeleted={handleChallengeDeleted}
              />
            </div>
          )}
        </TabsContent>          
        <TabsContent value="all" className="challenge-tab-content mt-6">
          <div className="mb-4 transition-opacity duration-200" style={{ opacity: isPending ? 0.7 : 1 }}>
            <h3 className="text-lg font-semibold text-foreground">
              {effectiveSearchTerm ? `Search Results for "${effectiveSearchTerm}"` : "All Challenges"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {effectiveSearchTerm 
                ? `Found ${filteredChallenges.length} challenges matching your search`
                : `Auto-generated + User challenges • ${filteredChallenges.length} total`
              }
            </p>
          </div>
          
          <div 
            key={gridKey}
            className="challenge-filter-transition transition-all duration-300 ease-in-out"
            style={{ 
              opacity: isPending ? 0.8 : 1,
              transform: isPending ? 'translateY(4px)' : 'translateY(0px)'
            }}
          >
            <OptimizedChallengeGrid
              challenges={filteredChallenges}
              onStartChallenge={handleStartChallenge}
              loading={loading}
              emptyMessage={effectiveSearchTerm 
                ? `No challenges found matching "${effectiveSearchTerm}"`
                : "No challenges found matching your criteria"
              }
              emptyAction={() => setCreateModalOpen(true)}
              emptyActionLabel="Create a Challenge"
              useVirtualScroll={false}
              useInfiniteScroll={false}
              showDeleteButton={true}
              userId={user?.id}
              onChallengeDeleted={handleChallengeDeleted}
            />
          </div>
        </TabsContent>
        <TabsContent value="beginner" className="challenge-tab-content mt-6">
          <div className="mb-4 transition-opacity duration-200" style={{ opacity: isPending ? 0.7 : 1 }}>
            <h3 className="text-lg font-semibold text-foreground">Beginner Challenges</h3>
            <p className="text-sm text-muted-foreground">Perfect for starting your English journey • {filteredChallenges.length} available</p>
          </div>

          <div 
            key={gridKey}
            className="challenge-filter-transition transition-all duration-300 ease-in-out"
            style={{ 
              opacity: isPending ? 0.8 : 1,
              transform: isPending ? 'translateY(4px)' : 'translateY(0px)'
            }}
          >
            <OptimizedChallengeGrid
              challenges={filteredChallenges}
              onStartChallenge={handleStartChallenge}
              loading={loading}
              emptyMessage="No beginner challenges found"
              emptyAction={() => setCreateModalOpen(true)}
              emptyActionLabel="Create a Beginner Challenge"
              useVirtualScroll={filteredChallenges.length > 20}
              showDeleteButton={true}
              userId={user?.id}
              onChallengeDeleted={handleChallengeDeleted}
            />
          </div>
        </TabsContent>        <TabsContent value="intermediate" className="challenge-tab-content mt-6">
          <div className="mb-4 transition-opacity duration-200" style={{ opacity: isPending ? 0.7 : 1 }}>
            <h3 className="text-lg font-semibold text-foreground">Intermediate Challenges</h3>
            <p className="text-sm text-muted-foreground">Level up your skills • {filteredChallenges.length} available</p>
          </div>

          <div 
            key={gridKey}
            className="challenge-filter-transition transition-all duration-300 ease-in-out"
            style={{ 
              opacity: isPending ? 0.8 : 1,
              transform: isPending ? 'translateY(4px)' : 'translateY(0px)'
            }}
          >
            <OptimizedChallengeGrid
              challenges={filteredChallenges}
              onStartChallenge={handleStartChallenge}
              loading={loading}
              emptyMessage="No intermediate challenges found"
              emptyAction={() => setCreateModalOpen(true)}
              emptyActionLabel="Create an Intermediate Challenge"
              useVirtualScroll={filteredChallenges.length > 20}
              showDeleteButton={true}
              userId={user?.id}
              onChallengeDeleted={handleChallengeDeleted}
            />
          </div>
        </TabsContent>
        <TabsContent value="advanced" className="challenge-tab-content mt-6">
          <div className="mb-4 transition-opacity duration-200" style={{ opacity: isPending ? 0.7 : 1 }}>
            <h3 className="text-lg font-semibold text-foreground">Advanced Challenges</h3>
            <p className="text-sm text-muted-foreground">Master-level challenges • {filteredChallenges.length} available</p>
          </div>
          
          <div 
            key={gridKey}
            className="challenge-filter-transition transition-all duration-300 ease-in-out"
            style={{ 
              opacity: isPending ? 0.8 : 1,
              transform: isPending ? 'translateY(4px)' : 'translateY(0px)'
            }}
          >
            <OptimizedChallengeGrid
              challenges={filteredChallenges}
              onStartChallenge={handleStartChallenge}
              loading={loading}
              emptyMessage="No advanced challenges found"
              emptyAction={() => setCreateModalOpen(true)}
              emptyActionLabel="Create an Advanced Challenge"
              useVirtualScroll={filteredChallenges.length > 20}
              showDeleteButton={true}
              userId={user?.id}
              onChallengeDeleted={handleChallengeDeleted}
            />
          </div>
        </TabsContent>
      </Tabs>

      <CreateChallengeModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onChallengeCreated={handleChallengeCreated}
      />
    </>
  )
}
