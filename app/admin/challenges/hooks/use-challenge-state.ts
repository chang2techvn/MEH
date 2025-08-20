"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import { fetchAllChallenges, fetchPracticeChallenges, type Challenge } from "@/app/actions/challenge-videos"
import { STORAGE_KEY } from "../constants"
import type { ChallengeFilters } from "../types"

export function useChallengeState() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadChallenges = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)

      const today = new Date().toISOString().split("T")[0]
      const lastRefreshDate = localStorage.getItem("lastChallengeRefresh")
      const cachedChallenges = localStorage.getItem(STORAGE_KEY)

      if (cachedChallenges && lastRefreshDate === today && !forceRefresh) {
        try {
          const parsedChallenges = JSON.parse(cachedChallenges)
          const safeChallenges = Array.isArray(parsedChallenges) ? parsedChallenges : []
          setChallenges(safeChallenges)
          setFilteredChallenges(safeChallenges)
          setLastRefreshed(lastRefreshDate)
          setLoading(false)
          return
        } catch (parseError) {
          console.error("Error parsing cached challenges:", parseError)
          // Continue to fetch fresh data
        }
      }

      const allChallenges = await fetchAllChallenges()
      const practiceChallenges = await fetchPracticeChallenges()
      
      const userChallengesJson = localStorage.getItem("userChallenges")
      let userChallenges: Challenge[] = []

      if (userChallengesJson) {
        try {
          const parsed = JSON.parse(userChallengesJson)
          userChallenges = Array.isArray(parsed) ? parsed : []
        } catch (parseError) {
          console.error("Error parsing user challenges:", parseError)
        }
      }

      const combinedChallenges = [
        ...(Array.isArray(userChallenges) ? userChallenges : []),
        ...(Array.isArray(allChallenges) ? allChallenges : []),
        ...(Array.isArray(practiceChallenges) ? practiceChallenges : []),
      ]

      localStorage.setItem(STORAGE_KEY, JSON.stringify(combinedChallenges))
      localStorage.setItem("lastChallengeRefresh", today)

      setChallenges(combinedChallenges)
      setFilteredChallenges(combinedChallenges)
      setLastRefreshed(today)

      if (forceRefresh) {
        toast({
          title: "Challenges Refreshed",
          description: "The challenge list has been updated with fresh content",
        })
      }
    } catch (error) {
      console.error("Error loading challenges:", error)
      toast({
        title: "Error",
        description: "Failed to load challenges. Please try again.",
        variant: "destructive",
      })

      const cachedChallenges = localStorage.getItem(STORAGE_KEY)
      if (cachedChallenges) {
        try {
          const parsedChallenges = JSON.parse(cachedChallenges)
          const safeChallenges = Array.isArray(parsedChallenges) ? parsedChallenges : []
          setChallenges(safeChallenges)
          setFilteredChallenges(safeChallenges)
          toast({
            title: "Using cached data",
            description: "Showing previously loaded challenges",
          })
        } catch (parseError) {
          console.error("Error parsing cached challenges:", parseError)
          // Set empty arrays as fallback
          setChallenges([])
          setFilteredChallenges([])
        }
      } else {
        // No cached data, set empty arrays
        setChallenges([])
        setFilteredChallenges([])
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const refreshChallenges = async () => {
    try {
      setRefreshing(true)
      await loadChallenges(true)
    } catch (error) {
      console.error("Error refreshing challenges:", error)
      toast({
        title: "Error",
        description: "Failed to refresh challenges",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const filterChallenges = useCallback(
    (filters: ChallengeFilters) => {
      let filtered = Array.isArray(challenges) ? [...challenges] : []

      // Always filter to only show practice challenges
      filtered = filtered.filter((challenge) => challenge.challenge_type === 'practice')

      if (filters.activeTab !== "all") {
        filtered = filtered.filter((challenge) => challenge.difficulty === filters.activeTab)
      }

      if (filters.searchTerm) {
        filtered = filtered.filter(
          (challenge) =>
            challenge.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            challenge.description.toLowerCase().includes(filters.searchTerm.toLowerCase()),
        )
      }

      if (filters.selectedTopics.length > 0) {
        filtered = filtered.filter((challenge) => {
          if (!challenge.topics) return false
          return challenge.topics.some((topic) => filters.selectedTopics.includes(topic))
        })
      }

      if (filters.sortOrder === "newest") {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } else if (filters.sortOrder === "oldest") {
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      } else if (filters.sortOrder === "title") {
        filtered.sort((a, b) => a.title.localeCompare(b.title))
      } else if (filters.sortOrder === "duration") {
        filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0))
      }

      setFilteredChallenges(filtered)
    },
    [challenges],
  )

  useEffect(() => {
    loadChallenges()

    if (autoRefresh) {
      const checkRefreshInterval = setInterval(() => {
        const lastRefreshDate = localStorage.getItem("lastChallengeRefresh")
        const today = new Date().toISOString().split("T")[0]

        if (lastRefreshDate !== today) {
          loadChallenges(true)
        }
      }, 60000)

      return () => clearInterval(checkRefreshInterval)
    }
  }, [autoRefresh, loadChallenges])

  return {
    challenges,
    setChallenges,
    filteredChallenges,
    loading,
    refreshing,
    lastRefreshed,
    autoRefresh,
    setAutoRefresh,
    loadChallenges,
    refreshChallenges,
    filterChallenges,
  }
}
