import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'

export interface Achievement {
  achievement_key: string
  title: string
  description: string
  icon: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  points: number
  badge_color: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  is_completed: boolean
  progress: number
  requirement_value: number
  earned_at: string | null
  category_display_name: string
  category_color: string
}

export interface AchievementCategory {
  name: string
  display_name: string
  description: string
  icon: string
  color: string
  achievements: Achievement[]
}

interface UseAchievementsReturn {
  achievements: Achievement[]
  categories: AchievementCategory[]
  completedAchievements: Achievement[]
  totalPoints: number
  completionRate: number
  isLoading: boolean
  refreshAchievements: () => Promise<void>
  checkAchievements: () => Promise<Achievement[]>
}

export function useAchievements(): UseAchievementsReturn {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAchievements = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      
      const { data: achievementsData, error } = await supabase
        .rpc('get_user_achievements', { user_id_param: user.id })

      if (error) {
        console.error('Error fetching achievements:', error)
        return
      }

      setAchievements(achievementsData || [])
      
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const refreshAchievements = useCallback(async () => {
    await fetchAchievements()
  }, [fetchAchievements])

  const checkAchievements = useCallback(async (): Promise<Achievement[]> => {
    if (!user?.id) return []

    try {
      const { data: newAchievements, error } = await supabase
        .rpc('check_and_award_achievements', { user_id_param: user.id })

      if (error) {
        console.error('Error checking achievements:', error)
        return []
      }

      if (newAchievements && newAchievements.length > 0) {
        // Show toast notifications for new achievements
        newAchievements.forEach((achievement: any) => {
          toast({
            title: "🎉 Achievement Unlocked!",
            description: `${achievement.icon} ${achievement.title} - ${achievement.points} XP`,
            duration: 5000,
          })
        })

        // Refresh achievements to get updated data
        await fetchAchievements()
      }

      return newAchievements || []
    } catch (error) {
      console.error('Error checking achievements:', error)
      return []
    }
  }, [user?.id, fetchAchievements])

  // Fetch achievements on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchAchievements()
    }
  }, [user?.id, fetchAchievements])

  // Set up real-time subscriptions for achievement updates
  useEffect(() => {
    if (!user?.id) return

    const subscription = supabase
      .channel('user-achievements')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh achievements when user_achievements table changes
          fetchAchievements()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id, fetchAchievements])

  // Computed values
  const completedAchievements = achievements.filter(a => a.is_completed)
  const totalPoints = completedAchievements.reduce((sum, a) => sum + a.points, 0)
  const completionRate = achievements.length > 0 ? (completedAchievements.length / achievements.length) * 100 : 0

  // Group achievements by category
  const categories: AchievementCategory[] = achievements.reduce((acc, achievement) => {
    const existingCategory = acc.find(cat => cat.name === achievement.category)
    
    if (existingCategory) {
      existingCategory.achievements.push(achievement)
    } else {
      acc.push({
        name: achievement.category,
        display_name: achievement.category_display_name,
        description: `${achievement.category_display_name} achievements`,
        icon: getCategoryIcon(achievement.category),
        color: achievement.category_color,
        achievements: [achievement]
      })
    }
    
    return acc
  }, [] as AchievementCategory[])

  return {
    achievements,
    categories,
    completedAchievements,
    totalPoints,
    completionRate,
    isLoading,
    refreshAchievements,
    checkAchievements
  }
}

// Helper function to get category icons
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    engagement: '💬',
    learning: '📚',
    social: '👥',
    milestone: '🏆',
    streak: '🔥',
    creative: '🎨',
    helpful: '🤝',
    special: '✨'
  }
  return icons[category] || '🏅'
}

// Hook for achievement notifications
export function useAchievementNotifications() {
  const { user } = useAuth()

  const showAchievementNotification = useCallback((achievement: Achievement) => {
    // Create a more elaborate notification
    const notification = document.createElement('div')
    notification.className = `
      fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 
      text-white p-4 rounded-lg shadow-lg transform transition-all duration-500
      animate-bounce
    `
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-2xl">${achievement.icon}</span>
        <div>
          <div class="font-bold">🎉 Achievement Unlocked!</div>
          <div class="text-sm">${achievement.title}</div>
          <div class="text-xs opacity-90">+${achievement.points} XP</div>
        </div>
      </div>
    `

    document.body.appendChild(notification)

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 500)
    }, 5000)
  }, [])

  return { showAchievementNotification }
}

// Hook to automatically check achievements on actions
export function useAutoAchievementCheck() {
  const { checkAchievements } = useAchievements()
  const { showAchievementNotification } = useAchievementNotifications()

  const triggerAchievementCheck = useCallback(async () => {
    const newAchievements = await checkAchievements()
    newAchievements.forEach(showAchievementNotification)
  }, [checkAchievements, showAchievementNotification])

  return { triggerAchievementCheck }
}
