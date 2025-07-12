"use client"

import { useEffect, useRef } from "react"

// Global video manager để đảm bảo chỉ có 1 video có âm thanh tại một thời điểm
class VideoManager {
  private currentActiveVideo: HTMLVideoElement | null = null
  private observers: Set<() => void> = new Set()
  
  setActiveVideo(video: HTMLVideoElement) {
    // Mute video hiện tại nếu có và không phải là video mới và video hiện tại không ở PiP mode
    if (this.currentActiveVideo && this.currentActiveVideo !== video) {
      // Kiểm tra xem video hiện tại có đang ở Picture-in-Picture mode không
      const isCurrentPiP = document.pictureInPictureElement === this.currentActiveVideo
      if (!isCurrentPiP) {
        this.currentActiveVideo.muted = true
        this.notifyObservers()
      }
    }
    this.currentActiveVideo = video
  }
  
  clearActiveVideo(video: HTMLVideoElement) {
    if (this.currentActiveVideo === video) {
      this.currentActiveVideo = null
    }
  }
  
  muteCurrentVideo() {
    if (this.currentActiveVideo) {
      // Chỉ mute nếu không ở PiP mode
      const isPiP = document.pictureInPictureElement === this.currentActiveVideo
      if (!isPiP) {
        this.currentActiveVideo.muted = true
        this.notifyObservers()
      }
    }
  }
  
  addObserver(callback: () => void) {
    this.observers.add(callback)
  }
  
  removeObserver(callback: () => void) {
    this.observers.delete(callback)
  }
  
  private notifyObservers() {
    this.observers.forEach(callback => callback())
  }
}

const videoManager = new VideoManager()

export function useVideoManager(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const isActiveRef = useRef(false)
  
  const setAsActiveVideo = () => {
    const video = videoRef.current
    if (!video) return
    
    videoManager.setActiveVideo(video)
    isActiveRef.current = true
  }
  
  const clearActiveVideo = () => {
    const video = videoRef.current
    if (!video) return
    
    videoManager.clearActiveVideo(video)
    isActiveRef.current = false
  }
  
  // Observer để theo dõi khi video khác được active
  useEffect(() => {
    const handleVideoMuted = () => {
      const video = videoRef.current
      if (video && isActiveRef.current && video.muted) {
        // Chỉ clear active nếu không ở PiP mode
        const isPiP = document.pictureInPictureElement === video
        if (!isPiP) {
          isActiveRef.current = false
        }
      }
    }
    
    videoManager.addObserver(handleVideoMuted)
    
    return () => {
      videoManager.removeObserver(handleVideoMuted)
    }
  }, [videoRef])
  
  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current
      if (video) {
        videoManager.clearActiveVideo(video)
      }
    }
  }, [videoRef])
  
  return {
    setAsActiveVideo,
    clearActiveVideo,
    isActive: () => isActiveRef.current
  }
}
