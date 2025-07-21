"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  RewindIcon, 
  FastForwardIcon, 
  PlayIcon, 
  PauseIcon,
  MaximizeIcon,
  MinimizeIcon,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX,
  Settings
} from "lucide-react"
import { formatTime } from "./youtube-api"
import { useMobile } from "@/hooks/use-mobile"
import type { PlayerState } from "./types"

interface VideoControlsProps {
  playerState: PlayerState
  requiredWatchTime: number
  onPlayPause: () => void
  onRewind: () => void
  onForward: () => void
  onPlaybackRateChange: (rate: number) => void
  onFullscreen: () => void
  onVolumeChange: (volume: number) => void
  onMuteToggle: () => void
  onShowPlaybackRateMenuChange: (show: boolean) => void
  onShowVolumeSliderChange: (show: boolean) => void
  playbackRateMenuRef: React.RefObject<HTMLDivElement | null>
}

export function VideoControls({
  playerState,
  requiredWatchTime,
  onPlayPause,
  onRewind,
  onForward,
  onPlaybackRateChange,
  onFullscreen,
  onVolumeChange,
  onMuteToggle,
  onShowPlaybackRateMenuChange,
  onShowVolumeSliderChange,
  playbackRateMenuRef,
}: VideoControlsProps) {
  const { isMobile } = useMobile()
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    showPlaybackRateMenu,
    completed,
    watchTime,
    volume,
    isMuted,
    showVolumeSlider,
  } = playerState

  const progressPercentage = Math.min((watchTime / requiredWatchTime) * 100, 100)

  // Fullscreen functionality for mobile
  const handleMobileFullscreen = async () => {
    if (!isMobile) {
      onFullscreen()
      return
    }

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        const element = document.documentElement
        if (element.requestFullscreen) {
          await element.requestFullscreen()
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen()
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen()
        }
        setIsFullscreen(true)
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  // ✅ Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (playbackRateMenuRef.current && !playbackRateMenuRef.current.contains(event.target as Node)) {
        onShowPlaybackRateMenuChange(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [playbackRateMenuRef, onShowPlaybackRateMenuChange])

  return (
    <motion.div 
      className={`absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm rounded-b-xl ${
        isMobile ? 'p-1 sm:p-2' : 'p-2'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className={`flex items-center gap-1 sm:gap-2 mb-1 text-white`}>
        {/* Left controls group */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`${isMobile ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-8 w-8'} rounded-full text-white hover:bg-white/20`}
            onClick={onRewind}
          >
            <RewindIcon className={`${isMobile ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4'}`} />
            <span className="sr-only">Rewind 5s</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`${isMobile ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-8 w-8'} rounded-full text-white hover:bg-white/20`}
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <PauseIcon className={`${isMobile ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4'}`} />
            ) : (
              <PlayIcon className={`${isMobile ? 'h-3 w-3 sm:h-4 sm:w-4 ml-0.5' : 'h-4 w-4 ml-0.5'}`} />
            )}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`${isMobile ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-8 w-8'} rounded-full text-white hover:bg-white/20`}
            onClick={onForward}
          >
            <FastForwardIcon className={`${isMobile ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4'}`} />
            <span className="sr-only">Forward 5s</span>
          </Button>

          {/* Time display với khoảng cách rõ ràng - hiển thị trên tất cả kích thước */}
          <div className="flex items-center gap-1 sm:gap-2 ml-3 sm:ml-4">
            <Clock className={`${isMobile ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4'} text-white/80`} />
            <div className={`${isMobile ? 'text-xs sm:text-sm' : 'text-sm'} font-medium whitespace-nowrap`}>
              {formatTime(Math.floor(currentTime))} /{" "}
              {formatTime(Math.floor(duration > 0 ? duration : requiredWatchTime))}
            </div>
          </div>
        </div>

        {/* Spacer để đẩy right controls sang bên phải */}
        <div className="flex-1"></div>

        {/* Right controls group */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Volume Controls - hiển thị trên mobile từ sm breakpoint */}
          <div className="hidden xs:block relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className={`${isMobile ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-8 w-8'} rounded-full text-white hover:bg-white/20`}
              onClick={onMuteToggle}
              onMouseEnter={() => onShowVolumeSliderChange(true)}
              onMouseLeave={() => onShowVolumeSliderChange(false)}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className={`${isMobile ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4'}`} />
              ) : (
                <Volume2 className={`${isMobile ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4'}`} />
              )}
              <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
            </Button>

            {/* Volume Slider */}
            {showVolumeSlider && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-3 z-20"
                onMouseEnter={() => onShowVolumeSliderChange(true)}
                onMouseLeave={() => onShowVolumeSliderChange(false)}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-white/80 font-medium">
                    {Math.round(volume)}%
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider-vertical"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${volume}%, rgba(255,255,255,0.2) ${volume}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Playback Rate - hide chỉ trên mobile rất nhỏ */}
          <div className="hidden sm:block relative">
            <Button
              variant="ghost"
              size="sm"
              className={`${isMobile ? 'h-6 sm:h-8 text-xs sm:text-sm' : 'h-8'} rounded-full text-white hover:bg-white/20`}
              onClick={() => onShowPlaybackRateMenuChange(!showPlaybackRateMenu)}
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
                    onClick={() => onPlaybackRateChange(rate)}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen button */}
          <Button
            variant="ghost"
            size="icon"
            className={`${isMobile ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-8 w-8'} rounded-full text-white hover:bg-white/20`}
            onClick={handleMobileFullscreen}
          >
            {isMobile && isFullscreen ? (
              <MinimizeIcon className={`${isMobile ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4'}`} />
            ) : (
              <MaximizeIcon className={`${isMobile ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4'}`} />
            )}
            <span className="sr-only">{isMobile && isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </Button>

          {/* Completed badge - Fixed positioning for mobile */}
          {completed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`flex items-center gap-1 bg-green-500/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full ${
                isMobile ? 'ml-1 max-w-[80px] sm:max-w-none sm:ml-2' : 'ml-2'
              }`}
            >
              <CheckCircle className={`${isMobile ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4'} text-green-500 flex-shrink-0`} />
              <span className={`${isMobile ? 'text-xs sm:text-sm truncate' : 'text-sm'} font-medium text-green-500`}>
                {isMobile ? 'done' : 'completed'}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className={`relative ${isMobile ? 'h-1.5 sm:h-2' : 'h-2'} bg-white/20 rounded-full overflow-hidden`}>
        <motion.div
          className={`absolute left-0 top-0 h-full ${
            completed ? "bg-green-500" : "bg-gradient-to-r from-blue-500 to-purple-600"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>      
      <div className={`mt-1 flex justify-between items-center ${isMobile ? 'flex-col xs:flex-row gap-1 xs:gap-0' : ''}`}>
        <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-white/80 text-center xs:text-left`}>
          {completed ? (
            <span className="text-green-400 font-medium">
              🎉 Required watch time reached! Video auto-paused.
            </span>
          ) : (
            <span>Watch {formatTime(requiredWatchTime - watchTime)} more to continue</span>
          )}
        </div>
        <div className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-white/80`}>
          {Math.round(progressPercentage)}%
        </div>
      </div>
    </motion.div>
  )
}
