"use client"

import React, { memo, useCallback, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock } from "lucide-react"
import { getDifficultyBadgeColor, getDifficultyDisplayName } from "@/utils/challenge-classifier"
import OptimizedImage from "@/components/optimized/optimized-image"

interface ChallengeCardProps {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  duration: number
  difficulty: string
  onStart: (id: string) => void
}

const ChallengeCard = memo(function ChallengeCard({
  id,
  title,
  description,
  thumbnailUrl,
  duration,
  difficulty,
  onStart,
}: ChallengeCardProps) {
  // Memoize formatted duration to avoid recalculation
  const formattedDuration = useMemo(() => {
    const minutes = Math.floor(duration / 60)
    const remainingSeconds = duration % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")} minutes`
  }, [duration])

  // Memoize truncated description
  const truncatedDescription = useMemo(() => {
    return description.length > 100 ? `${description.substring(0, 100)}...` : description
  }, [description])

  // Memoize difficulty badge color to avoid repeated function calls
  const difficultyBadgeColor = useMemo(() => getDifficultyBadgeColor(difficulty), [difficulty])
  const difficultyDisplayName = useMemo(() => getDifficultyDisplayName(difficulty), [difficulty])

  // Memoize click handler to prevent unnecessary re-renders
  const handleStart = useCallback(() => {
    onStart(id)
  }, [onStart, id])

  return (
    <Card>
      <CardContent className="p-0">        
        <div className="aspect-video bg-muted relative overflow-hidden">
          {thumbnailUrl ? (
            <OptimizedImage
              src={thumbnailUrl}
              alt={title}
              width={400}
              height={225}
              className="w-full h-full"
              fallbackSrc="/placeholder.svg"
              lazyBoundary="300px"
              fetchPriority="auto"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}<div className="absolute top-2 right-2">
            <Badge className={difficultyBadgeColor}>{difficultyDisplayName}</Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {truncatedDescription}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDuration}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t">
        <Button className="w-full" onClick={handleStart}>
          Start Challenge
        </Button>
      </CardFooter>
    </Card>
  )
})

export default ChallengeCard
