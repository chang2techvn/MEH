"use client"

import { useState, useCallback } from "react"
import type { PostInteractionState } from "./types"

export function usePostInteractions(initialLikes: number, initialComments: number) {
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

  const toggleLike = useCallback(() => {
    setState(prev => ({
      ...prev,
      liked: !prev.liked,
      likeCount: prev.liked ? prev.likeCount - 1 : prev.likeCount + 1,
    }))
  }, [])

  const toggleComments = useCallback(() => {
    setState(prev => ({
      ...prev,
      showComments: !prev.showComments,
    }))
  }, [])

  const updateComment = useCallback((comment: string) => {
    setState(prev => ({
      ...prev,
      newComment: comment,
    }))
  }, [])

  const addComment = useCallback(() => {
    if (state.newComment.trim()) {
      setState(prev => ({
        ...prev,
        commentCount: prev.commentCount + 1,
        newComment: "",
      }))
    }
  }, [state.newComment])

  const toggleSave = useCallback(() => {
    setState(prev => ({
      ...prev,
      saved: !prev.saved,
    }))
  }, [])

  const toggleEvaluation = useCallback(() => {
    setState(prev => ({
      ...prev,
      showEvaluation: !prev.showEvaluation,
    }))
  }, [])

  const toggleReactions = useCallback(() => {
    setState(prev => ({
      ...prev,
      showReactions: !prev.showReactions,
    }))
  }, [])

  const selectReaction = useCallback((reaction: string) => {
    setState(prev => ({
      ...prev,
      selectedReaction: reaction,
      showReactions: false,
    }))
  }, [])

  const setHovered = useCallback((hovered: boolean) => {
    setState(prev => ({
      ...prev,
      isHovered: hovered,
    }))
  }, [])

  const markAsViewed = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasBeenViewed: true,
    }))
  }, [])

  return {
    ...state,
    toggleLike,
    toggleComments,
    updateComment,
    addComment,
    toggleSave,
    toggleEvaluation,
    toggleReactions,
    selectReaction,
    setHovered,
    markAsViewed,
  }
}
