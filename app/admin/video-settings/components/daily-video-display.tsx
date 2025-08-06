"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, Video, RefreshCw, Eye, FileText, Tag, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { getTodayVideo, type VideoData } from "@/app/actions/youtube-video"
import { triggerDailyVideoAutomation } from "@/app/actions/daily-video-admin"

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

interface DailyVideoDisplayProps {
  onVideoUpdate?: () => void
}

export function DailyVideoDisplay({ onVideoUpdate }: DailyVideoDisplayProps) {
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Load today's video
  const loadTodayVideo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const video = await getTodayVideo()
      setVideoData(video)
    } catch (err) {
      console.error('Error loading today\'s video:', err)
      setError(err instanceof Error ? err.message : 'Failed to load today\'s video')
    } finally {
      setLoading(false)
    }
  }

  // Handle regenerate video
  const handleRegenerateVideo = async () => {
    try {
      setRegenerating(true)
      
      const result = await triggerDailyVideoAutomation()
      
      if (result.success) {
        toast({
          title: "Video regeneration started",
          description: "The daily video automation has been triggered. Please wait a moment for the new video.",
        })
        
        // Wait a bit then reload
        setTimeout(() => {
          loadTodayVideo()
          onVideoUpdate?.()
        }, 3000)
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('Error regenerating video:', err)
      toast({
        title: "Regeneration failed",
        description: err instanceof Error ? err.message : 'Failed to regenerate video',
        variant: "destructive",
      })
    } finally {
      setRegenerating(false)
    }
  }

  // Load video on mount
  useEffect(() => {
    loadTodayVideo()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Today's Daily Video
          </CardTitle>
          <CardDescription>Loading current daily challenge video...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Today's Daily Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={loadTodayVideo} 
            variant="outline" 
            className="mt-4"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Today's Daily Video
              </CardTitle>
              <CardDescription>
                {formatDate(new Date().toISOString())}
              </CardDescription>
            </div>
            <Button
              onClick={handleRegenerateVideo}
              disabled={regenerating}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {videoData ? (
            <div className="space-y-4">
              {/* Video Title */}
              <div>
                <h3 className="font-semibold text-lg leading-tight">
                  {videoData.title}
                </h3>
                {videoData.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {videoData.description}
                  </p>
                )}
              </div>

              {/* Video Thumbnail */}
              {videoData.thumbnailUrl && (
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <img
                    src={videoData.thumbnailUrl}
                    alt={videoData.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <a
                      href={videoData.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-white transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      View Video
                    </a>
                  </div>
                </div>
              )}

              {/* Video Details */}
              <div className="flex flex-wrap gap-2">
                {videoData.duration && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(videoData.duration)}
                  </Badge>
                )}
                
                {videoData.topics && videoData.topics.length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {videoData.topics.join(', ')}
                  </Badge>
                )}
                
                {videoData.transcript && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Transcript Available
                  </Badge>
                )}
              </div>

              {/* Transcript Preview */}
              {videoData.transcript && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Transcript Preview
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {videoData.transcript.substring(0, 200)}
                    {videoData.transcript.length > 200 && '...'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {videoData.transcript.length} characters total
                  </p>
                </div>
              )}

              {/* Video URL */}
              <div className="text-xs text-muted-foreground">
                <strong>Video ID:</strong> {videoData.id} <br />
                <strong>URL:</strong>{' '}
                <a
                  href={videoData.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {videoData.videoUrl}
                </a>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No daily video found for today. The automation may need to run to generate today's video.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
