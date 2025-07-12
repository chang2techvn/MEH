import { supabase } from "@/lib/supabase"

export interface DailyStreakData {
  currentStreak: number
  weeklyActivity: Array<{
    date: string
    dayOfWeek: string
    hasDaily: boolean
    isToday: boolean
    isPast: boolean
    isFuture: boolean
  }>
}

/**
 * Calculate Daily Streak based on posts with title starting with "Daily"
 * Streak is broken if any day is missed (no Daily post)
 */
export async function calculateDailyStreak(userId: string): Promise<DailyStreakData> {
  try {
    // Get all posts with title starting with "Daily" for this user
    const { data: dailyPosts, error } = await supabase
      .from('posts')
      .select('title, created_at')
      .eq('user_id', userId)
      .like('title', 'Daily%')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching daily posts:', error)
      return {
        currentStreak: 0,
        weeklyActivity: generateWeeklyActivity([])
      }
    }

    // Group posts by date (ignore time)
    const postsByDate = new Map<string, boolean>()
    
    dailyPosts?.forEach(post => {
      const date = new Date(post.created_at)
      // Format as YYYY-MM-DD to group by date
      const dateKey = date.toISOString().split('T')[0]
      postsByDate.set(dateKey, true)
    })

    // Calculate current streak
    const currentStreak = calculateCurrentStreak(postsByDate)
    
    // Generate weekly activity for visualization
    const weeklyActivity = generateWeeklyActivity(postsByDate)

    // Update streak in users table if different
    await updateUserStreak(userId, currentStreak)

    return {
      currentStreak,
      weeklyActivity
    }

  } catch (error) {
    console.error('Error calculating daily streak:', error)
    return {
      currentStreak: 0,
      weeklyActivity: generateWeeklyActivity([])
    }
  }
}

/**
 * Calculate current streak by counting consecutive days from today backwards
 */
function calculateCurrentStreak(postsByDate: Map<string, boolean>): number {
  const today = new Date()
  let streak = 0
  let currentDate = new Date(today)

  // Start from today and go backwards
  while (true) {
    const dateKey = currentDate.toISOString().split('T')[0]
    
    if (postsByDate.has(dateKey)) {
      streak++
      // Go to previous day
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // Streak is broken, stop counting
      break
    }
  }

  return streak
}

/**
 * Generate weekly activity for current week (Monday to Sunday)
 */
function generateWeeklyActivity(postsByDate: Map<string, boolean> | any[]): Array<{
  date: string
  dayOfWeek: string
  hasDaily: boolean
  isToday: boolean
  isPast: boolean
  isFuture: boolean
}> {
  const today = new Date()
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  
  // Calculate Monday of current week
  const weekStart = new Date(today)
  const day = today.getDay()
  // JS: Sunday=0, Monday=1, ...
  const diffToMonday = (day === 0 ? -6 : 1) - day
  weekStart.setDate(today.getDate() + diffToMonday)

  const weeklyActivity = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    
    const dateKey = date.toISOString().split('T')[0]
    const isToday = date.toDateString() === today.toDateString()
    const isPast = date < today && !isToday
    const isFuture = date > today

    let hasDaily = false
    if (postsByDate instanceof Map) {
      hasDaily = postsByDate.has(dateKey)
    } else {
      // Handle array case (empty array for error states)
      hasDaily = false
    }

    weeklyActivity.push({
      date: dateKey,
      dayOfWeek: daysOfWeek[i],
      hasDaily,
      isToday,
      isPast,
      isFuture
    })
  }

  return weeklyActivity
}

/**
 * Update user's streak in the database
 */
async function updateUserStreak(userId: string, newStreak: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        streak_days: newStreak,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user streak:', error)
    }
  } catch (error) {
    console.error('Error updating user streak:', error)
  }
}

/**
 * Get Daily Streak for display without updating database
 */
export async function getDailyStreakForDisplay(userId: string): Promise<DailyStreakData> {
  // Same as calculateDailyStreak but without database update
  try {
    const { data: dailyPosts, error } = await supabase
      .from('posts')
      .select('title, created_at')
      .eq('user_id', userId)
      .like('title', 'Daily%')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching daily posts:', error)
      return {
        currentStreak: 0,
        weeklyActivity: generateWeeklyActivity([])
      }
    }

    const postsByDate = new Map<string, boolean>()
    
    dailyPosts?.forEach(post => {
      const date = new Date(post.created_at)
      const dateKey = date.toISOString().split('T')[0]
      postsByDate.set(dateKey, true)
    })

    const currentStreak = calculateCurrentStreak(postsByDate)
    const weeklyActivity = generateWeeklyActivity(postsByDate)

    return {
      currentStreak,
      weeklyActivity
    }

  } catch (error) {
    console.error('Error getting daily streak for display:', error)
    return {
      currentStreak: 0,
      weeklyActivity: generateWeeklyActivity([])
    }
  }
}
