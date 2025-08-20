"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MessageSquare, Search, Plus, UserPlus, MessageCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChat } from "@/contexts/chat-context-realtime"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase"
import type { Conversation, User } from "@/components/messages/types"

interface DatabaseUser {
  id: string
  full_name: string
  email: string
  avatar: string
}

interface MessagesModalProps {
  isOpen: boolean
  onClose: () => void
}

function MessagesModalContent({ onClose }: { onClose: () => void }) {
  const { conversations, openChatWindow, currentUser, loading, loadConversations } = useChat()
  const authContext = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<DatabaseUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasMoreUsers, setHasMoreUsers] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  // Helper function to get conversation title
  const getConversationTitle = useCallback((conv: Conversation) => {
    const otherParticipants = (conv.participants || []).filter((p: User) => p.id !== currentUser?.id)
    return otherParticipants.map((p: User) => p.name).join(", ") || "Conversation"
  }, [currentUser])

  // Load users for new chat
  const loadAvailableUsers = useCallback(async (searchTerm: string = '', page: number = 0) => {
    if (!currentUser || loadingUsers) return
    
    try {
      setLoadingUsers(true)
      setError(null)
      
      const pageSize = 20
      const offset = page * pageSize
      
      // Query users with profiles - same approach as dropdown
      let query = supabase
        .from('users')
        .select(`
          id, 
          email, 
          last_login,
          name,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .neq('id', currentUser.id)
        .eq('is_active', true)
        .order('last_login', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,profiles.full_name.ilike.%${searchTerm}%,profiles.username.ilike.%${searchTerm}%`)
      }

      const { data: users, error } = await query

      if (error) throw error

      const usersData: DatabaseUser[] = (users || [])
        .filter(user => user?.id && user.id !== currentUser.id)
        .map(user => {
          // Handle profiles data - could be an array or object
          const profile = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles
          const safeProfile = profile || {}
          
          const displayName = 
            user.name ||
            safeProfile.full_name || 
            safeProfile.username || 
            user.email?.split('@')[0] || 
            'Unknown User'
            
          return {
            id: user.id,
            full_name: displayName,
            email: user.email || '',
            avatar: safeProfile.avatar_url || ''
          }
        })

      if (page === 0) {
        setAvailableUsers(usersData)
      } else {
        setAvailableUsers(prev => [...prev, ...usersData])
      }
      
      setHasMoreUsers(usersData.length === pageSize)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error loading users:', error)
      setError(error instanceof Error ? error.message : 'Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }, [currentUser, loadingUsers])

  // Create new conversation
  const createConversation = useCallback(async (otherUserId: string) => {
    if (!currentUser || creatingConversation) return
    
    try {
      setCreatingConversation(otherUserId)
      setError(null)

      const { data: existingConv, error: findError } = await supabase
        .from('conversations')
        .select(`
          id, 
          conversation_participants!inner(user_id)
        `)
        .eq('conversation_participants.user_id', currentUser.id)

      if (findError) throw findError

      const existingConversation = existingConv?.find(conv => 
        conv.conversation_participants.length === 2 && 
        conv.conversation_participants.some((p: any) => p.user_id === otherUserId)
      )

      if (existingConversation) {
        openChatWindow(existingConversation.id)
        onClose()
        return
      }

      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single()

      if (createError) throw createError

      const participants = [
        { conversation_id: newConv.id, user_id: currentUser.id },
        { conversation_id: newConv.id, user_id: otherUserId }
      ]

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants)

      if (participantsError) throw participantsError

      await loadConversations()
      openChatWindow(newConv.id)
      onClose()
    } catch (error) {
      console.error('Error creating conversation:', error)
      setError(error instanceof Error ? error.message : 'Failed to create conversation')
    } finally {
      setCreatingConversation(null)
    }
  }, [currentUser, openChatWindow, onClose, loadConversations, creatingConversation])

  // Load users when showing new chat
  useEffect(() => {
    if (showNewChat && currentUser) {
      loadAvailableUsers('', 0)
    }
  }, [showNewChat, currentUser, loadAvailableUsers])

  // Debounced search
  useEffect(() => {
    if (!showNewChat) return
    
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== '') {
        loadAvailableUsers(searchTerm, 0)
      }
    }, 300)
    
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, showNewChat, loadAvailableUsers])

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!currentUser) return []

    const validConversations = conversations.filter((conv) => {
      const isParticipant = conv.participants.some((p: User) => p.id === currentUser.id)
      if (!isParticipant) return false

      const otherParticipants = (conv.participants || []).filter((p: User) => p.id !== currentUser.id)
      if (otherParticipants.length === 0) return false

      if (searchQuery) {
        const title = getConversationTitle(conv).toLowerCase()
        return title.includes(searchQuery.toLowerCase())
      }

      return true
    })

    return validConversations.sort((a, b) => {
      // Sort by last message timestamp if available, otherwise keep original order
      const aTime = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0
      const bTime = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0
      return bTime - aTime
    })
  }, [conversations, currentUser, searchQuery, getConversationTitle])

  if (!authContext?.isAuthenticated || !currentUser) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Please sign in to view messages
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and New Chat */}
      <div className="p-3 border-b border-white/10 dark:border-gray-800/10">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20"
            />
          </div>
          <Button
            onClick={() => setShowNewChat(!showNewChat)}
            size="sm"
            variant={showNewChat ? "default" : "outline"}
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800/20">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showNewChat ? (
          // New Chat Users List
          <div className="space-y-1">
            {searchTerm && (
              <div className="p-3">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20"
                />
              </div>
            )}
            
            {loadingUsers && currentPage === 0 ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              availableUsers.map((user) => (
                <motion.div
                  key={user.id}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  className="p-3 cursor-pointer flex items-center space-x-3"
                  onClick={() => createConversation(user.id)}
                >
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarImage src={user.avatar} alt={user.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-sm font-semibold">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  {creatingConversation === user.id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neo-mint dark:border-purist-blue"></div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        ) : (
          // Conversations List
          <div className="space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    openChatWindow(conversation.id)
                    onClose()
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarImage src={conversation.participants.find((p: User) => p.id !== currentUser?.id)?.avatar || ''} />
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
                        {conversation.isTyping ? (
                          <span className="text-neo-mint dark:text-purist-blue font-medium">
                            <span className="inline-flex items-center">
                              <span>Typing</span>
                              <span className="ml-1 flex space-x-1">
                                <span className="w-1 h-1 rounded-full bg-current animate-bounce"></span>
                                <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                              </span>
                            </span>
                          </span>
                        ) : (
                          typeof conversation.lastMessage === 'string' ? conversation.lastMessage : conversation.lastMessage?.text || "No messages yet"
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface MessagesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MessagesModal({ isOpen, onClose }: MessagesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] z-50 mx-auto max-w-md"
          >
            <div className="h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-white/20 dark:border-gray-800/20 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-800/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                    <MessageSquare className="relative h-5 w-5 text-neo-mint dark:text-purist-blue" />
                  </div>
                  <h2 className="text-lg font-semibold">Messages</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <MessagesModalContent onClose={onClose} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
