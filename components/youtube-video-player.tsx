"use client"

import { useYouTubePlayer } from "./youtube/use-youtube-player"
import { VideoLoadingState } from "./youtube/video-loading-state"
import { VideoErrorState } from "./youtube/video-error-state"
import { VideoControls } from "./youtube/video-controls"
import type { YouTubeVideoPlayerProps } from "./youtube/types"

export default function YouTubeVideoPlayer({
  videoId,
  title,
  requiredWatchTime = 180, // Default 3 minutes
  onWatchComplete,
}: YouTubeVideoPlayerProps) {
  const {
    playerState,
    playerContainerRef,
    playbackRateMenuRef,
    handlePlayPause,
    handleRewind,
    handleForward,
    handlePlaybackRateChange,
    handleFullscreen,
    reloadVideo,
    setShowPlaybackRateMenu,
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
          </div>

          {/* Custom controls */}
          <VideoControls
            playerState={playerState}
            requiredWatchTime={requiredWatchTime}
            onPlayPause={handlePlayPause}
            onRewind={handleRewind}
            onForward={handleForward}
            onPlaybackRateChange={handlePlaybackRateChange}
            onFullscreen={handleFullscreen}
            onShowPlaybackRateMenuChange={setShowPlaybackRateMenu}
            playbackRateMenuRef={playbackRateMenuRef}
          />
        </>
      )}
    </div>
  )
}
