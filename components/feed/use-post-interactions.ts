"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import type { PostInteractionState } from "./types"

export function usePostInteractions(
  initialLikes: number,
  initialComments: number,
  isNew: boolean
) {
  const [state, setState] = useState<PostInteractionState>({
    liked: false,
    likeCount: initialLikes,
    commentCount: initialComments,
    showComments: false,
    newComment: "",
    saved: false,
    showEvaluation: false,
    showReactions: false,
    selectedReaction: null,
    isHovered: false,
    hasBeenViewed: false,
  })

  const postRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  // Intersection Observer to detect when post is in view
  useEffect(() => {
    if (!state.hasBeenViewed && postRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setState(prev => ({ ...prev, hasBeenViewed: true }))
            observer.disconnect()
          }
        },
        { threshold: 0.5 },
      )

      observer.observe(postRef.current)
      return () => observer.disconnect()
    }
  }, [state.hasBeenViewed])

  // Highlight effect for new posts
  useEffect(() => {
    if (isNew && postRef.current) {
      postRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [isNew])

  const handleLike = () => {
    console.log('🔥 Like button clicked!', { liked: state.liked, likeCount: state.likeCount })
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    if (state.liked) {
      setState(prev => ({ 
        ...prev, 
        liked: false,
        likeCount: prev.likeCount - 1 
      }))
    } else {
      setState(prev => ({ 
        ...prev, 
        liked: true,
        likeCount: prev.likeCount + 1 
      }))

      // Show a small confetti effect
      const confetti = document.createElement("div")
      confetti.className = "absolute z-10 text-2xl"
      confetti.innerHTML = "❤️"
      confetti.style.left = `${Math.random() * 80 + 10}%`
      confetti.style.top = "0"
      confetti.style.position = "absolute"
      confetti.style.animation = "float-up 1s ease-out forwards"
      if (postRef.current) postRef.current.appendChild(confetti)

      setTimeout(() => {
        if (postRef.current && postRef.current.contains(confetti)) {
          postRef.current.removeChild(confetti)
        }
      }, 1000)
    }
  }

  const handleReaction = (reaction: string) => {
    setState(prev => ({
      ...prev,
      selectedReaction: reaction,
      liked: true,
      likeCount: prev.likeCount + 1,
      showReactions: false,
    }))

    toast({
      title: "Reaction added",
      description: `You reacted with ${reaction}`,
    })
  }

  const handleComment = () => {
    console.log('💬 Comment button clicked!')
    if (state.newComment.trim()) {
      setState(prev => ({
        ...prev,
        commentCount: prev.commentCount + 1,
        newComment: "",
      }))

      toast({
        title: "Comment added",
        description: "Your comment has been added to the post",
      })
    }
  }

  const handleShare = () => {
    console.log('📤 Share button clicked!')
    toast({
      title: "Link copied",
      description: "Post link has been copied to clipboard",
    })
  }

  const focusCommentInput = () => {
    setState(prev => ({ ...prev, showComments: true }))
    setTimeout(() => {
      commentInputRef.current?.focus()
    }, 100)
  }

  const updateState = (updates: Partial<PostInteractionState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  return {
    state,
    updateState,
    postRef,
    commentInputRef,
    handleLike,
    handleReaction,
    handleComment,
    handleShare,
    focusCommentInput,
  }
}
