"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  RewindIcon, 
  FastForwardIcon, 
  PlayIcon, 
  PauseIcon,
  MaximizeIcon,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX,
  Settings
} from "lucide-react"
import { formatTime } from "./youtube-api"
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
    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 rounded-b-xl">
      <div className="flex items-center gap-2 mb-1 text-white">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-white/20"
          onClick={onRewind}
        >
          <RewindIcon className="h-4 w-4" />
          <span className="sr-only">Rewind 5s</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-white/20"
          onClick={onPlayPause}
        >
          {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4 ml-0.5" />}
          <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-white/20"
          onClick={onForward}
        >
          <FastForwardIcon className="h-4 w-4" />
          <span className="sr-only">Forward 5s</span>
        </Button>        <div className="flex items-center gap-2 ml-2">
          <Clock className="h-4 w-4 text-white/80" />
          <div className="text-sm font-medium">
            {formatTime(Math.floor(currentTime))} /{" "}
            {formatTime(Math.floor(duration > 0 ? duration : requiredWatchTime))}
          </div>
        </div>

        {/* Volume Controls */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-white hover:bg-white/20"
              onClick={onMuteToggle}
              onMouseEnter={() => onShowVolumeSliderChange(true)}
              onMouseLeave={() => onShowVolumeSliderChange(false)}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
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
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full text-white hover:bg-white/20"
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

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/20"
            onClick={onFullscreen}
          >
            <MaximizeIcon className="h-4 w-4" />
            <span className="sr-only">Fullscreen</span>
          </Button>          {completed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                completed
              </span>
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
      </div>      <div className="mt-1 flex justify-between items-center">
        <div className="text-xs text-white/80">
          {completed ? (
            <span className="text-green-400 font-medium">
              🎉 Required watch time reached! Video auto-paused.
            </span>
          ) : (
            <span>Watch {formatTime(requiredWatchTime - watchTime)} more to continue</span>
          )}
        </div>
        <div className="text-xs font-medium text-white/80">{Math.round(progressPercentage)}%</div>
      </div>
    </div>
  )
}
