"use client"

import React, { memo, useCallback, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock } from "lucide-react"
import { getDifficultyBadgeColor, getDifficultyDisplayName, getDifficultyBadgeStyle } from "@/lib/utils/challenge-classifier"
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
  const difficultyBadgeStyle = useMemo(() => getDifficultyBadgeStyle(difficulty), [difficulty])
  const difficultyDisplayName = useMemo(() => getDifficultyDisplayName(difficulty), [difficulty])

  // Memoize click handler to prevent unnecessary re-renders
  const handleStart = useCallback(() => {
    onStart(id)
  }, [onStart, id])
  return (
    <Card className="h-full min-h-[320px] flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">        
        <div className="aspect-video bg-muted relative overflow-hidden flex-shrink-0">
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
          )}
          <div className="absolute top-2 right-2">
            <div 
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
              style={difficultyBadgeStyle}
            >
              {difficultyDisplayName}
            </div>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3 min-h-[4rem]">
              {truncatedDescription}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm mt-auto">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDuration}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t mt-auto">
        <Button 
          className="w-full bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0" 
          onClick={handleStart}
        >
          Start Challenge
        </Button>
      </CardFooter>
    </Card>
  )
})

export default ChallengeCard
