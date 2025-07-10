"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthState } from '@/contexts/auth-context'

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

// Helper function to check if user should level up
function shouldLevelUp(completedChallenges: number, currentLevel: number): boolean {
  // Calculate total challenges needed up to current level
  let totalChallengesNeeded = 0
  for (let level = 1; level <= currentLevel; level++) {
    totalChallengesNeeded += getChallengesForLevel(level)
  }
  return completedChallenges >= totalChallengesNeeded
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
  
  return completedChallenges - totalPreviousLevelChallenges
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

        // Get user data (level, points, streak)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('level, points, streak_days')
          .eq('id', user.id)
          .single()

        console.log('User data:', userData, 'Error:', userError)

        if (userError && userError.code !== 'PGRST116') {
          throw userError
        }

        // Get user progress data
        const { data: userProgress, error: progressError } = await supabase
          .from('user_progress')
          .select('completed_challenges, total_challenges, progress_percentage')
          .eq('user_id', user.id)

        console.log('User progress:', userProgress, 'Error:', progressError)

        if (progressError && progressError.code !== 'PGRST116') {
          throw progressError
        }

        // Get challenge submissions to count different types
        const { data: submissions, error: submissionsError } = await supabase
          .from('challenge_submissions')
          .select(`
            challenge_id,
            challenges(challenge_type)
          `)
          .eq('user_id', user.id)
          .eq('is_correct', true)

        console.log('Submissions:', submissions, 'Error:', submissionsError)

        if (submissionsError && submissionsError.code !== 'PGRST116') {
          throw submissionsError
        }        // Count submissions by challenge_type
        const videoSubmissions = submissions?.filter((s: any) => 
          s.challenges?.challenge_type === 'video' || s.challenges?.challenge_type === 'speaking'
        ).length || 0
        
        const writingSubmissions = submissions?.filter((s: any) => 
          s.challenges?.challenge_type === 'writing' || s.challenges?.challenge_type === 'text'
        ).length || 0

        const speakingSubmissions = submissions?.filter((s: any) => 
          s.challenges?.challenge_type === 'speaking' || s.challenges?.challenge_type === 'pronunciation'
        ).length || 0        // Get total available challenges by challenge_type
        const { data: allChallenges, error: challengesError } = await supabase
          .from('challenges')
          .select('challenge_type')

        console.log('All challenges:', allChallenges, 'Error:', challengesError)

        if (challengesError && challengesError.code !== 'PGRST116') {
          throw challengesError
        }        const totalVideoChallenges = allChallenges?.filter(c => 
          c.challenge_type === 'video' || c.challenge_type === 'speaking'
        ).length || 20

        const totalWritingChallenges = allChallenges?.filter(c => 
          c.challenge_type === 'writing' || c.challenge_type === 'text'
        ).length || 20

        const totalSpeakingChallenges = allChallenges?.filter(c => 
          c.challenge_type === 'speaking' || c.challenge_type === 'pronunciation'
        ).length || 20

        // Calculate totals from user_progress
        const totalProgressCompleted = userProgress?.reduce((sum: number, p: any) => sum + (p.completed_challenges || 0), 0) || 0
        const totalProgressAvailable = userProgress?.reduce((sum: number, p: any) => sum + (p.total_challenges || 0), 0) || 0

        // Get weekly points for current week
        const weekStartDate = getCurrentWeekStart()
        console.log('Fetching weekly data for week start:', weekStartDate)
        
        const { data: weeklyData, error: weeklyError } = await supabase
          .from('weekly_points')
          .select('total_points, latest_post_points, latest_post_date')
          .eq('user_id', user.id)
          .eq('week_start_date', weekStartDate)
          .single()

        console.log('Weekly data:', weeklyData, 'Error:', weeklyError)

        const currentLevel = userData?.level || 1
        const totalChallengesNeeded = getChallengesForLevel(currentLevel)
        
        // Count total completed challenges (posts with scores)
        const { data: completedPosts, error: postsError } = await supabase
          .from('posts')
          .select('id')
          .eq('user_id', user.id)
          .not('score', 'is', null)
          .gte('score', 70) // Only count posts with score >= 70 as completed

        const completedChallenges = completedPosts?.length || 0
        
        // Check if user should level up
        let newLevel = currentLevel
        if (shouldLevelUp(completedChallenges, currentLevel)) {
          newLevel = currentLevel + 1
          
          // Update user level in database
          const { error: levelError } = await supabase
            .from('users')
            .update({ 
              level: newLevel,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            
          if (levelError) {
            console.error('Error updating user level:', levelError)
          } else {
            console.log(`🎉 User leveled up to Level ${newLevel}!`)
          }
        }

        // Calculate challenges completed in current level
        const currentLevelChallengesNeeded = getChallengesForLevel(newLevel)
        const challengesInCurrentLevel = getChallengesCompletedInCurrentLevel(completedChallenges, newLevel)

        const finalProgressData = {
          videosCompleted: videoSubmissions,
          totalVideos: totalVideoChallenges,
          writingsSubmitted: writingSubmissions,
          totalWritings: totalWritingChallenges,
          speakingPractice: speakingSubmissions,
          totalSpeaking: totalSpeakingChallenges,
          level: newLevel,
          totalPoints: userData?.points || 0,
          streakDays: userData?.streak_days || 0,
          completedChallenges: challengesInCurrentLevel,
          totalChallenges: currentLevelChallengesNeeded,
          weeklyPoints: weeklyData?.total_points || 0,
          latestPostPoints: weeklyData?.latest_post_points || 0,
          latestPostDate: weeklyData?.latest_post_date || null,
        }

        console.log('Final progress data:', finalProgressData)
        setProgressData(finalProgressData)

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

        // Get user data (level, points, streak)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('level, points, streak_days')
          .eq('id', user.id)
          .single()

        if (userError && userError.code !== 'PGRST116') {
          throw userError
        }

        // Get user progress data
        const { data: userProgress, error: progressError } = await supabase
          .from('user_progress')
          .select('completed_challenges, total_challenges, progress_percentage')
          .eq('user_id', user.id)

        if (progressError && progressError.code !== 'PGRST116') {
          throw progressError
        }

        // Get challenge submissions to count different types
        const { data: submissions, error: submissionsError } = await supabase
          .from('challenge_submissions')
          .select(`
            challenge_id,
            challenges(challenge_type)
          `)
          .eq('user_id', user.id)
          .eq('is_correct', true)

        if (submissionsError && submissionsError.code !== 'PGRST116') {
          throw submissionsError
        }

        // Count submissions by challenge_type
        const videoSubmissions = submissions?.filter((s: any) => 
          s.challenges?.challenge_type === 'video' || s.challenges?.challenge_type === 'speaking'
        ).length || 0
        
        const writingSubmissions = submissions?.filter((s: any) => 
          s.challenges?.challenge_type === 'writing' || s.challenges?.challenge_type === 'text'
        ).length || 0

        const speakingSubmissions = submissions?.filter((s: any) => 
          s.challenges?.challenge_type === 'speaking' || s.challenges?.challenge_type === 'pronunciation'
        ).length || 0

        // Get total available challenges by challenge_type
        const { data: allChallenges, error: challengesError } = await supabase
          .from('challenges')
          .select('challenge_type')

        if (challengesError && challengesError.code !== 'PGRST116') {
          throw challengesError
        }

        const totalVideoChallenges = allChallenges?.filter(c => 
          c.challenge_type === 'video' || c.challenge_type === 'speaking'
        ).length || 20

        const totalWritingChallenges = allChallenges?.filter(c => 
          c.challenge_type === 'writing' || c.challenge_type === 'text'
        ).length || 20

        const totalSpeakingChallenges = allChallenges?.filter(c => 
          c.challenge_type === 'speaking' || c.challenge_type === 'pronunciation'
        ).length || 20

        // Calculate totals from user_progress
        const totalProgressCompleted = userProgress?.reduce((sum: number, p: any) => sum + (p.completed_challenges || 0), 0) || 0
        const totalProgressAvailable = userProgress?.reduce((sum: number, p: any) => sum + (p.total_challenges || 0), 0) || 0

        // Get weekly points for current week
        const weekStartDate = getCurrentWeekStart()
        console.log('Refetching weekly data for week start:', weekStartDate)
        
        const { data: weeklyData, error: weeklyError } = await supabase
          .from('weekly_points')
          .select('total_points, latest_post_points, latest_post_date')
          .eq('user_id', user.id)
          .eq('week_start_date', weekStartDate)
          .single()

        console.log('Refetched weekly data:', weeklyData, 'Error:', weeklyError)

        const currentLevel = userData?.level || 1
        const totalChallengesNeeded = getChallengesForLevel(currentLevel)
        
        // Count total completed challenges (posts with scores)
        const { data: completedPosts, error: postsError } = await supabase
          .from('posts')
          .select('id')
          .eq('user_id', user.id)
          .not('score', 'is', null)
          .gte('score', 70) // Only count posts with score >= 70 as completed

        const completedChallenges = completedPosts?.length || 0
        
        // Check if user should level up
        let newLevel = currentLevel
        if (shouldLevelUp(completedChallenges, currentLevel)) {
          newLevel = currentLevel + 1
          
          // Update user level in database
          const { error: levelError } = await supabase
            .from('users')
            .update({ 
              level: newLevel,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            
          if (levelError) {
            console.error('Error updating user level:', levelError)
          } else {
            console.log(`🎉 User leveled up to Level ${newLevel}!`)
          }
        }

        // Calculate challenges completed in current level
        const currentLevelChallengesNeeded = getChallengesForLevel(newLevel)
        const challengesInCurrentLevel = getChallengesCompletedInCurrentLevel(completedChallenges, newLevel)

        const finalProgressData = {
          videosCompleted: videoSubmissions,
          totalVideos: totalVideoChallenges,
          writingsSubmitted: writingSubmissions,
          totalWritings: totalWritingChallenges,
          speakingPractice: speakingSubmissions,
          totalSpeaking: totalSpeakingChallenges,
          level: newLevel,
          totalPoints: userData?.points || 0,
          streakDays: userData?.streak_days || 0,
          completedChallenges: challengesInCurrentLevel,
          totalChallenges: currentLevelChallengesNeeded,
          weeklyPoints: weeklyData?.total_points || 0,
          latestPostPoints: weeklyData?.latest_post_points || 0,
          latestPostDate: weeklyData?.latest_post_date || null,
        }

        console.log('Refetched progress data:', finalProgressData)
        setProgressData(finalProgressData)

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
