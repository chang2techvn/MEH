"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock } from "lucide-react"
import { getDifficultyBadgeColor, getDifficultyDisplayName } from "@/app/utils/challenge-classifier"

interface ChallengeCardProps {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  duration: number
  difficulty: string
  onStart: (id: string) => void
}

export default function ChallengeCard({
  id,
  title,
  description,
  thumbnailUrl,
  duration,
  difficulty,
  onStart,
}: ChallengeCardProps) {
  // Format duration from seconds to minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")} minutes`
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl || "/placeholder.svg"}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={getDifficultyBadgeColor(difficulty)}>{getDifficultyDisplayName(difficulty)}</Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t">
        <Button className="w-full" onClick={() => onStart(id)}>
          Start Challenge
        </Button>
      </CardFooter>
    </Card>
  )
}
