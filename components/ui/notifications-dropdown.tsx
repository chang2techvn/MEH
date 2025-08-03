"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, Search, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"
import { supabase, dbHelpers } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"
import { toast } from "@/hooks/use-toast"
import { useAuthState } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context-realtime"
import { subscribeToNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/notification-utils"

// Types from Supabase schema
type NotificationRow = Database['public']['Tables']['notifications']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

interface NotificationItem {
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

export default function NotificationsDropdown() {
  const { user, isAuthenticated } = useAuthState()
  const { openChatWindow } = useChat()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notifications from Supabase
  const loadNotifications = async () => {
    try {
      setLoading(true)
      
      // Check if user is authenticated
      if (!isAuthenticated || !user?.id) {
        setSampleNotifications()
        return
      }

      const { data: notificationData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching notifications:', error)
        // Fallback to sample data
        setSampleNotifications()
        return
      }

      // Get unique replier IDs from story_reply notifications
      const replierIds = notificationData
        ?.filter(n => n.notification_type === 'story_reply' && n.data?.replier_id)
        .map(n => (n.data as any).replier_id)
        .filter((id, index, arr) => arr.indexOf(id) === index) || []

      // Fetch profiles for repliers
      let replierProfiles: any[] = []
      if (replierIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username, full_name, avatar_url')
          .in('user_id', replierIds)

        if (!profilesError && profilesData) {
          replierProfiles = profilesData
        }
      }

      const mappedNotifications: NotificationItem[] = notificationData?.map((notification) => {
        const notificationData = notification.data as any
        let avatar = "/placeholder.svg?height=40&width=40"
        let senderName = "System"

        // For story_reply notifications, get replier's avatar
        if (notification.notification_type === 'story_reply' && notificationData?.replier_id) {
          const replierProfile = replierProfiles.find(p => p.user_id === notificationData.replier_id)
          if (replierProfile) {
            avatar = replierProfile.avatar_url || "/placeholder.svg?height=40&width=40"
            senderName = replierProfile.full_name || replierProfile.username || notificationData.replier_name || "Unknown"
          } else {
            senderName = notificationData.replier_name || "Unknown"
          }
        }

        return {
          id: notification.id,
          type: notification.notification_type,
          title: notification.title,
          message: notification.message,
          time: new Date(notification.created_at || Date.now()),
          read: notification.is_read || false,
          avatar: avatar,
          link: notificationData?.action_url || undefined,
          sender: {
            name: senderName,
            avatar: avatar,
            status: "online",
          },
        }
      }) || []

      setNotifications(mappedNotifications)
      setUnreadCount(mappedNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error loading notifications:', error)
      setSampleNotifications()
      toast({
        title: "Error loading notifications",
        description: "Using sample data instead.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fallback to sample data
  const setSampleNotifications = () => {
    const sampleNotifications: NotificationItem[] = [
      {
        id: "1",
        type: "challenge",
        title: "New Challenge Available",
        message: "The 'Technology Impact' challenge is now available for you to complete.",
        time: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        avatar: "/placeholder.svg?height=40&width=40",
        link: "/challenges",
        sender: {
          name: "Challenge System",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "system",
        },
      },
      {
        id: "2",
        type: "feedback",
        title: "Feedback Received",
        message: "Your teacher has provided feedback on your recent video submission.",
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        avatar: "/placeholder.svg?height=40&width=40",
        link: "/profile",
        sender: {
          name: "Sarah Williams",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "online",
        },
      },
      {
        id: "3",
        type: "achievement",
        title: "Achievement Unlocked",
        message: "Congratulations! You've completed a 7-day streak.",
        time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
        avatar: "/placeholder.svg?height=40&width=40",
        link: "/profile",
        sender: {
          name: "Achievement System",
          avatar: "/placeholder.svg?height=40&width=40",
          status: "system",
        },
      },
    ]
    setNotifications(sampleNotifications)
    setUnreadCount(sampleNotifications.filter(n => !n.read).length)
  }

  useEffect(() => {
    loadNotifications()
  }, [user?.id]) // Reload when user changes

  // Subscribe to real-time notifications
  useEffect(() => {
    let unsubscribe: () => void

    if (isAuthenticated && user?.id) {
      unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
        setNotifications(prev => {
          const updated = [newNotification, ...prev.filter(n => n.id !== newNotification.id)]
          return updated
        })
        setUnreadCount(prev => prev + 1)
      })
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [isAuthenticated, user?.id])

  // Filter notifications based on search query
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.sender.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      if (!user?.id) {
        // Just update local state if not authenticated
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, read: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
        return
      }

      // Update in database
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (error) {
        console.error('Error marking notification as read:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return
      }

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error instanceof Error ? error.message : String(error))
      // Fallback to local state update only
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!user?.id) {
        // Just update local state if not authenticated
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
        return
      }

      // Update all unread notifications in database
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all notifications as read:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        toast({
          title: "Error",
          description: "Failed to mark all notifications as read",
          variant: "destructive"
        })
        return
      }

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error instanceof Error ? error.message : String(error))
      toast({
        title: "Error", 
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      })
    }
  }

  // Clear all notifications
  const clearAll = async () => {
    try {
      if (!user?.id) {
        // Just update local state if not authenticated
        setNotifications([])
        setUnreadCount(0)
        return
      }

      // Delete all notifications for this user from database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Error clearing all notifications:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        toast({
          title: "Error",
          description: "Failed to clear all notifications",
          variant: "destructive"
        })
        return
      }

      // Update local state
      setNotifications([])
      setUnreadCount(0)
      
      toast({
        title: "Success",
        description: "All notifications cleared"
      })
    } catch (error) {
      console.error('Error clearing all notifications:', error instanceof Error ? error.message : String(error))
      toast({
        title: "Error",
        description: "Failed to clear all notifications", 
        variant: "destructive"
      })
    }
  }

  const handleNotificationClick = async (notification: NotificationItem) => {
    markAsRead(notification.id)
    
    // Special handling for story reply notifications
    if (notification.type === 'story_reply') {
      try {
        // Extract replier user ID from notification data (stored when notification was created)
        const { data: notificationData, error: notifError } = await supabase
          .from('notifications')
          .select('data')
          .eq('id', notification.id)
          .single()
        
        if (!notifError && notificationData?.data?.replier_id) {
          const replierId = notificationData.data.replier_id
          const replierName = notificationData.data.replier_name || 'User'
          
          // Find or create conversation with the replier
          let conversationId: string | null = null

          // First try to find existing conversation
          const { data: existingConversations, error: findError } = await supabase
            .from('conversations')
            .select(`
              id,
              conversation_participants!inner (user_id)
            `)
            .eq('type', 'direct')
            .eq('conversation_participants.user_id', user?.id)

          if (!findError && existingConversations) {
            // Find conversation where both users are participants
            for (const conv of existingConversations) {
              const { data: participants } = await supabase
                .from('conversation_participants')
                .select('user_id')
                .eq('conversation_id', conv.id)

              if (participants) {
                const userIds = participants.map(p => p.user_id)
                if (userIds.includes(user?.id!) && userIds.includes(replierId) && userIds.length === 2) {
                  conversationId = conv.id
                  break
                }
              }
            }
          }

          // If no conversation exists, create one
          if (!conversationId) {
            const { data: newConversation, error: createError } = await supabase
              .from('conversations')
              .insert({
                title: `Chat with ${replierName}`,
                status: 'active',
                type: 'direct'
              })
              .select()
              .single()

            if (!createError && newConversation) {
              conversationId = newConversation.id

              // Add participants
              await supabase
                .from('conversation_participants')
                .insert([
                  { conversation_id: conversationId, user_id: user?.id, role: 'participant' },
                  { conversation_id: conversationId, user_id: replierId, role: 'participant' }
                ])
            }
          }

          // Open chat window if we have a conversation
          if (conversationId) {
            openChatWindow(conversationId)
            setIsOpen(false)
            return
          }
        }
      } catch (error) {
        console.error('Error opening chat for story reply:', error)
        toast({
          title: "Error",
          description: "Failed to open chat",
          variant: "destructive"
        })
      }
    }
    
    // Default behavior for other notifications
    if (notification.link) {
      try {
        // Check if it's an internal link (starts with / or is relative)
        if (notification.link.startsWith('/')) {
          router.push(notification.link)
        } else {
          // External link - open in new tab
          window.open(notification.link, '_blank', 'noopener,noreferrer')
        }
      } catch (error) {
        console.error('Navigation error:', error)
        // Fallback to window.location for external links
        window.location.href = notification.link
      }
    }
    
    setIsOpen(false)
  }
  if (!isAuthenticated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative group transition-colors opacity-50 cursor-not-allowed pointer-events-none"
              aria-label="Notifications"
              disabled
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
              <Bell className="relative h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign in to view notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  return (
    <div className="relative" ref={dropdownRef}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative group hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
              <Bell className="relative h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-[10px] text-white shadow-glow-sm notification-indicator">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-[calc(100vw-120px)] sm:w-80 max-w-[280px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 dark:border-gray-800/20 z-50 overflow-hidden"
          >
            <div className="p-2 sm:p-3 border-b border-white/20 dark:border-gray-800/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Notifications</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 h-9 bg-white/20 dark:bg-gray-800/20 border-white/20 dark:border-gray-800/20 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Loading notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {notifications.length === 0 ? "No notifications" : "No matching notifications"}
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 hover:bg-white/20 dark:hover:bg-gray-800/20 cursor-pointer transition-colors ${
                      !notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border border-white/20 dark:border-gray-800/20">
                          <AvatarImage
                            src={notification.sender.avatar || "/placeholder.svg"}
                            alt={notification.sender.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-vibrant-orange to-cantaloupe text-white">
                            {notification.sender.name ? notification.sender.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                            notification.sender.status === "online"
                              ? "bg-green-500"
                              : notification.sender.status === "away"
                                ? "bg-yellow-500"
                                : notification.sender.status === "system"
                                  ? "bg-purple-500"
                                  : "bg-gray-400"
                          }`}
                        ></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{notification.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.time, { addSuffix: false })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                          {!notification.read && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-vibrant-orange to-cantaloupe text-[10px] text-white px-1.5">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-2 sm:p-3 border-t border-white/20 dark:border-gray-800/20">
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Mark all as read
                </Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={clearAll}>
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear all
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
