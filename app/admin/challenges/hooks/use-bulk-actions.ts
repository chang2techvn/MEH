"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { getDifficultyDisplayName } from "@/app/utils/challenge-classifier"
import type { Challenge } from "@/app/actions/challenge-videos"
import { STORAGE_KEY } from "../constants"

export function useBulkActions(
  challenges: Challenge[],
  setChallenges: (challenges: Challenge[]) => void,
  filteredChallenges: Challenge[],
) {
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])
  const [bulkActionOpen, setBulkActionOpen] = useState(false)

  const toggleChallengeSelection = (id: string) => {
    setSelectedChallenges((prev) => {
      const prevArray = Array.isArray(prev) ? prev : []
      return prevArray.includes(id) ? prevArray.filter((cid) => cid !== id) : [...prevArray, id]
    })
  }

  const toggleSelectAll = () => {
    if (!Array.isArray(filteredChallenges)) {
      setSelectedChallenges([])
      return
    }

    if (Array.isArray(selectedChallenges) && selectedChallenges.length === filteredChallenges.length) {
      setSelectedChallenges([])
    } else {
      setSelectedChallenges(filteredChallenges.map((c) => c.id))
    }
  }

  const handleBulkDelete = () => {
    try {
      if (selectedChallenges.length === 0) return

      const updatedChallenges = challenges.filter((challenge) => !selectedChallenges.includes(challenge.id))
      setChallenges(updatedChallenges)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChallenges))

      const userChallengesJson = localStorage.getItem("userChallenges")
      if (userChallengesJson) {
        const userChallenges = JSON.parse(userChallengesJson)
        const updatedUserChallenges = userChallenges.filter(
          (challenge: Challenge) => !selectedChallenges.includes(challenge.id),
        )
        localStorage.setItem("userChallenges", JSON.stringify(updatedUserChallenges))
      }

      setSelectedChallenges([])
      setBulkActionOpen(false)

      toast({
        title: "Challenges deleted",
        description: `${selectedChallenges.length} challenges have been deleted`,
      })
    } catch (error) {
      console.error("Error performing bulk delete:", error)
      toast({
        title: "Error",
        description: "Failed to delete challenges",
        variant: "destructive",
      })
    }
  }

  const handleBulkChangeDifficulty = (difficulty: string) => {
    try {
      if (selectedChallenges.length === 0) return

      const updatedChallenges = challenges.map((challenge) => {
        if (selectedChallenges.includes(challenge.id)) {
          return { ...challenge, difficulty: difficulty as Challenge['difficulty'] }
        }
        return challenge
      })
      setChallenges(updatedChallenges as Challenge[])

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChallenges))

      const userChallengesJson = localStorage.getItem("userChallenges")
      if (userChallengesJson) {
        const userChallenges = JSON.parse(userChallengesJson)
        const updatedUserChallenges = userChallenges.map((challenge: Challenge) => {
          if (selectedChallenges.includes(challenge.id)) {
            return { ...challenge, difficulty }
          }
          return challenge
        })
        localStorage.setItem("userChallenges", JSON.stringify(updatedUserChallenges))
      }

      setSelectedChallenges([])
      setBulkActionOpen(false)

      toast({
        title: "Difficulty updated",
        description: `${selectedChallenges.length} challenges have been updated to ${getDifficultyDisplayName(difficulty)}`,
      })
    } catch (error) {
      console.error("Error performing bulk difficulty change:", error)
      toast({
        title: "Error",
        description: "Failed to update challenges",
        variant: "destructive",
      })
    }
  }

  const clearSelection = () => {
    setSelectedChallenges([])
  }

  return {
    selectedChallenges,
    bulkActionOpen,
    setBulkActionOpen,
    toggleChallengeSelection,
    toggleSelectAll,
    handleBulkDelete,
    handleBulkChangeDifficulty,
    clearSelection,
  }
}
