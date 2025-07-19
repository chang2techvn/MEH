"use client"

import { useYouTubePlayer } from "./use-youtube-player"
import { VideoLoadingState } from "./video-loading-state"
import { VideoErrorState } from "./video-error-state"
import { VideoControls } from "./video-controls"
import { useMobile } from "@/hooks/use-mobile"
import { AnimatePresence } from "framer-motion"
import type { YouTubeVideoPlayerProps } from "./types"

export default function YouTubeVideoPlayer({
  videoId,
  title,
  requiredWatchTime = 180, // Default 3 minutes
  onWatchComplete,
}: YouTubeVideoPlayerProps) {
  const { isMobile } = useMobile()
  
  const {
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
    handleMobileControlsToggle,
    handleVideoHover,
    handleVideoLeave,
  } = useYouTubePlayer(videoId, requiredWatchTime, onWatchComplete)

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {playerState.loading && <VideoLoadingState />}

      {playerState.error ? (
        <VideoErrorState onReload={reloadVideo} />
      ) : (
        <>
          {/* YouTube player container */}
          <div 
            className="w-full h-full relative"
            onMouseEnter={handleVideoHover}
            onMouseMove={handleVideoHover}
            onMouseLeave={handleVideoLeave}
            onTouchStart={handleMobileControlsToggle}
          >
            <div ref={playerContainerRef} className="w-full h-full" />
            
            {/* Touch overlay for mobile - only when controls are hidden */}
            {isMobile && !playerState.showMobileControls && (
              <div
                className="absolute inset-0 bg-transparent z-10 flex items-center justify-center"
                onTouchStart={(e) => {
                  e.stopPropagation()
                  handleMobileControlsToggle()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleMobileControlsToggle()
                }}
                style={{ pointerEvents: 'auto' }}
              >
                {/* Subtle visual hint */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-white/60 text-xs animate-pulse">
                  Tap to show controls
                </div>
              </div>
            )}
          </div>

          {/* Custom controls - conditional visibility on both mobile and desktop */}
          <AnimatePresence mode="wait">
            {playerState.showMobileControls && (
              <VideoControls
                key="video-controls"
                playerState={playerState}
                requiredWatchTime={requiredWatchTime}
                onPlayPause={handlePlayPause}
                onRewind={handleRewind}
                onForward={handleForward}
                onPlaybackRateChange={handlePlaybackRateChange}
                onFullscreen={handleFullscreen}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={handleMuteToggle}
                onShowPlaybackRateMenuChange={setShowPlaybackRateMenu}
                onShowVolumeSliderChange={setShowVolumeSlider}
                playbackRateMenuRef={playbackRateMenuRef}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
