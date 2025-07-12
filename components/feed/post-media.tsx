"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { useVideoManager } from "@/hooks/use-video-manager"

interface PostMediaProps {
  mediaType: string
  mediaUrl?: string | null
  youtubeVideoId?: string
  textContent?: string
  content: string
}

export function PostMedia({
  mediaType,
  mediaUrl,
  youtubeVideoId,
  textContent,
  content,
}: PostMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showPlayButton, setShowPlayButton] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [isPictureInPicture, setIsPictureInPicture] = useState(false)
  const { setAsActiveVideo, clearActiveVideo } = useVideoManager(videoRef)

  // Auto play video when it comes into view (muted)
  useEffect(() => {
    const video = videoRef.current
    if (!video || hasUserInteracted) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.muted = true
            video.play().catch(() => {
              // Auto-play failed, which is normal in some browsers
            })
          } else {
            video.pause()
            // Clear active video khi video ra khỏi viewport
            if (hasUserInteracted) {
              clearActiveVideo()
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [hasUserInteracted, clearActiveVideo])

  // Theo dõi Picture-in-Picture events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnterPiP = () => {
      setIsPictureInPicture(true)
    }

    const handleLeavePiP = () => {
      setIsPictureInPicture(false)
    }

    video.addEventListener('enterpictureinpicture', handleEnterPiP)
    video.addEventListener('leavepictureinpicture', handleLeavePiP)

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP)
      video.removeEventListener('leavepictureinpicture', handleLeavePiP)
    }
  }, [])

  // Theo dõi scroll để mute video khi user lướt qua post khác (trừ khi đang ở PiP mode)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !hasUserInteracted || isPictureInPicture) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Nếu video đang có âm thanh và ra khỏi viewport một phần và KHÔNG ở PiP mode
          if (!entry.isIntersecting && !video.muted && !isPictureInPicture) {
            video.muted = true
            setShowPlayButton(true)
            clearActiveVideo()
          }
        })
      },
      { threshold: 0.8 } // Mute khi chỉ còn 80% video visible
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [hasUserInteracted, clearActiveVideo, isPictureInPicture])

  const handlePlayButtonClick = () => {
    const video = videoRef.current
    if (!video) return

    setHasUserInteracted(true)
    setShowPlayButton(false)
    video.currentTime = 0 // Reset to beginning
    video.muted = false // Enable sound
    setAsActiveVideo() // Set làm video active để mute các video khác
    video.play()
  }

  // Enhanced video support for "video", "ai-submission" mediaTypes with videoUrl
  if ((mediaType === "video" || mediaType === "ai-submission") && mediaUrl) {
    return (
      <motion.div
        className="mt-4 rounded-xl overflow-hidden bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-contain"
            controls={hasUserInteracted}
            poster="/placeholder.svg?height=400&width=600"
            preload="metadata"
            crossOrigin="anonymous"
            loop
            playsInline
            onEnded={() => {
              if (hasUserInteracted) {
                setShowPlayButton(true)
              }
            }}
          >
            <source src={mediaUrl} type="video/mp4" />
            <source src={mediaUrl} type="video/webm" />
            <source src={mediaUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
          
          {/* Custom Play Button Overlay */}
          {showPlayButton && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
              initial={{ opacity: 0.2 }}
              animate={{ 
                opacity: isHovered ? 0.7 : 0.2,
                scale: isHovered ? 1.05 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={handlePlayButtonClick}
                className="bg-black/30 hover:bg-black/50 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-200 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  if (mediaType === "youtube" && youtubeVideoId) {
    return (
      <motion.div
        className="mt-4 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&fs=1&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`}
            title={content}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </motion.div>
    )
  }

  if (mediaType === "text" && textContent) {
    return (
      <motion.div
        className="mt-4 p-4 rounded-xl border border-white/20 dark:border-gray-800/20 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm">{textContent}</p>
      </motion.div>
    )
  }

  return null
}
