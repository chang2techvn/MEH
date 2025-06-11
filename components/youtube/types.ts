// YouTube Player interface and types
export interface YouTubePlayer {
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

export interface YouTubeVideoPlayerProps {
  videoId: string
  title: string
  requiredWatchTime?: number // in seconds
  onWatchComplete?: () => void
}

export interface PlayerState {
  loading: boolean
  error: boolean
  watchTime: number
  isPlaying: boolean
  completed: boolean
  playbackRate: number
  showPlaybackRateMenu: boolean
  currentTime: number
  duration: number
}
