"use client"

import { useState, useEffect } from "react"
import { dbHelpers } from "@/lib/supabase"

export function useLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLeaderboardLoading(true)
        const result = await dbHelpers.getLeaderboard()
        const data = result.data || []
        setLeaderboardData(data)
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      } finally {
        setLeaderboardLoading(false)
      }
    }

    loadLeaderboard()
  }, [])

  return {
    leaderboardData,
    leaderboardLoading,
    setLeaderboardData,
  }
}
