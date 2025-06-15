"use client"

import { useYouTubePlayer } from "./use-youtube-player"
import { VideoLoadingState } from "./video-loading-state"
import { VideoErrorState } from "./video-error-state"
import { VideoControls } from "./video-controls"
import type { YouTubeVideoPlayerProps } from "./types"

export default function YouTubeVideoPlayer({
  videoId,
  title,
  requiredWatchTime = 180, // Default 3 minutes
  onWatchComplete,
}: YouTubeVideoPlayerProps) {  const {
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
  } = useYouTubePlayer(videoId, requiredWatchTime, onWatchComplete)

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {playerState.loading && <VideoLoadingState />}

      {playerState.error ? (
        <VideoErrorState onReload={reloadVideo} />
      ) : (
        <>
          {/* YouTube player container */}
          <div className="w-full h-full">
            <div ref={playerContainerRef} className="w-full h-full" />
          </div>          {/* Custom controls */}
          <VideoControls
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
        </>
      )}
    </div>
  )
}
