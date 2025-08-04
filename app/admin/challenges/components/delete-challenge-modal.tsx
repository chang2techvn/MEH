"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Video } from "lucide-react"
import { getDifficultyDisplayName } from "@/app/utils/challenge-classifier"
import { formatDuration } from "../utils/format-utils"
import type { Challenge } from "@/app/actions/challenge-videos"

interface DeleteChallengeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  challenge: Challenge | null
  onConfirm: () => void
}

export default function DeleteChallengeModal({ open, onOpenChange, challenge, onConfirm }: DeleteChallengeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this challenge? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {challenge && (
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 bg-muted rounded overflow-hidden">
                {challenge.thumbnailUrl ? (
                  <img
                    src={challenge.thumbnailUrl || "/placeholder.svg"}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Video className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{challenge.title}</p>
                <p className="text-sm text-muted-foreground">
                  {getDifficultyDisplayName(challenge.difficulty)} • {formatDuration(challenge.duration || 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Challenge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
