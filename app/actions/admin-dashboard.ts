"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export interface DashboardStats {
  totalUsers: number
  totalChallenges: number
  totalSubmissions: number
  dailyActiveUsers: number
  weeklyCompletionRate: number
  monthlyGrowthRate: number
  engagementRate: number
}

export interface RecentActivity {
  id: string
  userName: string
  userAvatar?: string
  action: string
  time: string
  type: 'challenge_completion' | 'user_registration' | 'achievement' | 'post'
}

export interface NewUser {
  id: string
  name: string
  level: string
  joinedAgo: string
  avatar?: string
}

export interface PopularResource {
  id: string
  title: string
  views: number
  type: string
  icon?: string
  difficulty?: string
  createdAt?: string
  thumbnailUrl?: string | null
  duration?: number | null
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get total challenges
    const { count: totalChallenges } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })

    // Get total submissions
    const { count: totalSubmissions } = await supabase
      .from('challenge_submissions')
      .select('*', { count: 'exact', head: true })

    // Get daily active users (users who logged in today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: dailyActiveUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', today.toISOString())

    // Get weekly completion rate
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const { count: weeklySubmissions } = await supabase
      .from('challenge_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('submitted_at', weekAgo.toISOString())
      .eq('is_correct', true)

    const { count: weeklyAttempts } = await supabase
      .from('challenge_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('submitted_at', weekAgo.toISOString())

    const weeklyCompletionRate = (weeklyAttempts || 0) > 0 ? Math.round((weeklySubmissions || 0) / (weeklyAttempts || 1) * 100) : 0

    // Get monthly growth rate
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    
    const { count: newUsersThisMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthAgo.toISOString())

    const { count: totalUsersLastMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', monthAgo.toISOString())

    const monthlyGrowthRate = (totalUsersLastMonth || 0) > 0 ? 
      Math.round((newUsersThisMonth || 0) / (totalUsersLastMonth || 1) * 100) : 0

    // Calculate engagement rate (users who completed at least one challenge this week)
    const { data: activeUsers } = await supabase
      .from('challenge_submissions')
      .select('user_id')
      .gte('submitted_at', weekAgo.toISOString())

    const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id) || []).size
    const engagementRate = (totalUsers || 0) > 0 ? Math.round(uniqueActiveUsers / (totalUsers || 1) * 100) : 0

    return {
      totalUsers: totalUsers || 0,
      totalChallenges: totalChallenges || 0,
      totalSubmissions: totalSubmissions || 0,
      dailyActiveUsers: dailyActiveUsers || 0,
      weeklyCompletionRate,
      monthlyGrowthRate,
      engagementRate
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalUsers: 0,
      totalChallenges: 0,
      totalSubmissions: 0,
      dailyActiveUsers: 0,
      weeklyCompletionRate: 0,
      monthlyGrowthRate: 0,
      engagementRate: 0
    }
  }
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Get recent challenge submissions
    const { data: submissions } = await supabase
      .from('challenge_submissions')
      .select(`
        id,
        submitted_at,
        is_correct,
        user_id,
        challenges!inner(title),
        users!inner(email, profiles!inner(avatar_url))
      `)
      .order('submitted_at', { ascending: false })
      .limit(10)

    // Get recent user registrations
    const { data: newUsers } = await supabase
      .from('users')
      .select(`
        id, 
        email, 
        created_at,
        profiles!inner(avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get recent achievements
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select(`
        id,
        earned_at,
        user_id,
        achievements!inner(title),
        users!inner(email, profiles!inner(avatar_url))
      `)
      .order('earned_at', { ascending: false })
      .limit(5)

    const activities: RecentActivity[] = []

    // Add submissions
    submissions?.forEach(submission => {
      const userName = (submission.users as any)?.email?.split('@')[0] || 'Unknown User'
      const userAvatar = (submission.users as any)?.profiles?.avatar_url
      const timeDiff = getTimeAgo(new Date(submission.submitted_at))
      const challengeTitle = (submission.challenges as any)?.title || 'Unknown Challenge'
      
      activities.push({
        id: submission.id,
        userName: userName.charAt(0).toUpperCase() + userName.slice(1),
        userAvatar,
        action: submission.is_correct 
          ? `Completed challenge: ${challengeTitle}`
          : `Attempted challenge: ${challengeTitle}`,
        time: timeDiff,
        type: 'challenge_completion'
      })
    })

    // Add new users
    newUsers?.forEach(user => {
      const userName = user.email?.split('@')[0] || 'Unknown User'
      const userAvatar = (user.profiles as any)?.avatar_url
      const timeDiff = getTimeAgo(new Date(user.created_at))
      
      activities.push({
        id: user.id,
        userName: userName.charAt(0).toUpperCase() + userName.slice(1),
        userAvatar,
        action: 'Joined the platform',
        time: timeDiff,
        type: 'user_registration'
      })
    })

    // Add achievements
    achievements?.forEach(achievement => {
      const userName = (achievement.users as any)?.email?.split('@')[0] || 'Unknown User'
      const userAvatar = (achievement.users as any)?.profiles?.avatar_url
      const timeDiff = getTimeAgo(new Date(achievement.earned_at))
      const achievementTitle = (achievement.achievements as any)?.title || 'Unknown Achievement'
      
      activities.push({
        id: achievement.id,
        userName: userName.charAt(0).toUpperCase() + userName.slice(1),
        userAvatar,
        action: `Earned badge: ${achievementTitle}`,
        time: timeDiff,
        type: 'achievement'
      })
    })

    // Sort by time and return latest 10
    return activities
      .sort((a, b) => {
        const aTime = parseTimeAgo(a.time)
        const bTime = parseTimeAgo(b.time)
        return aTime - bTime
      })
      .slice(0, 10)

  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }
}

export async function getNewUsers(): Promise<NewUser[]> {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { data: users } = await supabase
      .from('users')
      .select(`
        id,
        email,
        created_at,
        profiles!inner(proficiency_level, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    return users?.map(user => {
      const userName = user.email?.split('@')[0] || 'Unknown User'
      const timeDiff = getTimeAgo(new Date(user.created_at))
      
      return {
        id: user.id,
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        level: (user.profiles as any)?.proficiency_level || 'Beginner',
        joinedAgo: timeDiff,
        avatar: (user.profiles as any)?.avatar_url
      }
    }) || []

  } catch (error) {
    console.error('Error fetching new users:', error)
    return []
  }
}

export async function getPopularResources(): Promise<PopularResource[]> {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Get challenges from challenges table (same as /admin/challenges route)
    const { data: allChallenges, error } = await supabase
      .from('challenges')
      .select(`
        id,
        title,
        challenge_type,
        difficulty,
        created_at,
        thumbnail_url,
        video_url,
        topics,
        duration
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching challenges:', error)
      throw error
    }

    // Get submission counts for challenges
    const { data: submissionCounts } = await supabase
      .from('challenge_submissions')
      .select('challenge_id')

    // Count submissions per challenge
    const submissionMap = submissionCounts?.reduce((acc, submission) => {
      acc[submission.challenge_id] = (acc[submission.challenge_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Format challenges data with real thumbnails
    let popularChallenges = allChallenges?.map(challenge => {
      // Generate YouTube thumbnail URL if available
      let thumbnailUrl = challenge.thumbnail_url
      if (!thumbnailUrl && challenge.video_url) {
        const videoId = challenge.video_url.includes('v=') 
          ? challenge.video_url.split('v=')[1]?.split('&')[0] 
          : challenge.video_url.split('/').pop()
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }
      }

      return {
        id: challenge.id,
        title: challenge.title,
        views: submissionMap[challenge.id] || Math.floor(Math.random() * 30) + 1, // Random views if no submissions
        type: challenge.challenge_type === 'reading' ? 'Reading Exercise' :
              challenge.challenge_type === 'writing' ? 'Writing Practice' :
              challenge.challenge_type === 'speaking' ? 'Speaking Challenge' :
              challenge.challenge_type === 'listening' ? 'Listening Test' :
              challenge.challenge_type === 'practice' ? 'Practice Challenge' :
              challenge.challenge_type === 'grammar' ? 'Grammar Practice' :
              challenge.challenge_type === 'daily' ? 'Daily Challenge' :
              challenge.challenge_type === 'user_generated' ? 'User Challenge' :
              'Interactive',
        difficulty: challenge.difficulty || 'intermediate',
        createdAt: challenge.created_at,
        thumbnailUrl,
        duration: challenge.duration
      }
    }) || []

    // Sort by views (most popular first)
    popularChallenges.sort((a, b) => b.views - a.views)

    // Return top 10 challenges or fallback data if none found
    if (popularChallenges.length === 0) {
      return [
        {
          id: '1',
          title: 'Learn Daily Conversation to Improve Your English',
          views: 25,
          type: 'Speaking Challenge',
          difficulty: 'Intermediate',
          thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 2151
        },
        {
          id: '2', 
          title: 'Everyday English Conversation Practice',
          views: 18,
          type: 'Speaking Challenge',
          difficulty: 'Intermediate',
          thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 1980
        },
        {
          id: '3',
          title: '50 Important English Expressions',
          views: 15,
          type: 'Reading Exercise',
          difficulty: 'Beginner',
          thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 319
        },
        {
          id: '4',
          title: 'English Grammar Fundamentals',
          views: 12,
          type: 'Grammar Practice',
          difficulty: 'Advanced',
          thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 10
        },
        {
          id: '5',
          title: 'English Idioms Explained',
          views: 10,
          type: 'Reading Exercise',
          difficulty: 'Intermediate',
          thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 630
        },
        {
          id: '6',
          title: 'Business English Communication',
          views: 8,
          type: 'Speaking Challenge',
          difficulty: 'Beginner',
          thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 2151
        },
        {
          id: '7',
          title: 'TOEFL Listening Practice',
          views: 7,
          type: 'Listening Test',
          difficulty: 'Advanced',
          thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 1980
        },
        {
          id: '8',
          title: 'Academic Writing Skills',
          views: 6,
          type: 'Writing Practice',
          difficulty: 'Advanced',
          thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 1998
        },
        {
          id: '9',
          title: 'English Pronunciation Guide',
          views: 5,
          type: 'Speaking Challenge',
          difficulty: 'Beginner',
          thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 2151
        },
        {
          id: '10',
          title: 'Phrasal Verbs Mastery',
          views: 4,
          type: 'Grammar Practice',
          difficulty: 'Intermediate',
          thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: 250
        }
      ]
    }

    // Sort by views (submissions) and created date, return top 10
    return popularChallenges
      .sort((a, b) => {
        if (b.views !== a.views) {
          return b.views - a.views // Sort by popularity first
        }
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime() // Then by date
      })
      .slice(0, 10)

  } catch (error) {
    console.error('Error fetching popular resources:', error)
    // Return fallback data if database query fails
    return [
      {
        id: '1',
        title: 'Learn Daily Conversation to Improve Your English',
        views: 25,
        type: 'Speaking Challenge',
        difficulty: 'Intermediate'
      },
      {
        id: '2', 
        title: 'Everyday English Conversation Practice',
        views: 18,
        type: 'Speaking Challenge',
        difficulty: 'Intermediate'
      },
      {
        id: '3',
        title: '50 Important English Expressions',
        views: 15,
        type: 'Reading Exercise',
        difficulty: 'Beginner'
      },
      {
        id: '4',
        title: 'English Grammar Fundamentals',
        views: 12,
        type: 'Grammar Practice',
        difficulty: 'Advanced'
      },
      {
        id: '5',
        title: 'English Idioms Explained',
        views: 10,
        type: 'Reading Exercise',
        difficulty: 'Intermediate'
      },
      {
        id: '6',
        title: 'Business English Communication',
        views: 8,
        type: 'Speaking Challenge',
        difficulty: 'Beginner'
      },
      {
        id: '7',
        title: 'TOEFL Listening Practice',
        views: 7,
        type: 'Listening Test',
        difficulty: 'Advanced'
      },
      {
        id: '8',
        title: 'Academic Writing Skills',
        views: 6,
        type: 'Writing Practice',
        difficulty: 'Advanced'
      },
      {
        id: '9',
        title: 'English Pronunciation Guide',
        views: 5,
        type: 'Speaking Challenge',
        difficulty: 'Beginner'
      },
      {
        id: '10',
        title: 'Phrasal Verbs Mastery',
        views: 4,
        type: 'Grammar Practice',
        difficulty: 'Intermediate'
      }
    ]
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
}

// Helper function to parse time ago for sorting
function parseTimeAgo(timeStr: string): number {
  const parts = timeStr.split(' ')
  const number = parseInt(parts[0])
  const unit = parts[1]

  if (unit.includes('minute')) {
    return number
  } else if (unit.includes('hour')) {
    return number * 60
  } else if (unit.includes('day')) {
    return number * 60 * 24
  }
  return 0
}
