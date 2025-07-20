"use client"

import React, { memo, useCallback, useMemo, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Trash2, MoreVertical } from "lucide-react"
import { getDifficultyBadgeColor, getDifficultyDisplayName, getDifficultyBadgeStyle } from "@/lib/utils/challenge-classifier"
import OptimizedImage from "@/components/optimized/optimized-image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteChallenge } from "@/app/actions/delete-challenge"
import { toast } from "@/hooks/use-toast"

interface ChallengeCardProps {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  duration: number
  difficulty: string
  onStart: (id: string) => void
  isUserGenerated?: boolean
  userId?: string
  onDelete?: (id: string) => void
  challenge?: {
    challenge_type?: string
    user_id?: string
  }
}

const ChallengeCard = memo(function ChallengeCard({
  id,
  title,
  description,
  thumbnailUrl,
  duration,
  difficulty,
  onStart,
  isUserGenerated = false,
  userId,
  onDelete,
  challenge,
}: ChallengeCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Control dropdown menu open state to ensure it closes properly
  const [menuOpen, setMenuOpen] = useState(false)

  // Determine if delete button should be shown
  const canDelete = useMemo(() => {
    // Show delete button only for user-generated challenges
    const isUserGeneratedChallenge = challenge?.challenge_type === 'user_generated' || isUserGenerated
    // And only if the current user is the owner
    const isOwner = userId && challenge?.user_id === userId
    
    return isUserGeneratedChallenge && isOwner
  }, [challenge?.challenge_type, challenge?.user_id, userId, isUserGenerated])

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

  // Handle delete action
  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      const result = await deleteChallenge(id, userId)
      
      if (result.success) {
        toast({
          title: "Challenge deleted",
          description: "Your challenge has been successfully deleted.",
        })
        // Call onDelete callback to update parent component
        onDelete?.(id)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete challenge",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting challenge:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the challenge",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }, [id, userId, onDelete])
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
          {/* Add delete button for user-generated challenges */}
          {canDelete && (
            <div className="absolute top-2 left-2">
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm border-0"
                  >
                    <MoreVertical className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => { setMenuOpen(false); setDeleteDialogOpen(true) }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Challenge
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this challenge? This action cannot be undone.
              <br />
              <strong>Challenge:</strong> {title}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
})

export default ChallengeCard
