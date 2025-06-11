"use client"

import { useRef } from "react"
import { motion } from "framer-motion"

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

  if (mediaType === "video" && mediaUrl) {
    return (
      <motion.div
        className="mt-4 rounded-xl overflow-hidden bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-contain"
            controls
            poster="/placeholder.svg?height=400&width=600"
            preload="none"
          >
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
