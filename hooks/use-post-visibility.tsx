"use client"

import { useEffect, useCallback } from "react"
import { useInView } from "react-intersection-observer"

interface UsePostVisibilityProps {
  postIndex: number
  totalPosts: number
  onPostVisible: (postIndex: number, totalPosts: number) => void
}

export function usePostVisibility({ postIndex, totalPosts, onPostVisible }: UsePostVisibilityProps) {
  // Use intersection observer to detect when post comes into view
  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger when 50% of the post is visible
    triggerOnce: false, // Allow multiple triggers as user scrolls
    rootMargin: '100px 0px', // Start detecting 100px before the post enters viewport
  })

  // Callback when post becomes visible
  const handlePostVisible = useCallback(() => {
    if (inView) {
      onPostVisible(postIndex, totalPosts)
    }
  }, [inView, postIndex, totalPosts, onPostVisible])

  useEffect(() => {
    handlePostVisible()
  }, [handlePostVisible])

  return { ref, inView }
}

// Hook for monitoring post visibility and triggering preloads
export function usePostPreloadTrigger(checkAndPreloadPosts: (index: number, total: number) => void) {
  const createVisibilityHandler = useCallback((postIndex: number, totalPosts: number) => {
    // Only call preload function when post comes into view
    checkAndPreloadPosts(postIndex, totalPosts)
  }, [checkAndPreloadPosts])

  return { createVisibilityHandler }
}
