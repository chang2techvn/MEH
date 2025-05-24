"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
// Thêm import các icon cần thiết
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  PlayIcon,
  PauseIcon,
  RewindIcon,
  FastForwardIcon,
  MaximizeIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

// Define YouTube Player interface
interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setPlaybackRate: (rate: number) => void
  getPlaybackRate: () => number
  getAvailablePlaybackRates: () => number[]
  destroy: () => void
}

// Define window with YouTube
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId?: string
          playerVars?: Record<string, any>
          events?: Record<string, (event: any) => void>
        },
      ) => YouTubePlayer
      PlayerState?: {
        PLAYING: number
        PAUSED: number
        ENDED: number
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YouTubeVideoPlayerProps {
  videoId: string
  title: string
  requiredWatchTime?: number // in seconds
  onWatchComplete?: () => void
}

export default function YouTubeVideoPlayer({
  videoId,
  title,
  requiredWatchTime = 180, // Default 3 minutes
  onWatchComplete,
}: YouTubeVideoPlayerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [watchTime, setWatchTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const playerReadyRef = useRef(false)
  const [playerInitialized, setPlayerInitialized] = useState(false)

  // Thêm state để quản lý tốc độ phát
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showPlaybackRateMenu, setShowPlaybackRateMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const playbackRateMenuRef = useRef<HTMLDivElement>(null)

  // Load YouTube API
  useEffect(() => {
    // Tạo một hàm để tải YouTube API
    const loadYouTubeAPI = () => {
      return new Promise((resolve) => {
        // Nếu API đã được tải
        if (window.YT && window.YT.Player) {
          resolve(window.YT)
          return
        }

        // Nếu callback đã được thiết lập
        if (window.onYouTubeIframeAPIReady) {
          const originalCallback = window.onYouTubeIframeAPIReady
          window.onYouTubeIframeAPIReady = () => {
            originalCallback()
            resolve(window.YT)
          }
        } else {
          window.onYouTubeIframeAPIReady = () => {
            resolve(window.YT)
          }
        }

        // Nếu script chưa được thêm vào
        if (!document.getElementById("youtube-api")) {
          const tag = document.createElement("script")
          tag.src = "https://www.youtube.com/iframe_api"
          tag.id = "youtube-api"
          tag.async = true
          tag.defer = true
          const firstScriptTag = document.getElementsByTagName("script")[0]
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
        }
      })
    }

    // Tải API và khởi tạo player
    const setupPlayer = async () => {
      try {
        await loadYouTubeAPI()
        if (playerContainerRef.current && !playerInitialized) {
          initializePlayer()
        }
      } catch (err) {
        console.error("Error loading YouTube API:", err)
        setError(true)
        setLoading(false)
      }
    }

    setupPlayer()

    return () => {
      // Cleanup
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [videoId])

  // Update the player initialization to enable more YouTube controls and improve the layout
  const initializePlayer = () => {
    if (!playerContainerRef.current || playerInitialized) return

    try {
      // Clear the container first
      playerContainerRef.current.innerHTML = ""

      // Create a new div for the player
      const playerElement = document.createElement("div")
      playerElement.id = `youtube-player-${videoId}`
      playerElement.className = "w-full h-full"
      playerContainerRef.current.appendChild(playerElement)

      // Initialize the player with more controls enabled and better performance
      playerRef.current = new window.YT.Player(playerElement.id, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          showinfo: 1,
          modestbranding: 1,
          enablejsapi: 1,
          fs: 1,
          playsinline: 1,
          iv_load_policy: 3,
          cc_load_policy: 1,
          disablekb: 0,
          hl: "en",
          color: "white",
          origin: window.location.origin,
          widget_referrer: window.location.origin,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      })

      setPlayerInitialized(true)
    } catch (err) {
      console.error("Error initializing YouTube player:", err)
      setError(true)
      setLoading(false)
    }
  }

  const onPlayerReady = () => {
    playerReadyRef.current = true
    setLoading(false)
  }

  const onPlayerStateChange = (event: any) => {
    // YT.PlayerState.PLAYING = 1, YT.PlayerState.PAUSED = 2, YT.PlayerState.ENDED = 0
    if (event.data === 1) {
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
    }
  }

  const onPlayerError = () => {
    setError(true)
    setLoading(false)
  }

  const handlePlayPause = () => {
    if (!playerRef.current || !playerReadyRef.current) return

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    } catch (err) {
      console.error("Error controlling YouTube player:", err)
    }
  }

  const reloadVideo = () => {
    setLoading(true)
    setError(false)
    setPlayerInitialized(false)

    // Re-initialize the player
    if (window.YT && window.YT.Player) {
      setTimeout(() => {
        initializePlayer()
      }, 500)
    }
  }

  // Cải thiện hàm updateCurrentTime để cập nhật chính xác thời gian và duration
  const updateCurrentTime = useCallback(() => {
    if (playerRef.current && playerReadyRef.current) {
      try {
        const time = playerRef.current.getCurrentTime()
        setCurrentTime(time)

        // Luôn cập nhật duration để đảm bảo chính xác
        const videoDuration = playerRef.current.getDuration()
        if (videoDuration > 0 && videoDuration !== duration) {
          setDuration(videoDuration)
        }
      } catch (err) {
        console.error("Error getting current time:", err)
      }
    }
  }, [duration])

  // Timer to track watch time
  useEffect(() => {
    if (isPlaying && !completed) {
      // Cập nhật watchTime dựa trên thời gian thực tế từ player
      timerRef.current = setInterval(() => {
        if (playerRef.current && playerReadyRef.current) {
          try {
            // Kiểm tra trạng thái phát thực tế
            const playerState = playerRef.current.getPlayerState()
            // YT.PlayerState.PLAYING = 1
            if (playerState === 1) {
              setWatchTime((prev) => prev + 1)
            }
          } catch (err) {
            console.error("Error updating watch time:", err)
          }
        }
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, completed])

  // Cải thiện useEffect để cập nhật thời gian thường xuyên hơn khi đang phát
  useEffect(() => {
    // Cập nhật thời gian thường xuyên hơn khi đang phát (200ms)
    const interval = isPlaying ? 200 : 1000
    const timeUpdateInterval = setInterval(updateCurrentTime, interval)

    return () => clearInterval(timeUpdateInterval)
  }, [updateCurrentTime, isPlaying])

  // Add a separate useEffect to handle completion
  useEffect(() => {
    // Check if we've reached the required watch time
    if (watchTime >= requiredWatchTime && !completed) {
      setCompleted(true)

      // Show toast notification
      toast({
        title: "Watch requirement completed!",
        description: "You can now proceed to the next step.",
        variant: "default",
      })

      // Call the callback in a separate effect to avoid state updates during render
      if (onWatchComplete) {
        // Use setTimeout to ensure this happens after rendering is complete
        setTimeout(() => {
          onWatchComplete()
        }, 0)
      }
    }
  }, [watchTime, requiredWatchTime, completed, onWatchComplete])

  // Thêm hàm để tua lại 5 giây
  const handleRewind = () => {
    if (!playerRef.current || !playerReadyRef.current) return

    try {
      const currentTime = playerRef.current.getCurrentTime()
      playerRef.current.seekTo(Math.max(0, currentTime - 5), true)
      updateCurrentTime()
    } catch (err) {
      console.error("Error rewinding video:", err)
    }
  }

  // Thêm hàm để tua tới 5 giây
  const handleForward = () => {
    if (!playerRef.current || !playerReadyRef.current) return

    try {
      const currentTime = playerRef.current.getCurrentTime()
      const duration = playerRef.current.getDuration()
      playerRef.current.seekTo(Math.min(duration, currentTime + 5), true)
      updateCurrentTime()
    } catch (err) {
      console.error("Error forwarding video:", err)
    }
  }

  // Thêm hàm để thay đổi tốc độ phát
  const handlePlaybackRateChange = (rate: number) => {
    if (!playerRef.current || !playerReadyRef.current) return

    try {
      playerRef.current.setPlaybackRate(rate)
      setPlaybackRate(rate)
      setShowPlaybackRateMenu(false)
    } catch (err) {
      console.error("Error changing playback rate:", err)
    }
  }

  // Thêm hàm để bật/tắt chế độ toàn màn hình
  const handleFullscreen = () => {
    if (!playerContainerRef.current) return

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        playerContainerRef.current.requestFullscreen()
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err)
    }
  }

  // Thêm useEffect để xử lý click bên ngoài menu tốc độ phát
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (playbackRateMenuRef.current && !playbackRateMenuRef.current.contains(event.target as Node)) {
        setShowPlaybackRateMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Calculate progress percentage
  const progressPercentage = Math.min((watchTime / requiredWatchTime) * 100, 100)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Update the return JSX to ensure the video container matches the video dimensions
  // Replace the existing return statement with this improved version:

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-black/30 backdrop-blur-sm z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 className="h-12 w-12 text-neo-mint dark:text-purist-blue animate-spin" />
          </motion.div>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 dark:bg-black/30 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
            <p className="text-center mb-4 text-lg font-medium">Failed to load the video</p>
            <Button
              onClick={reloadVideo}
              className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0"
            >
              Reload Video
            </Button>
          </motion.div>
        </div>
      ) : (
        <>
          {/* YouTube player container - full width and height */}
          <div className="w-full h-full">
            <div ref={playerContainerRef} className="w-full h-full" />
          </div>

          {/* Custom controls - absolute positioned at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 rounded-b-xl">
            <div className="flex items-center gap-2 mb-1 text-white">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                onClick={handleRewind}
              >
                <RewindIcon className="h-4 w-4" />
                <span className="sr-only">Rewind 5s</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                onClick={handlePlayPause}
              >
                {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4 ml-0.5" />}
                <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                onClick={handleForward}
              >
                <FastForwardIcon className="h-4 w-4" />
                <span className="sr-only">Forward 5s</span>
              </Button>

              <div className="flex items-center gap-2 ml-2">
                <Clock className="h-4 w-4 text-white/80" />
                <div className="text-sm font-medium">
                  {formatTime(Math.floor(currentTime))} /{" "}
                  {formatTime(Math.floor(duration > 0 ? duration : requiredWatchTime))}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full text-white hover:bg-white/20"
                    onClick={() => setShowPlaybackRateMenu(!showPlaybackRateMenu)}
                  >
                    {playbackRate}x
                  </Button>

                  {showPlaybackRateMenu && (
                    <div
                      ref={playbackRateMenuRef}
                      className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden z-20"
                    >
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 ${
                            playbackRate === rate ? "bg-white/20 font-medium" : ""
                          }`}
                          onClick={() => handlePlaybackRateChange(rate)}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                  onClick={handleFullscreen}
                >
                  <MaximizeIcon className="h-4 w-4" />
                  <span className="sr-only">Fullscreen</span>
                </Button>
              </div>

              {completed && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm px-2 py-0.5 rounded-full ml-auto"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-xs font-medium text-green-500">Completed</span>
                </motion.div>
              )}
            </div>

            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={`absolute left-0 top-0 h-full ${completed ? "bg-green-500" : "bg-gradient-to-r from-neo-mint to-purist-blue"}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="mt-1 flex justify-between items-center">
              <div className="text-xs text-white/80">
                {!completed && <span>Watch {formatTime(requiredWatchTime - watchTime)} more to continue</span>}
              </div>
              <div className="text-xs font-medium text-white/80">{Math.round(progressPercentage)}%</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
