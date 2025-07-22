"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { Story } from "@/hooks/use-stories"

interface UseStoryControlsProps {
  stories: Story[]
  user: any
  activeStory: number | string | null
  activeUserStories: Story[]
  currentStoryIndex: number
  viewStory: (storyId: string) => void
  addStoryReply: (storyId: string, content: string) => Promise<boolean>
}

export function useStoryControls({
  stories,
  user,
  activeStory,
  activeUserStories,
  currentStoryIndex,
  viewStory,
  addStoryReply,
}: UseStoryControlsProps) {
  // Story state
  const [storyPaused, setStoryPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const [showStoryViewers, setShowStoryViewers] = useState(false)
  const [selectedStoryForViewers, setSelectedStoryForViewers] = useState<string | null>(null)
  
  // Reply state
  const [storyReplyText, setStoryReplyText] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  
  // Reaction state
  const [showStoryReactions, setShowStoryReactions] = useState(false)
  const [storyReactionAnimations, setStoryReactionAnimations] = useState<Array<{id: string, emoji: string, x: number, y: number}>>([])
  
  // Video state
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoDuration, setVideoDuration] = useState(5)
  const [videoMuted, setVideoMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Story reactions
  const storyReactions = ['❤️', '😂', '😮', '😢', '😡', '👍']

  // Helper function to group stories by user
  const getStoriesGroupedByUser = () => {
    const grouped = new Map<string, Story[]>()
    
    stories.forEach(story => {
      const userId = story.author_id
      if (!grouped.has(userId)) {
        grouped.set(userId, [])
      }
      grouped.get(userId)!.push(story)
    })
    
    // Convert to array and sort stories within each group by creation time
    return Array.from(grouped.entries()).map(([userId, userStories]) => ({
      userId,
      stories: userStories.sort((a, b) => 
        new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      )
    }))
  }

  // Helper function to move to next user's stories
  const moveToNextUser = (
    setActiveUserStories: (stories: Story[]) => void,
    setCurrentStoryIndex: (index: number) => void,
    setActiveStory: (id: number | string | null) => void,
    setStoryPaused: (paused: boolean) => void
  ) => {
    const allGroupedStories = getStoriesGroupedByUser()
    const currentUserIndex = allGroupedStories.findIndex(group => 
      group.stories.some(s => s.id === activeStory)
    )
    
    if (currentUserIndex !== -1 && currentUserIndex < allGroupedStories.length - 1) {
      // Move to next user
      const nextUserGroup = allGroupedStories[currentUserIndex + 1]
      setActiveUserStories(nextUserGroup.stories)
      setCurrentStoryIndex(0)
      setActiveStory(nextUserGroup.stories[0].id)
      setProgressKey(prev => prev + 1)
      viewStory(String(nextUserGroup.stories[0].id))
      
      // Update story viewers modal if open and user is story author
      if (showStoryViewers && user && nextUserGroup.stories[0]?.author_id === user.id) {
        setSelectedStoryForViewers(nextUserGroup.stories[0].id)
      } else if (showStoryViewers) {
        setShowStoryViewers(false)
        setStoryPaused(false)
      }
    } else {
      // No more users, close story viewer
      setActiveStory(null)
      setActiveUserStories([])
      setCurrentStoryIndex(0)
      setProgressKey(0)
      // Close viewers modal if open
      if (showStoryViewers) {
        setShowStoryViewers(false)
        setStoryPaused(false)
      }
    }
  }

  // Helper function to move to previous user's stories
  const moveToPreviousUser = (
    setActiveUserStories: (stories: Story[]) => void,
    setCurrentStoryIndex: (index: number) => void,
    setActiveStory: (id: number | string | null) => void
  ) => {
    const allGroupedStories = getStoriesGroupedByUser()
    const currentUserIndex = allGroupedStories.findIndex(group => 
      group.stories.some(s => s.id === activeStory)
    )
    
    if (currentUserIndex > 0) {
      // Move to previous user
      const prevUserGroup = allGroupedStories[currentUserIndex - 1]
      const lastStoryIndex = prevUserGroup.stories.length - 1
      setActiveUserStories(prevUserGroup.stories)
      setCurrentStoryIndex(lastStoryIndex)
      setActiveStory(prevUserGroup.stories[lastStoryIndex].id)
      setProgressKey(prev => prev + 1)
      viewStory(String(prevUserGroup.stories[lastStoryIndex].id))
      
      // Update story viewers modal if open and user is story author
      if (showStoryViewers && user && prevUserGroup.stories[lastStoryIndex]?.author_id === user.id) {
        setSelectedStoryForViewers(prevUserGroup.stories[lastStoryIndex].id)
      } else if (showStoryViewers) {
        setShowStoryViewers(false)
        setStoryPaused(false)
      }
    }
  }

  // Navigation functions for stories
  const goToPreviousStory = (
    setActiveUserStories: (stories: Story[]) => void,
    setCurrentStoryIndex: (index: number) => void,
    setActiveStory: (id: number | string | null) => void
  ) => {
    if (currentStoryIndex > 0) {
      // Previous story in current user's stories
      const newIndex = currentStoryIndex - 1
      setCurrentStoryIndex(newIndex)
      setActiveStory(activeUserStories[newIndex].id)
      setProgressKey(prev => prev + 1)
      viewStory(String(activeUserStories[newIndex].id))
      
      // Update story viewers modal if open and user is story author
      if (showStoryViewers && user && activeUserStories[newIndex]?.author_id === user.id) {
        setSelectedStoryForViewers(activeUserStories[newIndex].id)
      } else if (showStoryViewers) {
        setShowStoryViewers(false)
        setStoryPaused(false)
      }
    } else {
      // Move to previous user's stories
      moveToPreviousUser(setActiveUserStories, setCurrentStoryIndex, setActiveStory)
    }
  }

  const goToNextStory = (
    setActiveUserStories: (stories: Story[]) => void,
    setCurrentStoryIndex: (index: number) => void,
    setActiveStory: (id: number | string | null) => void,
    setStoryPaused: (paused: boolean) => void
  ) => {
    if (currentStoryIndex < activeUserStories.length - 1) {
      // Next story in current user's stories
      const newIndex = currentStoryIndex + 1
      setCurrentStoryIndex(newIndex)
      setActiveStory(activeUserStories[newIndex].id)
      setProgressKey(prev => prev + 1)
      viewStory(String(activeUserStories[newIndex].id))
      
      // Update story viewers modal if open and user is story author
      if (showStoryViewers && user && activeUserStories[newIndex]?.author_id === user.id) {
        setSelectedStoryForViewers(activeUserStories[newIndex].id)
      } else if (showStoryViewers) {
        setShowStoryViewers(false)
        setStoryPaused(false)
      }
    } else {
      // Move to next user's stories
      moveToNextUser(setActiveUserStories, setCurrentStoryIndex, setActiveStory, setStoryPaused)
    }
  }

  // Handle center tap to pause/resume story and video
  const handleCenterTap = () => {
    setStoryPaused(!storyPaused)
    
    // Also pause/resume video if it exists
    if (videoRef.current) {
      if (storyPaused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  // Handle video events for progress tracking
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || 5)
      setVideoProgress(0)
    }
  }

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !storyPaused) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setVideoProgress(progress)
    }
  }

  const handleVideoEnded = (
    setActiveUserStories: (stories: Story[]) => void,
    setCurrentStoryIndex: (index: number) => void,
    setActiveStory: (id: number | string | null) => void,
    setStoryPaused: (paused: boolean) => void
  ) => {
    // Move to next story when video ends
    goToNextStory(setActiveUserStories, setCurrentStoryIndex, setActiveStory, setStoryPaused)
  }

  // Handle video mute/unmute
  const handleVideoMuteToggle = () => {
    setVideoMuted(!videoMuted)
    if (videoRef.current) {
      videoRef.current.muted = !videoMuted
    }
  }

  // Handle story viewers modal
  const handleStoryViewersClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling to story navigation
    const currentStory = activeUserStories[currentStoryIndex] || stories.find((s) => s.id === activeStory)
    if (currentStory && user && currentStory.author_id === user.id) {
      setSelectedStoryForViewers(currentStory.id)
      setShowStoryViewers(true)
      setStoryPaused(true) // Pause story progression
    }
  }

  // Handle closing story viewers
  const handleCloseStoryViewers = () => {
    setShowStoryViewers(false)
    setStoryPaused(false) // Resume story progression
  }

  // Handle story reply submission
  const handleStoryReplySubmit = async () => {
    if (!storyReplyText.trim() || !activeStory || isSubmittingReply) return

    setIsSubmittingReply(true)
    setStoryPaused(true) // Pause story while sending reply

    try {
      const success = await addStoryReply(String(activeStory), storyReplyText.trim())
      
      if (success) {
        setStoryReplyText("")
        // Keep story paused for a moment to show success
        setTimeout(() => {
          setStoryPaused(false)
        }, 1500)
      } else {
        setStoryPaused(false) // Resume if failed
      }
    } catch (error) {
      setStoryPaused(false) // Resume if failed
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // Handle story reply input key press
  const handleStoryReplyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleStoryReplySubmit()
    }
  }

  // Handle story reaction submission
  const handleStoryReaction = async (emoji: string) => {
    if (!activeStory || !user) return

    try {
      // Add floating animation
      const animationId = Date.now().toString()
      const buttonRect = document.querySelector('.story-reactions-button')?.getBoundingClientRect()
      
      setStoryReactionAnimations(prev => [...prev, {
        id: animationId,
        emoji,
        x: buttonRect ? buttonRect.left + buttonRect.width / 2 : window.innerWidth / 2,
        y: buttonRect ? buttonRect.top : window.innerHeight / 2
      }])

      // Remove animation after 3 seconds
      setTimeout(() => {
        setStoryReactionAnimations(prev => prev.filter(anim => anim.id !== animationId))
      }, 3000)

      // Close reactions popup
      setShowStoryReactions(false)

      // Add reaction to database using story_views table
      // Add reaction to existing reactions array or create new record
      const timestamp = new Date().toISOString()
      
      // First, try to get existing reaction record
      const { data: existingRecord } = await supabase
        .from('story_views')
        .select('id, reactions')
        .eq('story_id', activeStory)
        .eq('viewer_id', user.id)
        .eq('interaction_type', 'reaction')
        .single()

      let reactions = []
      if (existingRecord) {
        // Update existing record - add new reaction to array
        reactions = existingRecord.reactions || []
        
        // Check if this emoji already exists - if so, update timestamp
        const existingReactionIndex = reactions.findIndex((r: any) => r.emoji === emoji)
        if (existingReactionIndex >= 0) {
          reactions[existingReactionIndex].timestamp = timestamp
        } else {
          // Add new reaction
          reactions.push({ emoji, timestamp })
        }

        const { error: updateError } = await supabase
          .from('story_views')
          .update({
            reactions,
            reacted_at: timestamp,
            viewed_at: timestamp
          })
          .eq('id', existingRecord.id)
        
        if (updateError) throw updateError
      } else {
        // Create new reaction record
        reactions = [{ emoji, timestamp }]
        const { error: insertError } = await supabase
          .from('story_views')
          .insert({
            story_id: activeStory,
            viewer_id: user.id,
            interaction_type: 'reaction',
            reactions,
            reacted_at: timestamp,
            viewed_at: timestamp
          })
        
        if (insertError) throw insertError
      }

      toast({
        title: "Reaction Added",
        description: `You reacted with ${emoji}`
      })
    } catch (error: any) {
      console.error('Error adding story reaction:', error)
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      })
    }
  }

  return {
    // State
    storyPaused,
    setStoryPaused,
    progressKey,
    setProgressKey,
    showStoryViewers,
    setShowStoryViewers,
    selectedStoryForViewers,
    setSelectedStoryForViewers,
    storyReplyText,
    setStoryReplyText,
    isSubmittingReply,
    showStoryReactions,
    setShowStoryReactions,
    storyReactionAnimations,
    setStoryReactionAnimations,
    videoProgress,
    setVideoProgress,
    videoDuration,
    setVideoDuration,
    videoMuted,
    setVideoMuted,
    videoRef,
    storyReactions,
    
    // Functions
    goToPreviousStory,
    goToNextStory,
    handleCenterTap,
    handleVideoLoadedMetadata,
    handleVideoTimeUpdate,
    handleVideoEnded,
    handleVideoMuteToggle,
    handleStoryViewersClick,
    handleCloseStoryViewers,
    handleStoryReplySubmit,
    handleStoryReplyKeyPress,
    handleStoryReaction,
    getStoriesGroupedByUser
  }
}
