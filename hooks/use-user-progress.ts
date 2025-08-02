"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthState } from '@/contexts/auth-context'
import { calculateDailyStreak, type DailyStreakData } from '@/lib/daily-streak-utils'

// Helper function to get Monday of current week
function getCurrentWeekStart(): string {
  const today = new Date()
  const currentWeekStart = new Date(today)
  const dayOfWeek = today.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
  // Calculate days to subtract to get Monday (day 1)
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // If Sunday, go back 6 days; otherwise go back (dayOfWeek - 1) days
  currentWeekStart.setDate(today.getDate() - daysToSubtract)
  
  // Format date without timezone issues
  const year = currentWeekStart.getFullYear()
  const month = String(currentWeekStart.getMonth() + 1).padStart(2, '0')
  const day = String(currentWeekStart.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper function to calculate challenges needed for current level
function getChallengesForLevel(level: number): number {
  // Level 1: 7 challenges, Level 2: 8 challenges, Level 3: 9 challenges, etc.
  return 6 + level
}

// Helper function to calculate what level user should be based on completed challenges
function calculateLevelFromChallenges(completedChallenges: number): number {
  if (completedChallenges === 0) return 1
  
  let currentLevel = 1
  let totalChallengesUsed = 0
  
  while (true) {
    const challengesForThisLevel = getChallengesForLevel(currentLevel)
    if (totalChallengesUsed + challengesForThisLevel <= completedChallenges) {
      totalChallengesUsed += challengesForThisLevel
      currentLevel++
    } else {
      break
    }
  }
  
  return currentLevel
}

// Helper function to get completed challenges for current level
function getChallengesCompletedInCurrentLevel(completedChallenges: number, currentLevel: number): number {
  let totalPreviousLevelChallenges = 0
  
  for (let level = 1; level < currentLevel; level++) {
    totalPreviousLevelChallenges += getChallengesForLevel(level)
  }
  
  // Ensure we don't return negative numbers
  const challengesInCurrentLevel = completedChallenges - totalPreviousLevelChallenges
  return Math.max(0, challengesInCurrentLevel)
}

interface UserProgressData {
  videosCompleted: number
  totalVideos: number
  writingsSubmitted: number
  totalWritings: number
  speakingPractice: number
  totalSpeaking: number
  level: number
  totalPoints: number
  streakDays: number
  completedChallenges: number
  totalChallenges: number
  // New fields for weekly and latest post tracking
  weeklyPoints: number
  latestPostPoints: number
  latestPostDate: string | null
  // Daily streak data
  dailyStreakData: DailyStreakData
  // Level progress percentage
  levelProgress: number
}

// Shared function to fetch user progress data
async function fetchUserProgressData(userId: string) {
  // Get pre-calculated stats from profiles table (same as profile page)
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError && profileError.code !== 'PGRST116') {
    throw profileError
  }

  // Use pre-calculated stats from auto stats system
  const totalPoints = profileData?.experience_points || 0
  const currentLevel = profileData?.level || 1
  const completedChallenges = profileData?.completed_challenges || 0
  const streakDays = profileData?.streak_days || 0
  
  // Calculate challenges needed for current level (for progress bar)
  const currentLevelChallengesNeeded = getChallengesForLevel(currentLevel)
  const challengesInCurrentLevel = getChallengesCompletedInCurrentLevel(completedChallenges, currentLevel)

  // Calculate Daily Streak based on posts with "Daily" title
  const dailyStreakData = await calculateDailyStreak(userId)

  // Calculate level progress percentage
  const levelProgress = Math.min(
    Math.round((challengesInCurrentLevel / currentLevelChallengesNeeded) * 100),
    100
  )

  // Get weekly points for current week
  const weekStartDate = getCurrentWeekStart()
  const { data: weeklyData, error: weeklyError } = await supabase
    .from('weekly_points')
    .select('total_points, latest_post_points, latest_post_date')
    .eq('user_id', userId)
    .eq('week_start_date', weekStartDate)
    .single()

  // Get latest post overall (not just this week) for "Latest Post" display
  const { data: latestPostData, error: latestPostError } = await supabase
    .from('posts')
    .select('score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Determine latest post points (from overall latest post, not just weekly)
  const overallLatestPostPoints = latestPostData?.score ?? 0 // Use 0 for null/undefined scores, not 10

  // For challenge type counts, use simplified approach or mock data
  // Since we now focus on overall stats, these specific breakdowns are less critical
  const estimatedVideoSubmissions = Math.floor(completedChallenges * 0.3) // 30% videos
  const estimatedWritingSubmissions = Math.floor(completedChallenges * 0.4) // 40% writing  
  const estimatedSpeakingSubmissions = Math.floor(completedChallenges * 0.3) // 30% speaking

  return {
    videosCompleted: estimatedVideoSubmissions,
    totalVideos: 20, // Default total
    writingsSubmitted: estimatedWritingSubmissions,
    totalWritings: 20, // Default total
    speakingPractice: estimatedSpeakingSubmissions,
    totalSpeaking: 20, // Default total
    level: currentLevel,
    totalPoints: totalPoints,
    streakDays: streakDays, // Use streak from profiles table instead of daily calculation
    completedChallenges: challengesInCurrentLevel,
    totalChallenges: currentLevelChallengesNeeded,
    weeklyPoints: weeklyData?.total_points || 0,
    latestPostPoints: overallLatestPostPoints,
    latestPostDate: latestPostData?.created_at || null,
    dailyStreakData: dailyStreakData,
    levelProgress: levelProgress,
  }
}

export function useUserProgress() {
  const { user } = useAuthState()
  const [progressData, setProgressData] = useState<UserProgressData>({
    videosCompleted: 0,
    totalVideos: 0,
    writingsSubmitted: 0,
    totalWritings: 0,
    speakingPractice: 0,
    totalSpeaking: 0,
    level: 1,
    totalPoints: 0,
    streakDays: 0,
    completedChallenges: 0,
    totalChallenges: 0,
    weeklyPoints: 0,
    latestPostPoints: 0,
    latestPostDate: null,
    dailyStreakData: {
      currentStreak: 0,
      weeklyActivity: []
    },
    levelProgress: 0, // Add initial levelProgress value
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserProgress() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching user progress for user:', user.id)
        const progressData = await fetchUserProgressData(user.id)
        console.log('Final progress data:', progressData)
        setProgressData(progressData)

      } catch (err) {
        console.error('Error fetching user progress:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch progress data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProgress()
  }, [user?.id])

  const refetch = useCallback(async () => {
    if (user?.id) {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Refetching user progress for user:', user.id)
        const progressData = await fetchUserProgressData(user.id)
        console.log('Refetched progress data:', progressData)
        setProgressData(progressData)

      } catch (err) {
        console.error('Error refetching user progress:', err)
        setError(err instanceof Error ? err.message : 'Failed to refetch progress data')
      } finally {
        setLoading(false)
      }
    }
  }, [user?.id])

  return {
    progressData,
    loading,
    error,
    refetch
  }
}
