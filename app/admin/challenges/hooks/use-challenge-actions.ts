"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { extractVideoFromUrl } from "@/app/actions/youtube-video"
import type { Challenge } from "@/app/actions/challenge-videos"
import { STORAGE_KEY, DEFAULT_FORM_STATE } from "../constants"
import type { ChallengeFormState } from "../types"

export function useChallengeActions(challenges: Challenge[], setChallenges: (challenges: Challenge[]) => void) {
  const [formState, setFormState] = useState<ChallengeFormState>(DEFAULT_FORM_STATE)
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)

  const handleYoutubeUrlChange = async (url: string) => {
    setFormState({ ...formState, youtubeUrl: url })

    if (!url.trim()) return

    try {
      setFormLoading(true)
      setFormError(null)

      const videoData = await extractVideoFromUrl(url)

      if (!videoData) {
        setFormError("Could not extract video information from the provided URL")
        return
      }

      setFormState({
        ...formState,
        youtubeUrl: url,
        title: videoData.title,
        description: videoData.description,
        duration: videoData.duration,
        videoId: videoData.id,
        thumbnailUrl: videoData.thumbnailUrl,
        videoUrl: videoData.videoUrl,
        embedUrl: videoData.embedUrl,
        topics: Array.isArray(videoData.topics) ? videoData.topics : [],
      })
    } catch (error) {
      console.error("Error extracting video data:", error)
      setFormError("Failed to extract video data. Please check the URL and try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const createChallenge = () => {
    try {
      if (!formState.title.trim() || !formState.videoUrl.trim()) {
        setFormError("Title and video URL are required")
        return false
      }

      const newChallenge: Challenge = {
        id: Math.random().toString(),
        title: formState.title,
        description: formState.description,
        thumbnailUrl: formState.thumbnailUrl,
        videoUrl: formState.videoUrl,
        embedUrl: formState.embedUrl,
        duration: formState.duration,
        difficulty: formState.difficulty as Challenge['difficulty'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: false,
        category: "general",
        topics: formState.topics,
        featured: formState.featured,
        author: "Admin",
        viewCount: 0,
        likeCount: 0,
        completionCount: 0,
      }

      const updatedChallenges = [newChallenge, ...challenges]
      setChallenges(updatedChallenges)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChallenges))

      const savedChallenges = localStorage.getItem("userChallenges")
      let userChallenges = savedChallenges ? JSON.parse(savedChallenges) : []
      userChallenges = [newChallenge, ...userChallenges]
      localStorage.setItem("userChallenges", JSON.stringify(userChallenges))

      toast({
        title: "Challenge created",
        description: "New challenge has been created successfully",
      })

      return true
    } catch (error) {
      console.error("Error creating challenge:", error)
      setFormError("Failed to create challenge. Please try again.")
      return false
    }
  }

  const updateChallenge = () => {
    try {
      if (!currentChallenge) return false
      if (!formState.title.trim()) {
        setFormError("Title is required")
        return false
      }

      const updatedChallenge: Challenge = {
        ...currentChallenge,
        title: formState.title,
        description: formState.description,
        difficulty: formState.difficulty as Challenge['difficulty'],
        topics: Array.isArray(formState.topics) ? formState.topics : [],
        featured: formState.featured,
      }

      const updatedChallenges = challenges.map((challenge) =>
        challenge.id === updatedChallenge.id ? updatedChallenge : challenge,
      )
      setChallenges(updatedChallenges)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChallenges))

      const savedChallenges = localStorage.getItem("userChallenges")
      if (savedChallenges) {
        let userChallenges = JSON.parse(savedChallenges)
        userChallenges = userChallenges.map((challenge: Challenge) =>
          challenge.id === updatedChallenge.id ? updatedChallenge : challenge,
        )
        localStorage.setItem("userChallenges", JSON.stringify(userChallenges))
      }

      toast({
        title: "Challenge updated",
        description: "Challenge has been updated successfully",
      })

      return true
    } catch (error) {
      console.error("Error updating challenge:", error)
      setFormError("Failed to update challenge. Please try again.")
      return false
    }
  }

  const deleteChallenge = (challengeToDelete: Challenge) => {
    try {
      const updatedChallenges = challenges.filter((challenge) => challenge.id !== challengeToDelete.id)
      setChallenges(updatedChallenges)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChallenges))

      const savedChallenges = localStorage.getItem("userChallenges")
      if (savedChallenges) {
        let userChallenges = JSON.parse(savedChallenges)
        userChallenges = userChallenges.filter((challenge: Challenge) => challenge.id !== challengeToDelete.id)
        localStorage.setItem("userChallenges", JSON.stringify(userChallenges))
      }

      toast({
        title: "Challenge deleted",
        description: "Challenge has been deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting challenge:", error)
      toast({
        title: "Error",
        description: "Failed to delete challenge",
        variant: "destructive",
      })
      return false
    }
  }

  const resetForm = () => {
    setFormState(DEFAULT_FORM_STATE)
    setFormError(null)
    setCurrentChallenge(null)
  }

  const prepareEditForm = (challenge: Challenge) => {
    setCurrentChallenge(challenge)
    setFormState({
      youtubeUrl: "",
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      duration: challenge.duration || 0,
      videoId: challenge.id,
      thumbnailUrl: challenge.thumbnailUrl || "",
      videoUrl: challenge.videoUrl || "",
      embedUrl: challenge.embedUrl || "",
      topics: challenge.topics || [],
      featured: challenge.featured || false,
    })
    setFormError(null)
  }

  return {
    formState,
    setFormState,
    formError,
    setFormError,
    formLoading,
    currentChallenge,
    setCurrentChallenge,
    handleYoutubeUrlChange,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    resetForm,
    prepareEditForm,
  }
}
