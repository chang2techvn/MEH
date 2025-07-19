"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { extractVideoFromUrl, createChallenge } from "@/app/actions/youtube-video"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import {type Challenge } from '@/lib/utils/challenge-constants'
import {supabase} from "@/lib/supabase"


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
  const [progressStep, setProgressStep] = useState<string>('')
  const [cachedUser, setCachedUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(false)

  // Load user authentication immediately when component mounts
  useEffect(() => {
    if (!cachedUser) {
      setUserLoading(true)
      console.log("🔐 Loading user authentication on component mount...")
      
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          console.log("✅ User cached on mount:", user.id)
          setCachedUser(user)
        } else {
          console.log("ℹ️ No authenticated user found")
          // Don't set error here, user might not be logged in yet
        }
        setUserLoading(false)
      }).catch((err) => {
        console.error("❌ Error loading user:", err)
        setUserLoading(false)
      })
    }
  }, [cachedUser])

  // Clear form state when modal closes, but keep user cached
  useEffect(() => {
    if (!open) {
      setError(null)
      setProgressStep('')
      setYoutubeUrl("")
      setDifficulty("intermediate")
    }
  }, [open])

  // Listen for auth state changes to update cached user
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log("🚪 User signed out, clearing cached user")
        setCachedUser(null)
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log("🔑 User signed in, updating cached user")
        setCachedUser(session.user)
        setUserLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("🎯 === CREATE CHALLENGE SUBMIT ===")
    console.log("📹 YouTube URL:", youtubeUrl)
    console.log("🎚️ Difficulty:", difficulty)

    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      if (!cachedUser) {
        console.error("❌ No authenticated user available")
        setError("Please log in to create challenges")
        setLoading(false)
        return
      }
      
      console.log("✅ Using cached user:", cachedUser.id)
      setProgressStep("Video processing may take some time. You can do other things and we'll notify you when it's completed")
      console.log("🚀 Creating user-generated challenge...")

      // Create user-generated challenge using the new API
      const challengeResult = await createChallenge('user_generated', {
        videoUrl: youtubeUrl,
        userId: cachedUser.id,
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced'
      })

      setProgressStep('Finalizing challenge...')
      console.log("✅ Challenge created successfully:", challengeResult)

      // Handle single challenge result (user_generated always returns single challenge)
      const challenge = Array.isArray(challengeResult) ? challengeResult[0] : challengeResult
      
      if (!challenge) {
        throw new Error("Failed to create challenge - no data returned")
      }

      // Convert ChallengeData to Challenge format for the UI
      const uiChallenge: Challenge = {
        id: challenge.id || '',
        databaseId: challenge.id || '',
        videoId: challenge.video_url?.split('v=')[1]?.split('&')[0] || challenge.id || '',
        title: challenge.title,
        description: challenge.description || '',
        difficulty: challenge.difficulty,
        duration: challenge.duration || 0,
        thumbnailUrl: challenge.thumbnail_url || '',
        videoUrl: challenge.video_url || '',
        embedUrl: challenge.embed_url || '',
        topics: challenge.topics || [],
        isAutoGenerated: false,
        createdAt: challenge.created_at || new Date().toISOString(),
        transcript: challenge.transcript || ''
      }

      console.log("🎨 UI Challenge object:", uiChallenge)

      // Reset form
      setYoutubeUrl("")
      setDifficulty("intermediate")

      // Notify parent component
      onChallengeCreated(uiChallenge)

      // Close modal
      onOpenChange(false)

      // Show success toast
      toast({
        title: "Challenge created",
        description: "Your challenge has been created successfully",
      })
      
      console.log("🎉 Challenge creation process completed")
    } catch (err) {
      console.error("❌ Error creating challenge:", err)
      
      // More detailed error handling with user-friendly messages
      let errorMessage = "Failed to create challenge"
      
      if (err instanceof Error) {
        console.error("Error details:", {
          message: err.message,
          stack: err.stack,
          name: err.name
        })
        
        // Handle specific error types
        if (err.message.includes('duplicate key value violates unique constraint')) {
          if (err.message.includes('challenges_practice_video_unique_idx')) {
            errorMessage = "This video has already been used today. Please try a different video."
          } else {
            errorMessage = "This challenge already exists. Please try a different video or modify your approach."
          }
        } else if (err.message.includes('Gemini cannot access') || err.message.includes('cannot access')) {
          errorMessage = "Unable to access this YouTube video. Please try a different video that is publicly available."
        } else if (err.message.includes('Invalid YouTube URL')) {
          errorMessage = "Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)"
        } else if (err.message.includes('No active API key found')) {
          errorMessage = "Service temporarily unavailable. Please try again later."
        } else if (err.message.includes('Quota exceeded') || err.message.includes('429')) {
          errorMessage = "Service limit reached. Please try again in a few minutes."
        } else if (err.message.includes('403') || err.message.includes('Invalid API key')) {
          errorMessage = "Service configuration error. Please contact support."
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again."
        } else {
          errorMessage = err.message
        }
      } else {
        console.error("Unknown error type:", err)
        errorMessage = "An unexpected error occurred. Please try again."
      }
      
      setError(errorMessage)
      
      // Show error toast for better UX
      toast({
        title: "Error creating challenge",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setProgressStep('')
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
          {!cachedUser && !userLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in to create challenges
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {userLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Loading user authentication...
              </AlertDescription>
            </Alert>
          )}

          {loading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="flex items-center gap-2">
                {progressStep || 'Creating challenge...'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube Video URL</Label>
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={loading || userLoading || !cachedUser}
            />
            <p className="text-xs text-muted-foreground">
              Paste any YouTube URL format (youtube.com/watch, youtu.be, or embed links)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty} disabled={loading || userLoading || !cachedUser}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading || userLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || userLoading || !cachedUser}
              className="bg-gradient-to-r from-neo-mint to-purist-blue text-white"
            >
              {userLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : loading ? (
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
