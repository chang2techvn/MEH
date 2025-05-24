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

interface MessagesListProps {
  isLoading: boolean
  activeTab: string
  searchQuery: string
  filterStatus: string
  onSelectConversation: (id: string) => void
  selectedConversationId: string | null
}

// Sample data for messages
const sampleMessages = [
  {
    id: "msg1",
    user: {
      id: "user1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      role: "student",
    },
    lastMessage: "I'm having trouble with the pronunciation exercise in lesson 5. Could you help me?",
    timestamp: new Date(2025, 4, 18, 14, 30),
    unread: true,
    flagged: false,
    status: "active",
  },
  {
    id: "msg2",
    user: {
      id: "user2",
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40&text=MC",
      role: "student",
    },
    lastMessage: "Thank you for the feedback on my writing assignment. I've made the suggested changes.",
    timestamp: new Date(2025, 4, 18, 12, 15),
    unread: false,
    flagged: true,
    status: "active",
  },
  {
    id: "msg3",
    user: {
      id: "user3",
      name: "Emma Williams",
      avatar: "/placeholder.svg?height=40&width=40&text=EW",
      role: "teacher",
    },
    lastMessage: "I've uploaded the new speaking practice materials for the advanced students.",
    timestamp: new Date(2025, 4, 18, 10, 45),
    unread: true,
    flagged: false,
    status: "active",
  },
  {
    id: "msg4",
    user: {
      id: "user4",
      name: "David Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40&text=DR",
      role: "student",
    },
    lastMessage: "When will the next live session be scheduled? I couldn't attend the last one.",
    timestamp: new Date(2025, 4, 17, 16, 20),
    unread: false,
    flagged: false,
    status: "active",
  },
  {
    id: "msg5",
    user: {
      id: "user5",
      name: "Sophia Lee",
      avatar: "/placeholder.svg?height=40&width=40&text=SL",
      role: "student",
    },
    lastMessage: "I'm experiencing technical issues with the listening comprehension quiz.",
    timestamp: new Date(2025, 4, 17, 14, 10),
    unread: true,
    flagged: true,
    status: "active",
  },
  {
    id: "msg6",
    user: {
      id: "user6",
      name: "James Wilson",
      avatar: "/placeholder.svg?height=40&width=40&text=JW",
      role: "student",
    },
    lastMessage: "Could you provide more examples of conditional sentences? I'm still confused.",
    timestamp: new Date(2025, 4, 17, 11, 30),
    unread: false,
    flagged: false,
    status: "archived",
  },
  {
    id: "msg7",
    user: {
      id: "user7",
      name: "Olivia Martinez",
      avatar: "/placeholder.svg?height=40&width=40&text=OM",
      role: "teacher",
    },
    lastMessage: "Here's the updated curriculum for the summer intensive program.",
    timestamp: new Date(2025, 4, 16, 15, 45),
    unread: false,
    flagged: false,
    status: "active",
  },
  {
    id: "msg8",
    user: {
      id: "user8",
      name: "Ethan Thompson",
      avatar: "/placeholder.svg?height=40&width=40&text=ET",
      role: "student",
    },
    lastMessage: "I've completed all the exercises in module 3. What should I focus on next?",
    timestamp: new Date(2025, 4, 16, 13, 20),
    unread: true,
    flagged: false,
    status: "active",
  },
  {
    id: "msg9",
    user: {
      id: "user9",
      name: "Ava Garcia",
      avatar: "/placeholder.svg?height=40&width=40&text=AG",
      role: "student",
    },
    lastMessage: "I'm planning to take the IELTS test next month. Do you have any specific preparation advice?",
    timestamp: new Date(2025, 4, 16, 10, 15),
    unread: false,
    flagged: false,
    status: "archived",
  },
  {
    id: "msg10",
    user: {
      id: "user10",
      name: "Noah Brown",
      avatar: "/placeholder.svg?height=40&width=40&text=NB",
      role: "student",
    },
    lastMessage: "The video in lesson 7 isn't loading properly. Is there an alternative link?",
    timestamp: new Date(2025, 4, 15, 16, 40),
    unread: false,
    flagged: true,
    status: "active",
  },
]

export function MessagesList({
  isLoading,
  activeTab,
  searchQuery,
  filterStatus,
  onSelectConversation,
  selectedConversationId,
}: MessagesListProps) {
  const [filteredMessages, setFilteredMessages] = useState(sampleMessages)
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])

  // Filter messages based on activeTab, searchQuery, and filterStatus
  useEffect(() => {
    let filtered = [...sampleMessages]

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
  }, [activeTab, searchQuery, filterStatus])

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

  if (isLoading) {
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
