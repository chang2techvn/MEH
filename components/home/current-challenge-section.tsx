"use client"

import { Suspense, lazy, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { type Challenge } from "@/utils/challenge-constants"
import { getVideoSettings } from "@/app/actions/admin-settings"
const HeroSection = lazy(() => import("@/components/home/hero-section"))
const AssignedTask = lazy(() => import("@/components/home/assigned-task"))

interface CurrentChallengeSectionProps {
  currentChallenge: Challenge | null
  challengeLoading: boolean
}



const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-32 w-full" />
  </div>
)

export function CurrentChallengeSection({ 
  currentChallenge, 
  challengeLoading 
}: CurrentChallengeSectionProps) {
  const [watchTimeText, setWatchTimeText] = useState("3-minute")

  useEffect(() => {
    const loadWatchTime = async () => {
      try {
        const settings = await getVideoSettings()
        const minutes = Math.ceil(settings.minWatchTime / 60)
        const seconds = settings.minWatchTime % 60
        
        if (seconds > 0) {
          setWatchTimeText(`${minutes}m ${seconds}s`)
        } else {
          setWatchTimeText(`${minutes}-minute`)
        }
      } catch (error) {
        console.error("Failed to load watch time:", error)
        setWatchTimeText("3-minute") // fallback
      }
    }

    loadWatchTime()
  }, [])
  if (challengeLoading) {
    return (
      <Card className="neo-card p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-none shadow-neo">
        <LoadingFallback />
      </Card>
    )
  }

  if (!currentChallenge) {
    return (
      <Card className="neo-card p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-none shadow-neo">
        <div className="text-center py-8">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Active Challenge</h3>
          <p className="text-muted-foreground">Check back later for new challenges!</p>
        </div>
      </Card>
    )
  }

  return (

    <Suspense fallback={<LoadingFallback />}>      
    <HeroSection
        title="Your Current Challenge"
        description={`Watch this ${watchTimeText} video about how technology is changing our daily lives and follow the 4-skill process.`}
      >
      <Suspense fallback={<LoadingFallback />}>
        <AssignedTask
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
