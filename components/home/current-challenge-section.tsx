"use client"

import { Suspense, lazy, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { type Challenge } from "@/lib/utils/challenge-constants"
import { getVideoSettings } from "@/app/actions/admin-settings"
import { formatTime } from "@/components/youtube/youtube-api"
import { useChallenge } from "@/contexts/challenge-context"
const HeroSection = lazy(() => import("@/components/home/hero-section"))
const AssignedTask = lazy(() => import("@/components/home/assigned-task"))

interface CurrentChallengeSectionProps {
  currentChallenge: Challenge | null
  challengeLoading: boolean
  showToggle?: boolean
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}



const LoadingFallback = () => (
  <div className="space-y-3 sm:space-y-4">
    <Skeleton className="h-6 sm:h-8 w-3/4" />
    <Skeleton className="h-20 sm:h-24 lg:h-32 w-full" />
  </div>
)

export function CurrentChallengeSection({ 
  currentChallenge, 
  challengeLoading,
  showToggle,
  sidebarCollapsed,
  onToggleSidebar
}: CurrentChallengeSectionProps) {
  const [watchTimeText, setWatchTimeText] = useState("3:00")
  const { challengeMode } = useChallenge()

  useEffect(() => {
    const loadWatchTime = async () => {
      try {
        const settings = await getVideoSettings()
        // Use formatTime for consistent mm:ss format
        setWatchTimeText(formatTime(settings.minWatchTime))
      } catch (error) {
        console.error("Failed to load watch time:", error)
        setWatchTimeText("3:00") // fallback
      }
    }

    loadWatchTime()
  }, [])
  if (challengeLoading) {
    return (
      <Card className="neo-card p-4 sm:p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-none shadow-neo">
        <LoadingFallback />
      </Card>
    )
  }

  if (!currentChallenge) {
    return (
      <Card className="neo-card p-4 sm:p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-none shadow-neo">
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="h-6 sm:h-8 w-3/4" />
          <Skeleton className="h-3 sm:h-4 w-full" />
          <Skeleton className="h-24 sm:h-32 w-full" />
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
            <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Suspense fallback={<LoadingFallback />}>      
      <HeroSection
        title={challengeMode === 'practice' ? "Your Practice Challenge" : "Your Current Challenge"}
        description={`Watch this ${watchTimeText} video about how technology is changing our daily lives and follow the 4-skill process.`}
        showToggle={showToggle}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Remount AssignedTask on challenge change to reset step state */}
          <AssignedTask
            key={`${challengeMode}-${currentChallenge.id}`}
            title={currentChallenge.title}
            description={currentChallenge.description}
            videoUrl={currentChallenge.videoUrl}
            dueDate={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            userId="current-user"
            username="You"
            userImage="/placeholder.svg?height=40&width=40"
          />
        </Suspense>
      </HeroSection>
    </Suspense>
  )
}
