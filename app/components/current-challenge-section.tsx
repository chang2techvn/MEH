"use client"

import { Suspense, lazy } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Award } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { type Challenge } from "../utils/challenge-constants"

const AssignedTask = lazy(() => import("@/components/assigned-task"))

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
    <Card className="neo-card overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-none shadow-neo">
      <div className="bg-gradient-to-r from-neo-mint to-purist-blue p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-white">Today's Challenge</h3>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            {currentChallenge.difficulty}
          </Badge>
        </div>
      </div>      <div className="p-6">
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
      </div>
    </Card>
  )
}
