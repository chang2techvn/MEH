/**
 * Notification System Utils
 * Utility functions for managing notifications across the application
 */

import { supabase } from '@/lib/supabase'

export interface NotificationData {
  title: string
  message: string
  type: 'system' | 'achievement' | 'challenge' | 'like' | 'comment' | 'follow'
  action_url?: string
  metadata?: Record<string, any>
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  time: Date
  read: boolean
  avatar: string
  link?: string
  sender: {
    name: string
    avatar: string
    status: string
  }
}

/**
 * Send notification to specific users
 */
export async function sendNotificationToUsers(
  userIds: string[],
  notificationData: NotificationData
) {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title: notificationData.title,
      message: notificationData.message,
      notification_type: notificationData.type,
      data: notificationData.action_url ? { action_url: notificationData.action_url, ...notificationData.metadata } : notificationData.metadata,
      is_read: false,
      created_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) {
      console.error('Error sending notifications:', error)
      return { success: false, error }
    }

    console.log(`✅ Sent notifications to ${userIds.length} users`)
    return { success: true, data }
  } catch (error) {
    console.error('Exception sending notifications:', error)
    return { success: false, error }
  }
}

/**
 * Send notification to all users with a specific role
 */
export async function sendNotificationToRole(
  role: 'admin' | 'teacher' | 'student',
  notificationData: NotificationData
) {
  try {
    // Get all users with the specified role
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('role', role)

    if (userError) {
      console.error('Error fetching users by role:', userError)
      return { success: false, error: userError }
    }

    const userIds = users.map(user => user.id)
    return await sendNotificationToUsers(userIds, notificationData)
  } catch (error) {
    console.error('Exception sending notifications to role:', error)
    return { success: false, error }
  }
}

/**
 * Send notification to all users
 */
export async function sendNotificationToAll(notificationData: NotificationData) {
  try {
    // Get all active users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('is_active', true)

    if (userError) {
      console.error('Error fetching all users:', userError)
      return { success: false, error: userError }
    }

    const userIds = users.map(user => user.id)
    return await sendNotificationToUsers(userIds, notificationData)
  } catch (error) {
    console.error('Exception sending notifications to all:', error)
    return { success: false, error }
  }
}

/**
 * Subscribe to real-time notifications for a user
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: NotificationItem) => void
): () => void {
  try {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as any
          const mappedNotification: NotificationItem = {
            id: newNotification.id,
            type: newNotification.notification_type,
            title: newNotification.title,
            message: newNotification.message,
            time: new Date(newNotification.created_at || Date.now()),
            read: newNotification.is_read || false,
            avatar: "/placeholder.svg?height=40&width=40",
            link: (newNotification.data as any)?.action_url || undefined,
            sender: {
              name: "System",
              avatar: "/placeholder.svg?height=40&width=40",
              status: "system",
            },
          }
          onNotification(mappedNotification)
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription)
    }
  } catch (error) {
    console.error('Error setting up real-time notifications:', error)
    // Return empty unsubscribe function if real-time fails
    return () => {}
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}

/**
 * Create welcome notification for new users
 */
export async function createWelcomeNotification(userId: string, userRole: string) {
  const welcomeMessages = {
    admin: {
      title: "Welcome, Administrator! 🎯",
      message: "Access your admin dashboard to manage users, monitor system health, and configure platform settings.",
      action_url: "/profile"
    },
    teacher: {
      title: "Welcome, Teacher! 👨‍🏫",
      message: "Start managing your students, review submissions, and track learning progress from your teacher dashboard.",
      action_url: "/profile"
    },
    student: {
      title: "Welcome to English Learning! 🎉",
      message: "Begin your English learning journey with interactive challenges, AI feedback, and community support.",
      action_url: "/challenges"
    }
  }

  const welcome = welcomeMessages[userRole as keyof typeof welcomeMessages] || welcomeMessages.student

  return await sendNotificationToUsers([userId], {
    title: welcome.title,
    message: welcome.message,
    type: 'system',
    action_url: welcome.action_url
  })
}

/**
 * Notification event handlers for common actions
 */
export const NotificationTriggers = {
  // When user completes a challenge
  onChallengeCompleted: async (userId: string, challengeTitle: string, score: number) => {
    const isHighScore = score >= 90
    await sendNotificationToUsers([userId], {
      title: isHighScore ? "Excellent Work! 🏆" : "Challenge Completed! ✅",
      message: `You scored ${score}% on "${challengeTitle}". ${isHighScore ? "Outstanding performance!" : "Keep practicing to improve!"}`,
      type: 'achievement',
      action_url: '/profile'
    })
  },

  // When user receives a like on their post
  onPostLiked: async (authorId: string, likerName: string) => {
    await sendNotificationToUsers([authorId], {
      title: "Your Post Got a Like! 👍",
      message: `${likerName} liked your community post.`,
      type: 'like',
      action_url: '/community'
    })
  },

  // When user receives a comment
  onCommentReceived: async (authorId: string, commenterName: string) => {
    await sendNotificationToUsers([authorId], {
      title: "New Comment! 💬",
      message: `${commenterName} commented on your post.`,
      type: 'comment',
      action_url: '/community'
    })
  },

  // When teacher assigns new challenge
  onChallengeAssigned: async (studentIds: string[], challengeTitle: string) => {
    await sendNotificationToUsers(studentIds, {
      title: "New Challenge Assigned! 📚",
      message: `Your teacher has assigned a new challenge: "${challengeTitle}".`,
      type: 'challenge',
      action_url: '/challenges'
    })
  },

  // When user gets a new follower
  onNewFollower: async (userId: string, followerName: string) => {
    await sendNotificationToUsers([userId], {
      title: "New Follower! 👥",
      message: `${followerName} started following you.`,
      type: 'follow',
      action_url: '/profile'
    })
  }
}
