"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, Search, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"
import { supabase, dbHelpers } from "@/lib/supabase"
import type { Database } from "@/types/database.types"
import { toast } from "@/hooks/use-toast"

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
      // For now, we'll use a hardcoded current user ID
      // In a real app, this would come from auth context
      const currentUserId = 'current-user-id'

      const { data: notificationData, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:users!sender_id(
            id,
            name,
            avatar
          )
        `)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching notifications:', error)
        // Fallback to sample data
        setSampleNotifications()
        return
      }

      const mappedNotifications: NotificationItem[] = notificationData?.map((notification: any) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: new Date(notification.created_at),
        read: notification.is_read,
        avatar: notification.sender?.avatar || "/placeholder.svg?height=40&width=40",
        link: notification.action_url,
        sender: {
          name: notification.sender?.name || "System",
          avatar: notification.sender?.avatar || "/placeholder.svg?height=40&width=40",
          status: "system", // Could be extended with real user status
        },
      })) || []

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
  }, [])

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
      // Update in database
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
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
      // Update all unread notifications in database
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      // Fallback to local state update only
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  // Clear all notifications
  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification.id)
    
    // Navigate to link if provided
    if (notification.link) {
      window.location.href = notification.link
    }
    
    setIsOpen(false)
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
            className="absolute right-0 mt-2 w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 dark:border-gray-800/20 z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-white/20 dark:border-gray-800/20">
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
                  placeholder="Search notifications..."
                  className="pl-8 h-9 bg-white/20 dark:bg-gray-800/20 border-white/20 dark:border-gray-800/20"
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
                        <Avatar className="h-10 w-10 border border-white/20 dark:border-gray-800/20">
                          <AvatarImage
                            src={notification.sender.avatar || "/placeholder.svg"}
                            alt={notification.sender.name}
                          />
                          <AvatarFallback>{notification.sender.name.substring(0, 2).toUpperCase()}</AvatarFallback>
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
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-[10px] text-white px-1.5">
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

            <div className="p-3 border-t border-white/20 dark:border-gray-800/20">
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
              <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Notification settings
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
