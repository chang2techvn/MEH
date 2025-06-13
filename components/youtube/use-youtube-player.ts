"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import { getYouTubeAPI } from "./youtube-api"
import type { YouTubePlayer, PlayerState } from "./types"

export function useYouTubePlayer(
  videoId: string,
  requiredWatchTime: number,
  onWatchComplete?: () => void
) {  const [playerState, setPlayerState] = useState<PlayerState>({
    loading: true,
    error: false,
    watchTime: 0,
    isPlaying: false,
    completed: false,
    playbackRate: 1,
    showPlaybackRateMenu: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    isMuted: false,
    showVolumeSlider: false,
  })

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
          cc_load_policy: 0,
          disablekb: 0,
          hl: "en",
          color: "white",
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            playerReadyRef.current = true
            setPlayerState(prev => ({ ...prev, loading: false }))
          },
          onStateChange: (event: any) => {
            setPlayerState(prev => ({ ...prev, isPlaying: event.data === 1 }))
          },
          onError: () => {
            setPlayerState(prev => ({ ...prev, error: true, loading: false }))
          },
        },
      })

      playerInitialized.current = true
    } catch (err) {
      console.error("Error initializing YouTube player:", err)
      setPlayerState(prev => ({ ...prev, error: true, loading: false }))
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
        setPlayerState(prev => ({ ...prev, error: true, loading: false }))
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
        const videoDuration = playerRef.current.getDuration()
        const currentVolume = playerRef.current.getVolume()
        const isMutedState = playerRef.current.isMuted()
        
        setPlayerState(prev => ({
          ...prev,
          currentTime: time,
          duration: videoDuration > 0 && videoDuration !== prev.duration ? videoDuration : prev.duration,
          volume: currentVolume !== undefined ? currentVolume : prev.volume,
          isMuted: isMutedState !== undefined ? isMutedState : prev.isMuted,
        }))
      } catch (err) {
        // Ignore errors during state updates
      }
    }
  }, [])

  // ✅ Watch time tracking with debouncing
  useEffect(() => {
    if (playerState.isPlaying && !playerState.completed) {
      timerRef.current = setInterval(() => {
        if (playerRef.current && playerReadyRef.current) {
          try {
            const playerStateValue = playerRef.current.getPlayerState()
            if (playerStateValue === 1) { // YT.PlayerState.PLAYING
              setPlayerState(prev => ({ ...prev, watchTime: prev.watchTime + 1 }))
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
  }, [playerState.isPlaying, playerState.completed])

  // ✅ Time update with reduced frequency
  useEffect(() => {
    const interval = playerState.isPlaying ? 500 : 2000
    const timeUpdateInterval = setInterval(updateCurrentTime, interval)

    return () => clearInterval(timeUpdateInterval)
  }, [updateCurrentTime, playerState.isPlaying])
  // ✅ Completion handling with auto-pause
  useEffect(() => {
    if (playerState.watchTime >= requiredWatchTime && !playerState.completed) {
      setPlayerState(prev => ({ ...prev, completed: true }))

      // 🚀 AUTO-PAUSE VIDEO when watch time requirement is met
      if (playerRef.current && playerReadyRef.current && playerState.isPlaying) {
        try {
          playerRef.current.pauseVideo()
          console.log(`✅ Video auto-paused after reaching required watch time of ${requiredWatchTime} seconds`)
        } catch (err) {
          console.error("Error auto-pausing video:", err)
        }
      }

      toast({
        title: "🎉 Watch requirement completed!",
        description: `You've watched ${requiredWatchTime} seconds. Video has been paused. You can now proceed to the next step.`,
        variant: "default",
      })

      if (onWatchComplete) {
        setTimeout(() => {
          onWatchComplete()
        }, 0)
      }
    }
  }, [playerState.watchTime, requiredWatchTime, playerState.completed, playerState.isPlaying, onWatchComplete])

  // Player control functions
  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) return

    try {
      if (playerState.isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    } catch (err) {
      console.error("Error controlling YouTube player:", err)
    }
  }, [playerState.isPlaying])

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
      setPlayerState(prev => ({ 
        ...prev, 
        playbackRate: rate, 
        showPlaybackRateMenu: false 
      }))
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

  const handleVolumeChange = useCallback((volume: number) => {
    if (!playerRef.current || !playerReadyRef.current) return

    try {
      playerRef.current.setVolume(volume)
      setPlayerState(prev => ({ 
        ...prev, 
        volume: volume,
        isMuted: volume === 0
      }))
    } catch (err) {
      console.error("Error changing volume:", err)
    }
  }, [])

  const handleMuteToggle = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) return

    try {
      if (playerState.isMuted) {
        playerRef.current.unMute()
        const volume = playerState.volume > 0 ? playerState.volume : 50
        playerRef.current.setVolume(volume)
        setPlayerState(prev => ({ ...prev, isMuted: false, volume }))
      } else {
        playerRef.current.mute()
        setPlayerState(prev => ({ ...prev, isMuted: true }))
      }
    } catch (err) {
      console.error("Error toggling mute:", err)
    }
  }, [playerState.isMuted, playerState.volume])

  const setShowVolumeSlider = useCallback((show: boolean) => {
    setPlayerState(prev => ({ ...prev, showVolumeSlider: show }))
  }, [])

  const reloadVideo = useCallback(() => {
    setPlayerState(prev => ({ 
      ...prev, 
      loading: true, 
      error: false 
    }))
    playerInitialized.current = false

    if (window.YT && window.YT.Player) {
      setTimeout(() => {
        initializePlayer()
      }, 500)
    }
  }, [initializePlayer])

  const setShowPlaybackRateMenu = useCallback((show: boolean) => {
    setPlayerState(prev => ({ ...prev, showPlaybackRateMenu: show }))
  }, [])
  return {
    playerState,
    playerContainerRef,
    playbackRateMenuRef,
    handlePlayPause,
    handleRewind,
    handleForward,
    handlePlaybackRateChange,
    handleFullscreen,
    handleVolumeChange,
    handleMuteToggle,
    reloadVideo,
    setShowPlaybackRateMenu,
    setShowVolumeSlider,
  }
}
