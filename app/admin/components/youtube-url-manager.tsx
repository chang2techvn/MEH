"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Youtube,
  Check,
  AlertTriangle,
  RefreshCw,
  Link,
  ExternalLink,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  extractVideoFromUrl,
  setAdminSelectedVideo,
  getTodayVideo,
  fetchRandomYoutubeVideo,
} from "@/app/actions/youtube-video"
import type { VideoData } from "@/app/actions/youtube-video"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function YouTubeUrlManager() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Add new states for auto-fetching functionality
  const [currentDailyVideo, setCurrentDailyVideo] = useState<VideoData | null>(null)
  const [suggestedVideo, setSuggestedVideo] = useState<VideoData | null>(null)
  const [fetchingSuggestion, setFetchingSuggestion] = useState(false)
  const [loadingCurrentVideo, setLoadingCurrentVideo] = useState(true)
  const [activeTab, setActiveTab] = useState("current")

  // Fetch the current daily video when component mounts
  useEffect(() => {
    const fetchCurrentVideo = async () => {
      try {
        setLoadingCurrentVideo(true)

        // Fetch the current daily video
        const video = await getTodayVideo()
        setCurrentDailyVideo(video)

        // If this is an admin-selected video, also update the videoData state
        if (video && video.id === videoData?.id) {
          setVideoData(video)
        }
      } catch (err) {
        console.error("Error fetching current daily video:", err)
      } finally {
        setLoadingCurrentVideo(false)
      }
    }

    fetchCurrentVideo()

    // We only want to fetch this once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleExtractVideo = async () => {
    if (!url.trim()) {
      toast({
        title: "URL is required",
        description: "Please enter a YouTube video URL",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await extractVideoFromUrl(url)

      if (!data) {
        throw new Error("Failed to extract video data")
      }

      setVideoData(data)

      // Set as the selected video
      await setAdminSelectedVideo(data)
      setCurrentDailyVideo(data)

      toast({
        title: "Video extracted successfully",
        description: "The video has been set as today's challenge",
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

  // Add function to clear the selected video
  const handleClearVideo = async () => {
    try {
      // Clear the admin selection
      await setAdminSelectedVideo(null)
      setVideoData(null)
      setUrl("")

      // Fetch the default video that will be used (this will be a random video for today)
      const defaultVideo = await getTodayVideo()
      setCurrentDailyVideo(defaultVideo)

      toast({
        title: "Video cleared",
        description: "The system will now use the default video for today's challenge",
      })
    } catch (err) {
      console.error("Error clearing video:", err)

      toast({
        title: "Error clearing video",
        description: "Failed to clear the selected video",
        variant: "destructive",
      })
    }
  }

  // Add function to fetch a suggested video automatically
  const handleFetchSuggestedVideo = async () => {
    try {
      setFetchingSuggestion(true)
      setSuggestedVideo(null)

      // Fetch a random video with default parameters
      const video = await fetchRandomYoutubeVideo()

      setSuggestedVideo(video)

      toast({
        title: "Video suggestion fetched",
        description: "A new video has been suggested for today's challenge",
      })
    } catch (err) {
      console.error("Error fetching suggested video:", err)

      toast({
        title: "Error fetching suggestion",
        description: "Failed to fetch a suggested video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFetchingSuggestion(false)
    }
  }

  // Add function to approve the suggested video
  const handleApproveSuggestion = async () => {
    if (!suggestedVideo) return

    try {
      setLoading(true)

      // Set the suggested video as the selected video
      await setAdminSelectedVideo(suggestedVideo)
      setCurrentDailyVideo(suggestedVideo)
      setVideoData(suggestedVideo)
      setSuggestedVideo(null)

      toast({
        title: "Video approved",
        description: "The suggested video has been set as today's challenge",
      })
    } catch (err) {
      console.error("Error approving suggested video:", err)

      toast({
        title: "Error approving video",
        description: "Failed to approve the suggested video",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Add function to reject the suggested video
  const handleRejectSuggestion = () => {
    setSuggestedVideo(null)

    toast({
      title: "Video rejected",
      description: "The suggested video has been rejected",
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          YouTube Video Manager
        </CardTitle>
        <CardDescription>Manage the daily challenge video for your platform</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="current">Current Video</TabsTrigger>
            <TabsTrigger value="manual">Manual Selection</TabsTrigger>
            <TabsTrigger value="auto">Auto Fetch</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Today's Challenge Video</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Updated daily at midnight</span>
              </div>
            </div>

            {loadingCurrentVideo ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : currentDailyVideo ? (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex gap-4">
                  <div className="w-32 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={currentDailyVideo.thumbnailUrl || "/placeholder.svg"}
                      alt={currentDailyVideo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-1">{currentDailyVideo.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{currentDailyVideo.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        Duration: {formatDuration(currentDailyVideo.duration)}
                      </span>
                      <a
                        href={currentDailyVideo.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open in YouTube
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted/30 border text-center">
                <p className="text-muted-foreground">No video set for today. The system will use a random video.</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClearVideo} disabled={loading || !currentDailyVideo}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Random Videos
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                onClick={handleExtractVideo}
                disabled={loading || !url.trim()}
                className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Set Video
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error extracting video</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {videoData && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex gap-4">
                  <div className="w-32 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={videoData.thumbnailUrl || "/placeholder.svg"}
                      alt={videoData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-1">{videoData.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{videoData.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        Duration: {formatDuration(videoData.duration)}
                      </span>
                      <a
                        href={videoData.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open in YouTube
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="auto" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Auto-Fetch Video Suggestion</h3>
              <Button onClick={handleFetchSuggestedVideo} disabled={fetchingSuggestion} variant="outline">
                {fetchingSuggestion ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Fetch New Suggestion
                  </>
                )}
              </Button>
            </div>

            {fetchingSuggestion ? (
              <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div>
                  <p className="font-medium">Fetching a video suggestion</p>
                  <p className="text-sm text-muted-foreground">This may take a moment...</p>
                </div>
              </div>
            ) : suggestedVideo ? (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-4">
                  <div className="w-32 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={suggestedVideo.thumbnailUrl || "/placeholder.svg"}
                      alt={suggestedVideo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-1">{suggestedVideo.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{suggestedVideo.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        Duration: {formatDuration(suggestedVideo.duration)}
                      </span>
                      <a
                        href={suggestedVideo.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open in YouTube
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={handleRejectSuggestion}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={handleApproveSuggestion}
                    className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Approve as Today's Video
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center gap-4 text-center border rounded-lg bg-muted/10">
                <Youtube className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-medium">No video suggestion yet</p>
                  <p className="text-sm text-muted-foreground">Click the button above to fetch a suggested video</p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">Auto-Fetch Information</p>
                  <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                    The system will suggest educational videos based on your settings. You can approve or reject the
                    suggestion. The daily video will only change when you approve a new video.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-xs text-muted-foreground">
          {currentDailyVideo ? "Custom video set for today's challenge" : "Using random videos for challenges"}
        </div>
      </CardFooter>
    </Card>
  )
}
