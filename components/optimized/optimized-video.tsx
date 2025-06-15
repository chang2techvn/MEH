"use client"

import { useState, useEffect, useRef } from "react"

interface OptimizedVideoProps {
  src: string
  poster?: string
  width?: number
  height?: number
  controls?: boolean
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  className?: string
  onLoad?: () => void
  onError?: () => void
  preload?: "auto" | "metadata" | "none"
  playbackRate?: number
  priority?: boolean
  fetchPriority?: "high" | "low" | "auto"
}

export default function OptimizedVideo({
  src,
  poster,
  width,
  height,
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  className = "",
  onLoad,
  onError,
  preload = "metadata",
  playbackRate = 1,
  priority = false,
  fetchPriority = "auto",
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(priority)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!videoRef.current || priority) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          if (observerRef.current) {
            observerRef.current.disconnect()
          }
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.01,
      },
    )

    observerRef.current.observe(videoRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [priority])

  // Handle video load
  const handleLoadedData = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()

    // Set playback rate if specified
    if (videoRef.current && playbackRate !== 1) {
      videoRef.current.playbackRate = playbackRate
    }
  }

  // Handle video error
  const handleError = () => {
    setError(true)
    if (onError) onError()
  }

  // Update playback rate when it changes
  useEffect(() => {
    if (videoRef.current && isLoaded) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate, isLoaded])

  // Optimize video loading based on network conditions
  useEffect(() => {
    if (!videoRef.current || !isVisible) return

    // Check connection type if available
    if ("connection" in navigator && (navigator as any).connection) {
      const connection = (navigator as any).connection

      // If save-data is enabled or on slow connections, use lower quality
      if (connection.saveData || connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
        // For slow connections, we could switch to a lower quality source
        // This would require having multiple sources available
        videoRef.current.preload = "metadata"
      }
    }
  }, [isVisible])

  return (
    <div className={`relative ${className}`} style={{ width, height }} data-testid="optimized-video-container">
      {!isLoaded && poster && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        />
      )}

      <video
        ref={videoRef}
        className={`w-full h-full object-contain transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        controls={controls}
        autoPlay={autoPlay && isVisible}
        muted={muted}
        loop={loop}
        poster={poster}
        preload={priority ? "auto" : preload}
        playsInline
        onLoadedData={handleLoadedData}
        onError={handleError}
        aria-label={controls ? undefined : "Video player"}
      >
        {isVisible && <source src={src} type="video/mp4" />}
        <p>Your browser does not support the video tag.</p>
      </video>

      {!isLoaded && !poster && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center"
          aria-hidden="true"
        >
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
    </div>
  )
}
