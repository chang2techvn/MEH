"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, X } from "lucide-react"
import type { Conversation, User } from "./types"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ConversationListProps {
  conversations: Conversation[]
  activeConversationId: string | undefined
  onSelectConversation: (conversation: Conversation) => void
  currentUser: User
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUser,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = conversation.participants.find((p) => p.id !== currentUser.id)
    if (!otherParticipant) return false

    return otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getOtherParticipant = (conversation: Conversation): User => {
    return conversation.participants.find((p) => p.id !== currentUser.id) || conversation.participants[0]
  }

  const formatTime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    // If less than 24 hours, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If less than 7 days, show day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: "short" })
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
      default:
        return "bg-gray-400"
    }
  }

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <>
      <div className="p-4 border-b flex items-center gap-2">
        {isSearching ? (
          <>
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery("")
                setIsSearching(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold flex-1">Messages</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSearching(true)}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">{searchQuery ? "No conversations found" : "No conversations yet"}</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation)
            const isActive = conversation.id === activeConversationId

            return (
              <motion.div
                key={conversation.id}
                
                
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  isActive ? "bg-primary/10 dark:bg-primary/20" : "hover:bg-muted"
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage 
                      src={otherParticipant.avatar || "/placeholder.svg?height=48&width=48"} 
                      alt={otherParticipant.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                      {otherParticipant.name ? otherParticipant.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                      otherParticipant.status,
                    )}`}
                  ></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium truncate">{otherParticipant.name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {conversation.isTyping ? (
                      <div className="text-sm text-muted-foreground flex items-center">
                        <span className="mr-1">Typing</span>
                        <span className="flex space-x-1">
                          <motion.span
                            className="h-1.5 w-1.5 bg-muted-foreground rounded-full"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                          />
                          <motion.span
                            className="h-1.5 w-1.5 bg-muted-foreground rounded-full"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                          />
                          <motion.span
                            className="h-1.5 w-1.5 bg-muted-foreground rounded-full"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                          />
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage && (
                          <>
                            {conversation.lastMessage.senderId === currentUser.id && (
                              <span className="text-xs mr-1">You: </span>
                            )}
                            {truncateText(conversation.lastMessage.text, 30)}
                          </>
                        )}
                      </p>
                    )}

                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" className="ml-auto">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </>
  )
}
