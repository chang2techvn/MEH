"use client"

import { useState, useEffect } from "react"
import { dbHelpers } from "@/lib/supabase"

interface LeaderboardUser {
  id: string
  name: string
  avatar?: string
  rank: number
  points: number
  level: string
  streak: number
}

export function useLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // Set loading to false immediately to show skeleton
        setLeaderboardLoading(false)
        
        // Load data in background
        dbHelpers.getLeaderboard()
          .then(result => {
            const rawData = result.data || []
            
            // Transform data to match LeaderboardUser interface
            const transformedData: LeaderboardUser[] = rawData.map((user: any, index: number) => ({
              id: user.id,
              name: user.profiles?.full_name || 'Unknown User',
              avatar: user.profiles?.avatar_url,
              rank: index + 1, // Assign rank based on order
              points: user.points || 0,
              level: user.level || 'Beginner',
              streak: user.streak_days || 0
            }))
            
            setLeaderboardData(transformedData)
          })
          .catch(error => {
            console.error('❌ Error loading leaderboard:', error)
            setLeaderboardData([]) // Set empty array on error
          })
      } catch (error) {
        console.error('❌ Error in loadLeaderboard:', error)
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
