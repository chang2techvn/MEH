"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import { getYouTubeAPI } from "./youtube-api"
import { useMobile } from "@/hooks/use-mobile"
import type { YouTubePlayer, PlayerState } from "./types"

export function useYouTubePlayer(
  videoId: string,
  requiredWatchTime: number,
  onWatchComplete?: () => void
) {
  const { isMobile } = useMobile()
  
  const [playerState, setPlayerState] = useState<PlayerState>({
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
    showMobileControls: true, // Initially show controls
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const playerReadyRef = useRef(false)
  const playerInitialized = useRef(false)
  const playbackRateMenuRef = useRef<HTMLDivElement>(null)
  const mobileControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ Optimized player initialization
  const initializePlayer = useCallback(() => {
    if (!playerContainerRef.current || playerInitialized.current) return

    console.log("🎬 Initializing YouTube player with videoId:", videoId)

    try {
      playerContainerRef.current.innerHTML = ""

      const playerElement = document.createElement("div")
      playerElement.id = `youtube-player-${videoId}`
      playerElement.className = "w-full h-full"
      playerContainerRef.current.appendChild(playerElement)

      playerRef.current = new window.YT.Player(playerElement.id, {
        videoId: videoId,
        host: 'https://www.youtube-nocookie.com',
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
          onReady: (event: any) => {
            console.log("🎬 YouTube player ready for:", videoId)
            playerReadyRef.current = true
            setPlayerState(prev => ({ ...prev, loading: false }))
            
            // Ensure video is properly loaded and paused
            try {
              event.target.cueVideoById(videoId)
              event.target.pauseVideo()
              console.log("🎬 Video cued and paused successfully:", videoId)
            } catch (err) {
              console.error("Error loading video:", err)
            }
          },
          onStateChange: (event: any) => {
            console.log("🎬 Player state changed:", event.data)
            setPlayerState(prev => ({ ...prev, isPlaying: event.data === 1 }))
          },
          onError: (event: any) => {
            console.error("🎬 YouTube player error:", event.data)
            setPlayerState(prev => ({ ...prev, error: true, loading: false }))
          },
        },
      })

      playerInitialized.current = true
      console.log("🎬 Player initialization completed for:", videoId)
    } catch (err) {
      console.error("Error initializing YouTube player:", err)
      setPlayerState(prev => ({ ...prev, error: true, loading: false }))
    }
  }, [videoId])

  // Setup and reinitialize player on videoId change
  useEffect(() => {
    let cancelled = false
    const setup = async () => {
      // Destroy old player
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch {}
        playerRef.current = null
      }
      playerInitialized.current = false
      playerReadyRef.current = false
      // Reset state
      setPlayerState({
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
        showMobileControls: true, // Reset to show controls
      })
      try {
        await getYouTubeAPI()
        if (!cancelled) initializePlayer()
      } catch (err) {
        console.error("Error initializing YouTube API:", err)
        if (!cancelled) setPlayerState(prev => ({ ...prev, error: true, loading: false }))
      }
    }
    setup()
    return () => { cancelled = true }
  }, [videoId, initializePlayer])

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

  // 🎯 Mobile/Desktop controls auto-hide logic
  useEffect(() => {
    // Always show controls when completed AND paused (video stopped)
    if (playerState.completed && !playerState.isPlaying) {
      setPlayerState(prev => ({ ...prev, showMobileControls: true }))
      
      // Clear any existing timeout
      if (mobileControlsTimeoutRef.current) {
        clearTimeout(mobileControlsTimeoutRef.current)
        mobileControlsTimeoutRef.current = null
      }
      return
    }

    // Auto-hide controls when playing (both mobile and desktop)
    if (playerState.isPlaying) {
      // Only set timeout if controls are currently visible
      if (playerState.showMobileControls) {
        const hideTimeout = setTimeout(() => {
          setPlayerState(prev => ({ ...prev, showMobileControls: false }))
        }, 3000) // Hide after 3 seconds of playing

        mobileControlsTimeoutRef.current = hideTimeout

        return () => {
          clearTimeout(hideTimeout)
          if (mobileControlsTimeoutRef.current) {
            clearTimeout(mobileControlsTimeoutRef.current)
            mobileControlsTimeoutRef.current = null
          }
        }
      }
    } else {
      // Show controls when paused
      setPlayerState(prev => ({ ...prev, showMobileControls: true }))
      
      // Clear existing timeout
      if (mobileControlsTimeoutRef.current) {
        clearTimeout(mobileControlsTimeoutRef.current)
        mobileControlsTimeoutRef.current = null
      }
    }
  }, [playerState.isPlaying, playerState.completed, playerState.showMobileControls])

  // 🎯 Handle controls visibility toggle (Mobile: touch, Desktop: hover)
  const handleMobileControlsToggle = useCallback(() => {
    // Show controls
    setPlayerState(prev => ({ ...prev, showMobileControls: true }))

    // Clear existing timeout
    if (mobileControlsTimeoutRef.current) {
      clearTimeout(mobileControlsTimeoutRef.current)
      mobileControlsTimeoutRef.current = null
    }

    // Don't auto-hide if completed AND paused (video stopped)
    if (playerState.completed && !playerState.isPlaying) {
      return
    }

    // Auto-hide after 3 seconds if playing
    if (playerState.isPlaying) {
      mobileControlsTimeoutRef.current = setTimeout(() => {
        setPlayerState(prev => ({ ...prev, showMobileControls: false }))
      }, 3000)
    }
  }, [playerState.isPlaying, playerState.completed])

  // 🎯 Handle video container hover (for both mobile and desktop)
  const handleVideoHover = useCallback(() => {
    // Both mobile and desktop now use same toggle logic
    handleMobileControlsToggle()
  }, [handleMobileControlsToggle])

  // 🎯 Handle video container leave (for both mobile and desktop)
  const handleVideoLeave = useCallback(() => {
    // Don't auto-hide if completed AND paused (video stopped)
    if (playerState.completed && !playerState.isPlaying) return

    // Clear any existing timeout
    if (mobileControlsTimeoutRef.current) {
      clearTimeout(mobileControlsTimeoutRef.current)
    }

    // Auto-hide after 3 seconds when leaving video area (if playing)
    if (playerState.isPlaying) {
      mobileControlsTimeoutRef.current = setTimeout(() => {
        setPlayerState(prev => ({ ...prev, showMobileControls: false }))
      }, 3000)
    }
  }, [playerState.isPlaying, playerState.completed])
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
  const reloadVideo = useCallback(() => {
    setPlayerState(prev => ({ 
      ...prev, 
      loading: true, 
      error: false 
    }))
    playerInitialized.current = false
    playerReadyRef.current = false

    if (window.YT && window.YT.Player) {
      setTimeout(() => {
        initializePlayer()
      }, 500)
    }
  }, [initializePlayer])

  const handlePlayPause = useCallback(() => {
    console.log("🎮 [handlePlayPause] Called")
    console.log("🎮 playerRef.current:", !!playerRef.current)
    console.log("🎮 playerReadyRef.current:", playerReadyRef.current)
    console.log("🎮 playerState.isPlaying:", playerState.isPlaying)
    
    if (!playerRef.current || !playerReadyRef.current) {
      console.error("❌ [handlePlayPause] Player not ready:", {
        hasPlayer: !!playerRef.current,
        isReady: playerReadyRef.current
      })
      return
    }

    try {
      // Additional check for player state before calling methods
      const playerStateValue = playerRef.current.getPlayerState()
      console.log("🎮 YouTube Player State:", playerStateValue)
      
      // Check if player methods are available
      if (typeof playerRef.current.playVideo !== 'function' || 
          typeof playerRef.current.pauseVideo !== 'function') {
        console.warn("⚠️ Player methods not available, waiting for initialization...")
        return
      }
      
      // Check if player has loaded data (-1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued)
      if (playerStateValue === -1) {
        console.log("🎮 Player not ready yet, trying to cue video first")
        try {
          playerRef.current.loadVideoById(videoId)
           // Wait a bit then try to play
           setTimeout(() => {
             if (playerRef.current && playerReadyRef.current) {
               try {
                 playerRef.current.playVideo()
               } catch (playErr) {
                 console.error("Error playing after load:", playErr)
               }
             }
           }, 1000)
         } catch (cueErr) {
           console.error("Error loading video:", cueErr)
         }
         return
       }
      
      if (playerState.isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    } catch (err) {
      console.error("Error controlling YouTube player:", err)
      console.log("🔧 Player error detected, not reloading to avoid loop")
      // Don't reload automatically to avoid infinite loops
    }
  }, [playerState.isPlaying, videoId])

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
    handleMobileControlsToggle, // Mobile controls toggle
    handleVideoHover, // Video hover handler
    handleVideoLeave, // Video leave handler
  }
}
