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
        setLeaderboardLoading(true)
        const result = await dbHelpers.getLeaderboard()
        const rawData = result.data || []
        console.log('📊 Raw leaderboard data loaded:', rawData) // Debug log
        
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
        
        console.log('📊 Transformed leaderboard data:', transformedData) // Debug log
        setLeaderboardData(transformedData)
      } catch (error) {
        console.error('❌ Error loading leaderboard:', error)
        setLeaderboardData([]) // Set empty array on error
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
