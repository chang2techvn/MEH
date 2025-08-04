"use client"

import { useState } from "react"

interface YoutubeVideoPlayerProps {
  videoUrl?: string
  videoId?: string
  title?: string
  className?: string
  autoplay?: boolean
  controls?: boolean
  muted?: boolean
}

const YoutubeVideoPlayer = ({ 
  videoUrl, 
  videoId,
  title,
  className = "", 
  autoplay = false, 
  controls = true, 
  muted = false 
}: YoutubeVideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true)

  // Extract video ID from YouTube URL or use provided videoId
  const getVideoId = (url?: string): string | null => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const finalVideoId = videoId || getVideoId(videoUrl)

  if (!finalVideoId) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">Invalid YouTube URL or Video ID</p>
      </div>
    )
  }

  const embedUrl = `https://www.youtube.com/embed/${finalVideoId}?${new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: controls ? '1' : '0',
    mute: muted ? '1' : '0',
    rel: '0',
    modestbranding: '1'
  }).toString()}`

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-500">Loading video...</div>
        </div>
      )}
      <iframe
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}

export default YoutubeVideoPlayer
