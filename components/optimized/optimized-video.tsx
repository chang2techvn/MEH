"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { formatTime } from "@/components/youtube/youtube-api"

interface OptimizedVideoProps {
  src: string
  poster?: string
  width?: number
  height?: number
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  preload?: "none" | "metadata" | "auto"
  quality?: "low" | "medium" | "high"
  adaptivePreload?: boolean
  lazyLoad?: boolean
  onLoad?: () => void
  onError?: () => void
  onPlay?: () => void
  onPause?: () => void
}

// Get network connection info for adaptive loading
function getConnectionInfo() {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return { effectiveType: '4g', saveData: false }
  }
  
  const connection = (navigator as any).connection
  return {
    effectiveType: connection?.effectiveType || '4g',
    saveData: connection?.saveData || false,
    downlink: connection?.downlink || 10
  }
}

// Smart preload strategy based on connection
function getSmartPreload(
  adaptivePreload: boolean,
  userPreload: OptimizedVideoProps['preload']
): "none" | "metadata" | "auto" {
  if (!adaptivePreload) return userPreload || "metadata"
  
  const { effectiveType, saveData, downlink } = getConnectionInfo()
  
  // If user has save data enabled, minimal preload
  if (saveData) return "none"
  
  // Based on connection speed
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return "none"
  } else if (effectiveType === '3g' || downlink < 1.5) {
    return "metadata"
  } else {
    return userPreload || "metadata" // Default to metadata even on fast connections
  }
}

// Get video quality based on connection and settings
function getVideoQuality(
  quality: OptimizedVideoProps['quality'],
  adaptiveQuality: boolean = true
): string {
  if (!adaptiveQuality) return quality || 'medium'
  
  const { effectiveType, saveData, downlink } = getConnectionInfo()
  
  if (saveData) return 'low'
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'low'
  } else if (effectiveType === '3g' || downlink < 2) {
    return 'medium'
  } else {
    return quality || 'high'
  }
}

export function OptimizedVideo({
  src,
  poster,
  width,
  height,
  className,
  autoPlay = false,
  loop = false,
  muted = true, // Default muted for autoplay compliance
  controls = true,
  preload = "metadata",
  quality = "medium",
  adaptivePreload = true,
  lazyLoad = true,
  onLoad,
  onError,
  onPlay,
  onPause,
  ...props
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  // Intersection observer for lazy loading
  const { setElement, shouldLoad } = useIntersectionObserver({
    rootMargin: "100px",
    threshold: 0.1,
    triggerOnce: true,
    skip: !lazyLoad,
  })

  // Smart preload based on connection
  const smartPreload = getSmartPreload(adaptivePreload, preload)
  const smartQuality = getVideoQuality(quality, adaptivePreload)

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      onPause?.()
    } else {
      videoRef.current.play()
      onPlay?.()
    }
  }, [isPlaying, onPlay, onPause])

  // Handle mute/unmute
  const handleMuteToggle = useCallback(() => {
    if (!videoRef.current) return
    
    const newMuted = !isMuted
    videoRef.current.muted = newMuted
    setIsMuted(newMuted)
  }, [isMuted])

  // Handle fullscreen
  const handleFullscreen = useCallback(() => {
    if (!videoRef.current) return

    if (!isFullscreen) {
      videoRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [isFullscreen])

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return
    
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }, [])

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }, [])

  // Handle load events
  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      handleLoad()
    }
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('error', handleError)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('error', handleError)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [handleTimeUpdate, handleLoad, handleError])

  // Error state
  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400",
          "border border-dashed border-gray-300 dark:border-gray-600 rounded-lg",
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Failed to load video</p>
        </div>
      </div>
    )
  }

  // Lazy loading placeholder
  if (lazyLoad && !shouldLoad) {
    return (
      <div
        ref={setElement}
        className={cn(
          "flex items-center justify-center bg-gray-100 dark:bg-gray-800",
          "border border-dashed border-gray-300 dark:border-gray-600 rounded-lg",
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading video...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative group rounded-lg overflow-hidden", className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        width={width}
        height={height}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        preload={smartPreload}
        className="w-full h-full object-cover"
        {...props}
      />

      {/* Custom controls overlay */}
      {controls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Play/Pause button */}
          <button
            onClick={handlePlayPause}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/30 rounded-full mb-3">
              <div 
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <button onClick={handlePlayPause} className="hover:text-blue-400 transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                <button onClick={handleMuteToggle} className="hover:text-blue-400 transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <div className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-xs bg-black/50 px-2 py-1 rounded">
                  {smartQuality.toUpperCase()}
                </div>
                
                <button onClick={handleFullscreen} className="hover:text-blue-400 transition-colors">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// Specialized video components
export function LazyVideo(props: OptimizedVideoProps) {
  return <OptimizedVideo {...props} lazyLoad />
}

export function AutoplayVideo(props: Omit<OptimizedVideoProps, 'autoPlay' | 'muted'>) {
  return <OptimizedVideo {...props} autoPlay muted />
}

export function HighQualityVideo(props: Omit<OptimizedVideoProps, 'quality'>) {
  return <OptimizedVideo {...props} quality="high" />
}
