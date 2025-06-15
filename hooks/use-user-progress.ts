"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

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
}

export function useUserProgress() {
  const { user } = useAuth()
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

        const finalProgressData = {
          videosCompleted: videoSubmissions,
          totalVideos: totalVideoChallenges,
          writingsSubmitted: writingSubmissions,
          totalWritings: totalWritingChallenges,
          speakingPractice: speakingSubmissions,
          totalSpeaking: totalSpeakingChallenges,
          level: userData?.level || 1,
          totalPoints: userData?.points || 0,
          streakDays: userData?.streak_days || 0,
          completedChallenges: totalProgressCompleted,
          totalChallenges: Math.max(totalProgressAvailable, 20),
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

  return {
    progressData,
    loading,
    error,
    refetch: () => {
      if (user?.id) {
        setLoading(true)
        // Re-run the effect
        const timer = setTimeout(() => {
          // The useEffect will re-run due to dependency change
        }, 0)
        return () => clearTimeout(timer)
      }
    }
  }
}
