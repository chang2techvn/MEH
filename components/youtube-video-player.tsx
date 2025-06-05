"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { 
  Loader2, 
  AlertTriangle, 
  RewindIcon, 
  FastForwardIcon, 
  PlayIcon, 
  PauseIcon,
  MaximizeIcon,
  CheckCircle,
  Clock
} from "lucide-react"

// ✅ Global YouTube API loader để tránh load nhiều lần
let youtubeAPIPromise: Promise<any> | null = null

const getYouTubeAPI = () => {
  if (youtubeAPIPromise) return youtubeAPIPromise
  
  youtubeAPIPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }

    window.onYouTubeIframeAPIReady = () => resolve(window.YT)
    
    if (!document.getElementById("youtube-api")) {
      const script = document.createElement("script")
      script.id = "youtube-api"
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })
  
  return youtubeAPIPromise
}

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
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showPlaybackRateMenu, setShowPlaybackRateMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const playerReadyRef = useRef(false)
  const playerInitialized = useRef(false)
  const playbackRateMenuRef = useRef<HTMLDivElement>(null)

  // ✅ Optimized player initialization
  const initializePlayer = useCallback(() => {
    if (!playerContainerRef.current || playerInitialized.current) return

    try {
      playerContainerRef.current.innerHTML = ""

      const playerElement = document.createElement("div")
      playerElement.id = `youtube-player-${videoId}`
      playerElement.className = "w-full h-full"
      playerContainerRef.current.appendChild(playerElement)

      playerRef.current = new window.YT.Player(playerElement.id, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          enablejsapi: 1,
          fs: 1,
          playsinline: 1,
          iv_load_policy: 3,
          cc_load_policy: 0, // ✅ Disable captions by default
          disablekb: 0,
          hl: "en",
          color: "white",
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            playerReadyRef.current = true
            setLoading(false)
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === 1)
          },
          onError: () => {
            setError(true)
            setLoading(false)
          },
        },
      })

      playerInitialized.current = true
    } catch (err) {
      console.error("Error initializing YouTube player:", err)
      setError(true)
      setLoading(false)
    }
  }, [videoId])

  // ✅ Load YouTube API with optimization
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        await getYouTubeAPI()
        if (playerContainerRef.current && !playerInitialized.current) {
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
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [initializePlayer])

  // ✅ Optimized time update
  const updateCurrentTime = useCallback(() => {
    if (playerRef.current && playerReadyRef.current) {
      try {
        const time = playerRef.current.getCurrentTime()
        setCurrentTime(time)

        const videoDuration = playerRef.current.getDuration()
        if (videoDuration > 0 && videoDuration !== duration) {
          setDuration(videoDuration)
        }
      } catch (err) {
        // Ignore errors during state updates
      }
    }
  }, [duration])

  // ✅ Watch time tracking with debouncing
  useEffect(() => {
    if (isPlaying && !completed) {
      timerRef.current = setInterval(() => {
        if (playerRef.current && playerReadyRef.current) {
          try {
            const playerState = playerRef.current.getPlayerState()
            if (playerState === 1) { // YT.PlayerState.PLAYING
              setWatchTime((prev) => prev + 1)
            }
          } catch (err) {
            // Ignore errors
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

  // ✅ Time update with reduced frequency
  useEffect(() => {
    const interval = isPlaying ? 500 : 2000 // Reduced frequency
    const timeUpdateInterval = setInterval(updateCurrentTime, interval)

    return () => clearInterval(timeUpdateInterval)
  }, [updateCurrentTime, isPlaying])

  // ✅ Completion handling
  useEffect(() => {
    if (watchTime >= requiredWatchTime && !completed) {
      setCompleted(true)

      toast({
        title: "Watch requirement completed!",
        description: "You can now proceed to the next step.",
        variant: "default",
      })

      if (onWatchComplete) {
        setTimeout(() => {
          onWatchComplete()
        }, 0)
      }
    }
  }, [watchTime, requiredWatchTime, completed, onWatchComplete])

  // ✅ Optimized player controls
  const handlePlayPause = useCallback(() => {
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
  }, [isPlaying])

  const handleRewind = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) return

    try {
      const current = playerRef.current.getCurrentTime()
      playerRef.current.seekTo(Math.max(0, current - 5), true)
    } catch (err) {
      console.error("Error rewinding video:", err)
    }
  }, [])

  const handleForward = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) return

    try {
      const current = playerRef.current.getCurrentTime()
      const videoDuration = playerRef.current.getDuration()
      playerRef.current.seekTo(Math.min(videoDuration, current + 5), true)
    } catch (err) {
      console.error("Error forwarding video:", err)
    }
  }, [])

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (!playerRef.current || !playerReadyRef.current) return

    try {
      playerRef.current.setPlaybackRate(rate)
      setPlaybackRate(rate)
      setShowPlaybackRateMenu(false)
    } catch (err) {
      console.error("Error changing playback rate:", err)
    }
  }, [])

  const handleFullscreen = useCallback(() => {
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
  }, [])

  const reloadVideo = useCallback(() => {
    setLoading(true)
    setError(false)
    playerInitialized.current = false

    if (window.YT && window.YT.Player) {
      setTimeout(() => {
        initializePlayer()
      }, 500)
    }
  }, [initializePlayer])

  // ✅ Close menu on outside click
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

  // ✅ Utility functions
  const progressPercentage = Math.min((watchTime / requiredWatchTime) * 100, 100)
  
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-black/30 backdrop-blur-sm z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
            >
              Reload Video
            </Button>
          </motion.div>
        </div>
      ) : (
        <>
          {/* YouTube player container */}
          <div className="w-full h-full">
            <div ref={playerContainerRef} className="w-full h-full" />
          </div>

          {/* Custom controls */}
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

                {completed && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm px-2 py-0.5 rounded-full"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs font-medium text-green-500">Completed</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={`absolute left-0 top-0 h-full ${
                  completed ? "bg-green-500" : "bg-gradient-to-r from-blue-500 to-purple-600"
                }`}
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
