"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChat } from "@/contexts/chat-context"
import { formatDistanceToNow } from "date-fns"
import type { Conversation, User } from "@/components/messages/types"

export default function MessageDropdown() {
  const { conversations, isDropdownOpen, openChatWindow, closeDropdown, currentUser, loading } = useChat()
  const [searchQuery, setSearchQuery] = useState("")

  const getConversationTitle = (conv: Conversation) => {
    // Filter out current user from participants for title
    const otherParticipants = conv.participants.filter((p: User) => p.id !== currentUser?.id)
    return otherParticipants.map((p: User) => p.name).join(", ") || "Conversation"
  }

  const filteredConversations = conversations.filter((conv) => {
    // If currentUser is not loaded, show all conversations
    if (!currentUser) {
      return true
    }

    // Find other participants (not current user)
    const otherParticipants = conv.participants.filter((p: User) => p.id !== currentUser.id)
    
    if (otherParticipants.length === 0) {
      return false
    }

    // Check if any participant name matches search or conversation title
    const title = getConversationTitle(conv)
    
    const searchMatch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipants.some((participant: User) => 
             participant.name.toLowerCase().includes(searchQuery.toLowerCase())
           )
    
    return searchMatch
  })

  if (!isDropdownOpen) return null

  if (loading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 rounded-xl shadow-xl z-50"
        >
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neo-mint dark:border-purist-blue mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading conversations...</p>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 top-full mt-2 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 rounded-xl shadow-xl z-50 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 dark:border-gray-800/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Messages</h3>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                className="p-3 border-b border-white/5 dark:border-gray-800/5 last:border-b-0 cursor-pointer"
                onClick={() => {
                  openChatWindow(conversation.id)
                  closeDropdown()
                }}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarImage src={conversation.participants.find(p => p.id !== currentUser?.id)?.avatar || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-sm font-semibold">
                      {getConversationTitle(conversation).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-900 dark:text-white'}`}>
                        {getConversationTitle(conversation)}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-[10px] text-white font-semibold">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${conversation.unreadCount > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                      {typeof conversation.lastMessage === 'string' ? conversation.lastMessage : conversation.lastMessage?.text || "No messages yet"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {conversation.lastMessage && typeof conversation.lastMessage === 'object' && conversation.lastMessage.timestamp 
                        ? formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true }) 
                        : ''}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
