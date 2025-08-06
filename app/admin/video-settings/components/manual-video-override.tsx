"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Link, Check, AlertTriangle, Video, Clock, Tag } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { extractVideoFromUrl, setAdminSelectedVideo, type VideoData } from "@/app/actions/youtube-video"

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

interface ManualVideoOverrideProps {
  onVideoSet?: (video: VideoData) => void
}

export function ManualVideoOverride({ onVideoSet }: ManualVideoOverrideProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [previewVideo, setPreviewVideo] = useState<VideoData | null>(null)
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

  // Extract video data from URL
  const handleExtractVideo = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setPreviewVideo(null)

      const videoData = await extractVideoFromUrl(url)

      if (!videoData) {
        throw new Error("Could not extract video information from the provided URL")
      }

      setPreviewVideo(videoData)
      
      toast({
        title: "Video extracted successfully",
        description: "Preview the video details below and confirm to set as today's video",
      })
    } catch (err) {
      console.error("Error extracting video:", err)
      setError(err instanceof Error ? err.message : "Failed to extract video data")

      toast({
        title: "Error extracting video",
        description: err instanceof Error ? err.message : "Failed to extract video data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Set as today's video
  const handleSetAsToday = async () => {
    if (!previewVideo) return

    try {
      setLoading(true)

      // Set as the selected video
      await setAdminSelectedVideo(previewVideo)

      toast({
        title: "Video updated successfully",
        description: "The video has been set as today's daily challenge",
      })

      // Clear form
      setUrl("")
      setPreviewVideo(null)
      setError(null)

      // Notify parent component
      onVideoSet?.(previewVideo)
    } catch (err) {
      console.error("Error setting video:", err)
      toast({
        title: "Error setting video",
        description: err instanceof Error ? err.message : "Failed to set video as today's challenge",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Clear preview
  const handleClear = () => {
    setUrl("")
    setPreviewVideo(null)
    setError(null)
  }

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Manual Video Override
          </CardTitle>
          <CardDescription>
            Override today's automatic video with a manually selected YouTube video
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <div className="flex gap-2">
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleExtractVideo()
                    }
                  }}
                />
                <Button
                  onClick={handleExtractVideo}
                  disabled={loading || !url.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Video className="h-4 w-4" />
                  )}
                  Extract
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a YouTube URL to preview and set as today's daily video
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Video Preview */}
            {previewVideo && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Video Preview</span>
                </div>

                {/* Video Title */}
                <div>
                  <h3 className="font-semibold text-lg leading-tight">
                    {previewVideo.title}
                  </h3>
                  {previewVideo.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {previewVideo.description}
                    </p>
                  )}
                </div>

                {/* Video Thumbnail */}
                {previewVideo.thumbnailUrl && (
                  <div className="relative rounded-lg overflow-hidden bg-muted">
                    <img
                      src={previewVideo.thumbnailUrl}
                      alt={previewVideo.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <a
                        href={previewVideo.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-white transition-colors"
                      >
                        <Video className="h-3 w-3" />
                        View Video
                      </a>
                    </div>
                  </div>
                )}

                {/* Video Details */}
                <div className="flex flex-wrap gap-2">
                  {previewVideo.duration && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(previewVideo.duration)}
                    </Badge>
                  )}
                  
                  {previewVideo.topics && previewVideo.topics.length > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {previewVideo.topics.join(', ')}
                    </Badge>
                  )}
                  
                  {previewVideo.transcript && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Transcript Available
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSetAsToday}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Set as Today's Video
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    disabled={loading}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
