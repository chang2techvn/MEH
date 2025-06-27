"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChat } from "@/contexts/chat-context"
import { formatDistanceToNow } from "date-fns"

export default function MessageDropdown() {
  const { conversations, isDropdownOpen, openChatWindow, closeDropdown } = useChat()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p.id !== "current-user")
    if (!otherParticipant) return false

    return otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (!isDropdownOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 mt-2 w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 dark:border-gray-800/20 z-50 overflow-hidden chat-dropdown"
      >
        <div className="p-3 border-b border-white/20 dark:border-gray-800/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Messages</h3>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeDropdown}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages..."
              className="pl-8 h-9 bg-white/20 dark:bg-gray-800/20 border-white/20 dark:border-gray-800/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No conversations found</div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find((p) => p.id !== "current-user")
              if (!otherParticipant) return null

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 hover:bg-white/20 dark:hover:bg-gray-800/20 cursor-pointer transition-colors ${
                    conversation.unreadCount > 0 ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                  onClick={() => openChatWindow(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-white/20 dark:border-gray-800/20">
                        <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.name} />
                        <AvatarFallback>{otherParticipant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                          otherParticipant.status === "online"
                            ? "bg-green-500"
                            : otherParticipant.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                        }`}
                      ></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{otherParticipant.name}</span>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {conversation.isTyping ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-neo-mint dark:text-purist-blue">typing</span>
                            <div className="flex space-x-1">
                              <motion.div
                                className="h-1.5 w-1.5 rounded-full bg-neo-mint dark:bg-purist-blue"
                                animate={{ y: [0, -3, 0] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0 }}
                              />
                              <motion.div
                                className="h-1.5 w-1.5 rounded-full bg-neo-mint dark:bg-purist-blue"
                                animate={{ y: [0, -3, 0] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.2 }}
                              />
                              <motion.div
                                className="h-1.5 w-1.5 rounded-full bg-neo-mint dark:bg-purist-blue"
                                animate={{ y: [0, -3, 0] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        ) : (
                          conversation.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.lastMessage.senderId === "current-user" ? "You: " : ""}
                              {conversation.lastMessage.text}
                            </p>
                          )
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-[10px] text-white px-1.5">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
