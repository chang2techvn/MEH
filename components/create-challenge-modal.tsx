"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { extractVideoFromUrl } from "@/app/actions/youtube-video"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import {type Challenge } from '@/app/utils/challenge-constants'

interface CreateChallengeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChallengeCreated: (challenge: Challenge) => void
}

export default function CreateChallengeModal({ open, onOpenChange, onChallengeCreated }: CreateChallengeModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Extract video data from YouTube URL
      const videoData = await extractVideoFromUrl(youtubeUrl)

      if (!videoData) {
        throw new Error("Could not extract video information from the provided URL")
      }

      // Create challenge object
      const newChallenge: Challenge = {
        id: videoData.id,
        title: videoData.title,
        description: videoData.description,
        thumbnailUrl: videoData.thumbnailUrl,
        videoUrl: videoData.videoUrl,
        embedUrl: videoData.embedUrl,
        duration: videoData.duration,
        difficulty: difficulty,
        createdAt: new Date().toISOString(),
        topics: videoData.topics,
      }

      // In a real app, you would save this to your database
      // For now, we'll just pass it to the parent component
      onChallengeCreated(newChallenge)

      // Reset form
      setYoutubeUrl("")
      setDifficulty("intermediate")

      // Close modal
      onOpenChange(false)

      // Show success toast
      toast({
        title: "Challenge created",
        description: "Your challenge has been created successfully",
      })
    } catch (err) {
      console.error("Error creating challenge:", err)
      setError(err instanceof Error ? err.message : "Failed to create challenge")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Challenge</DialogTitle>
          <DialogDescription>
            Enter a YouTube URL to create a new challenge. The video will be automatically analyzed and added to the
            challenges list.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube Video URL</Label>
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Paste the full URL of a YouTube video you want to use for your challenge
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty} disabled={loading}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Choose the difficulty level for this challenge</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-neo-mint to-purist-blue text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Challenge"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
