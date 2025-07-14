"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { dbHelpers } from "@/lib/supabase"
import { addLike, removeLike, addComment, checkUserLikedPost, getCommentsForPost, addCommentLike, removeCommentLike, addReply, getCommentReactionsSummary } from "@/lib/likes-comments"
import { useSavedPosts } from "@/hooks/use-saved-posts"
import type { PostInteractionState } from "./types"

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  user_name?: string
  user_avatar?: string
  likes_count: number
  parent_id?: string | null
  replies?: Comment[]
  liked_by_user?: boolean
  user_reaction?: string | null
  top_reaction?: string | null
  reactions_summary?: Record<string, number>
}

export function usePostInteractions(
  initialLikes: number,
  initialComments: number,
  isNew: boolean,
  postId?: string
) {
  const { isPostSaved, toggleSavePost } = useSavedPosts()
  
  const [state, setState] = useState<PostInteractionState>({
    liked: false,
    likeCount: initialLikes,
    commentCount: initialComments,
    showComments: false,
    newComment: "",
    saved: postId ? isPostSaved(postId) : false,
    showEvaluation: false,
    showReactions: false,
    selectedReaction: null,
    isHovered: false,
    hasBeenViewed: false,
  })

  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const postRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const hideReactionsTimeout = useRef<NodeJS.Timeout | null>(null)

  // Check if user already liked this post on mount
  useEffect(() => {
    if (postId) {
      loadCurrentUser()
    }
  }, [postId])

  // Load user data first, then other data
  useEffect(() => {
    if (postId && currentUser) {
      checkUserLikeStatus()
      loadComments()
    }
  }, [postId, currentUser])

  const loadCurrentUser = async () => {
    try {
      const user = await dbHelpers.getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      console.error('Error loading current user:', error)
    }
  }

  const loadComments = async () => {
    if (!postId || !currentUser) return
    
    try {
      setLoadingComments(true)
      const commentsData = await getCommentsForPost(postId, currentUser.id)
      setComments(commentsData || [])
    } catch (error) {
      console.error('Error loading comments:', error)
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  const checkUserLikeStatus = async () => {
    if (!postId || !currentUser) return
    
    try {
      const userLike = await checkUserLikedPost(postId, currentUser.id)
      if (userLike) {
        setState(prev => ({
          ...prev,
          liked: true,
          selectedReaction: userLike.reaction_type === 'like' ? null : userLike.reaction_type
        }))
      }
    } catch (error) {
      console.error('Error checking user like status:', error)
    }
  }
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

  const handleLike = async () => {
    if (!postId) {
      console.warn('No postId provided for like action')
      return
    }
    
    console.log('🔥 Like button clicked!', { postId, liked: state.liked, likeCount: state.likeCount })
    
    try {
      if (!currentUser) {
        console.warn('❌ No current user found')
        toast({
          title: "Authentication required",
          description: "Please log in to like posts",
          variant: "destructive"
        })
        return
      }
      
      console.log('✅ Current user found:', { id: currentUser.id, email: currentUser.email })
      
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      if (state.liked) {
        console.log('👎 Removing like...')
        // Remove like
        await removeLike(postId, currentUser.id)
        console.log('✅ Like removed successfully')
        
        setState(prev => ({ 
          ...prev, 
          liked: false,
          likeCount: Math.max(0, prev.likeCount - 1),
          selectedReaction: null
        }))
        
        toast({
          title: "Like removed",
          description: "You unliked this post"
        })
      } else {
        console.log('👍 Adding like...')
        // Add like
        await addLike(postId, currentUser.id, 'like')
        console.log('✅ Like added successfully')
        
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
        
        toast({
          title: "Post liked!",
          description: "You liked this post"
        })
      }
    } catch (error) {
      console.error('Error handling like:', error)
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleReaction = async (reaction: string) => {
    if (!postId) {
      console.warn('No postId provided for reaction')
      return
    }
    
    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to react to posts",
          variant: "destructive"
        })
        return
      }
      
      await addLike(postId, currentUser.id, reaction)
      
      setState(prev => ({
        ...prev,
        selectedReaction: reaction,
        liked: true,
        likeCount: prev.liked ? prev.likeCount : prev.likeCount + 1,
        showReactions: false,
      }))

      toast({
        title: "Reaction added",
        description: `You reacted with ${reaction}`,
      })
    } catch (error) {
      console.error('Error handling reaction:', error)
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleComment = async () => {
    if (!postId) {
      console.warn('No postId provided for comment')
      return
    }
    
    console.log('💬 Comment button clicked!', { content: state.newComment })
    
    if (!state.newComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment before submitting",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to comment on posts",
          variant: "destructive"
        })
        return
      }
      
      await addComment(postId, currentUser.id, state.newComment)
      
      setState(prev => ({
        ...prev,
        commentCount: prev.commentCount + 1,
        newComment: "",
      }))

      // Reload comments to show the new one
      await loadComments()

      toast({
        title: "Comment added",
        description: "Your comment has been added to the post",
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
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

  const handleShowReactions = (show: boolean) => {
    if (hideReactionsTimeout.current) {
      clearTimeout(hideReactionsTimeout.current)
      hideReactionsTimeout.current = null
    }
    
    if (show) {
      setState(prev => ({ ...prev, showReactions: true }))
    } else {
      // Add small delay when hiding to allow mouse movement
      hideReactionsTimeout.current = setTimeout(() => {
        setState(prev => ({ ...prev, showReactions: false }))
      }, 150)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideReactionsTimeout.current) {
        clearTimeout(hideReactionsTimeout.current)
      }
    }
  }, [])

  const updateState = (updates: Partial<PostInteractionState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const handleLikeComment = async (commentId: string, reaction?: string) => {
    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to like comments",
          variant: "destructive"
        })
        return
      }

      // Find the comment and toggle its like status
      const comment = comments.find(c => c.id === commentId)
      if (!comment) return

      if (reaction) {
        // User selected a specific reaction
        await addCommentLike(commentId, currentUser.id, reaction)
        toast({
          title: "Reaction added",
          description: `You reacted with ${reaction}`,
        })
      } else {
        // Toggle like/unlike
        if (comment.liked_by_user) {
          await removeCommentLike(commentId, currentUser.id)
        } else {
          await addCommentLike(commentId, currentUser.id, 'like')
        }
      }

      // Reload comments to update like status
      await loadComments()
      
    } catch (error) {
      console.error('Error handling comment like:', error)
      toast({
        title: "Error",
        description: "Failed to update comment like. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleReplyComment = async (parentCommentId: string, content: string) => {
    if (!postId) return
    
    try {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to reply to comments",
          variant: "destructive"
        })
        return
      }

      await addReply(parentCommentId, currentUser.id, content, postId)
      
      // Reload comments to show the new reply
      await loadComments()
      
      toast({
        title: "Reply added",
        description: "Your reply has been added"
      })
      
    } catch (error) {
      console.error('Error adding reply:', error)
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Update saved state when savedPostIds changes
  useEffect(() => {
    if (postId) {
      setState(prev => ({
        ...prev,
        saved: isPostSaved(postId)
      }))
    }
  }, [postId, isPostSaved])

  const handleSaveToggle = async () => {
    if (!postId) return
    
    const success = await toggleSavePost(postId)
    if (success) {
      // State will be updated by the useEffect above
    }
  }

  return {
    state,
    updateState,
    postRef,
    commentInputRef,
    comments,
    loadingComments,
    currentUser,
    handleLike,
    handleReaction,
    handleComment,
    handleLikeComment,
    handleReplyComment,
    handleShare,
    handleSaveToggle,
    focusCommentInput,
    handleShowReactions,
  }
}
