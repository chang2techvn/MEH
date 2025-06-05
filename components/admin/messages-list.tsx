"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Flag, MessageSquare } from "lucide-react"
import { supabase, dbHelpers } from "@/lib/supabase"
import type { Database } from "@/types/database.types"
import { toast } from "@/hooks/use-toast"

// Types from Supabase schema
type UserRow = Database['public']['Tables']['users']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']
type ConversationRow = Database['public']['Tables']['conversations']['Row']

interface MessageListItem {
  id: string
  user: {
    id: string
    name: string
    avatar: string | null
    role: string
  }
  lastMessage: string
  timestamp: Date
  unread: boolean
  flagged: boolean
  status: string
}

interface MessagesListProps {
  isLoading: boolean
  activeTab: string
  searchQuery: string
  filterStatus: string
  onSelectConversation: (id: string) => void
  selectedConversationId: string | null
}

export function MessagesList({
  isLoading,
  activeTab,
  searchQuery,
  filterStatus,
  onSelectConversation,
  selectedConversationId,
}: MessagesListProps) {
  const [filteredMessages, setFilteredMessages] = useState<MessageListItem[]>([])
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [messages, setMessages] = useState<MessageListItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load messages from Supabase
  const loadMessages = async () => {
    try {
      setLoading(true)

      // Get conversations with their participants and latest messages
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select(`
          id,
          name,
          type,
          is_group,
          last_message_at,
          created_at,
          conversation_participants!inner(
            user:users!inner(
              id,
              name,
              avatar,
              role
            )
          ),
          messages(
            id,
            content,
            created_at,
            sender:users!sender_id(
              id,
              name
            )
          )
        `)
        .eq('conversation_participants.is_active', true)
        .order('last_message_at', { ascending: false })
        .order('created_at', { foreignTable: 'messages', ascending: false })
        .limit(1, { foreignTable: 'messages' }) // Only get the latest message

      if (conversationError) {
        console.error('Error fetching conversations:', conversationError)
        return
      }

      const messageItems: MessageListItem[] = conversationData?.map((conversation: any) => {
        // Get the other participant (not the current user) for 1:1 conversations
        const participants = conversation.conversation_participants || []
        const otherParticipant = participants.find((p: any) => p.user.id !== 'current-user') // In real app, use actual current user ID
        const user = otherParticipant?.user || participants[0]?.user

        // Get the latest message
        const latestMessage = conversation.messages?.[0]
        
        return {
          id: conversation.id,
          user: {
            id: user?.id || 'unknown',
            name: user?.name || 'Unknown User',
            avatar: user?.avatar || null,
            role: user?.role || 'student',
          },
          lastMessage: latestMessage?.content || 'No messages yet',
          timestamp: new Date(latestMessage?.created_at || conversation.created_at),
          unread: false, // Would need to track read status
          flagged: false, // Would need to implement flagging
          status: 'active',
        }
      }) || []

      setMessages(messageItems)
    } catch (error) {
      console.error('Error loading messages:', error)
      toast({
        title: "Error loading messages",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  // Filter messages based on activeTab, searchQuery, and filterStatus
  useEffect(() => {
    let filtered = [...messages]

    // Filter by tab
    if (activeTab === "unread") {
      filtered = filtered.filter((msg) => msg.unread)
    } else if (activeTab === "flagged") {
      filtered = filtered.filter((msg) => msg.flagged)
    } else if (activeTab === "archived") {
      filtered = filtered.filter((msg) => msg.status === "archived")
    } else if (activeTab === "all") {
      filtered = filtered.filter((msg) => msg.status === "active")
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (msg) => msg.user.name.toLowerCase().includes(query) || msg.lastMessage.toLowerCase().includes(query),
      )
    }

    // Filter by status
    if (filterStatus === "unread") {
      filtered = filtered.filter((msg) => msg.unread)
    } else if (filterStatus === "flagged") {
      filtered = filtered.filter((msg) => msg.flagged)
    } else if (filterStatus === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter((msg) => msg.timestamp >= today)
    } else if (filterStatus === "week") {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)
      filtered = filtered.filter((msg) => msg.timestamp >= weekStart)
    } else if (filterStatus === "month") {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      filtered = filtered.filter((msg) => msg.timestamp >= monthStart)
    }

    setFilteredMessages(filtered)
  }, [activeTab, searchQuery, filterStatus, messages])

  // Toggle message selection
  const toggleMessageSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    setSelectedMessages((prev) => {
      if (prev.includes(id)) {
        return prev.filter((msgId) => msgId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Format timestamp
  const formatMessageTime = (date: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date >= today) {
      return format(date, "h:mm a")
    } else if (date >= yesterday) {
      return "Yesterday"
    } else {
      return format(date, "MMM d")
    }
  }

  if (isLoading || loading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[400px]">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No messages found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {searchQuery
            ? "Try adjusting your search or filters to find what you're looking for."
            : "There are no messages matching your current filters."}
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="p-1">
        <AnimatePresence initial={false}>
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{ backgroundColor: "rgba(var(--muted), 0.3)" }}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer ${
                selectedConversationId === message.id
                  ? "bg-gradient-to-r from-neo-mint/10 to-purist-blue/10"
                  : "hover:bg-muted/50"
              } ${message.unread ? "bg-muted/30" : ""}`}
              onClick={() => onSelectConversation(message.id)}
            >
              <div className="flex items-center h-10">
                <Checkbox
                  checked={selectedMessages.includes(message.id)}
                  onCheckedChange={() => {}}
                  onClick={(e) => toggleMessageSelection(message.id, e)}
                  className="mr-2 data-[state=checked]:bg-gradient-to-r from-neo-mint to-purist-blue data-[state=checked]:text-primary-foreground"
                />
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={message.user.avatar || "/placeholder.svg"} alt={message.user.name} />
                    <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {message.unread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-neo-mint rounded-full border-2 border-background animate-pulse"></span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <p className={`text-sm font-medium truncate ${message.unread ? "font-semibold" : ""}`}>
                      {message.user.name}
                    </p>
                    <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-4">
                      {message.user.role}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
                <p className={`text-sm truncate mb-1 ${message.unread ? "font-medium" : "text-muted-foreground"}`}>
                  {message.lastMessage}
                </p>
                <div className="flex items-center">
                  {message.flagged && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 h-4 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
                    >
                      <Flag className="h-2.5 w-2.5 mr-1" />
                      Flagged
                    </Badge>
                  )}
                  {message.status === "archived" && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 ml-1">
                      Archived
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  )
}
