"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, X, UserPlus, MessageCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChat } from "@/contexts/chat-context-realtime"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase"
import { MessageErrorBoundary } from "./error-boundary"
import type { Conversation, User } from "@/components/messages/types"

function MessageDropdownContent() {
  const { conversations, isDropdownOpen, openChatWindow, closeDropdown, currentUser, loading, loadConversations } = useChat()
  const authContext = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasMoreUsers, setHasMoreUsers] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  // Helper function to get conversation title
  const getConversationTitle = useCallback((conv: Conversation) => {
    // Filter out current user from participants for title
    const otherParticipants = conv.participants.filter((p: User) => p.id !== currentUser?.id)
    return otherParticipants.map((p: User) => p.name).join(", ") || "Conversation"
  }, [currentUser])

  // Debug logging with performance monitoring - Cleanup version
  useEffect(() => {
    // Debug logging removed for production
  }, [loading, currentUser?.id, conversations?.length, authContext?.isAuthenticated])

  // Remove direct console.log outside useEffect to prevent infinite logs

  // Enhanced user loading with search and pagination
  const loadAvailableUsers = useCallback(async (searchTerm: string = '', page: number = 0) => {
    if (!currentUser || loadingUsers) return
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 loadAvailableUsers called:', { 
          searchTerm, 
          page, 
          currentUser: currentUser?.id,
          currentUserName: currentUser?.name
        })
      }
      setLoadingUsers(true)
      setError(null)
      
      const pageSize = 20
      const offset = page * pageSize
      
      // Check cache first
      if (availableUsers.length > 0 && page === 0 && !searchTerm) {
        // Don't reload if we already have users and no search
        setLoadingUsers(false)
        return
      }
      
      // Get existing conversation participants to exclude them
      const existingUserIds = new Set<string>()
      conversations.forEach(conv => {
        conv.participants.forEach(p => {
          if (p.id !== currentUser.id) {
            existingUserIds.add(p.id)
          }
        })
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Existing conversation user IDs to exclude:', Array.from(existingUserIds))
      }
      
      // Build query to get users with their profiles (optional)
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
      
      // Add search filters - search in both email and profile fields
      if (searchTerm.trim()) {
        // Search in email, profiles.full_name, and profiles.username
        query = query.or(`email.ilike.%${searchTerm}%,profiles.full_name.ilike.%${searchTerm}%,profiles.username.ilike.%${searchTerm}%`)
      }
      
      // If we have existing conversations, exclude those users from "Start New Chat"
      // Add option to disable exclude for testing
      const shouldExcludeExistingUsers = true // Re-enabled after fixing profile issues
      
      if (existingUserIds.size > 0 && shouldExcludeExistingUsers) {
        const existingUserIdsList = Array.from(existingUserIds)
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Excluding existing conversation users:', existingUserIdsList)
        }
        // Use individual .neq() for each ID since .not('in') has syntax issues
        existingUserIdsList.forEach(userId => {
          query = query.neq('id', userId)
        })
      } else if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Not excluding users - showing all available users for testing')
      }
      
      const { data: users, error } = await query
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 loadAvailableUsers result:', { 
          usersFound: users?.length || 0, 
          error: error?.message,
          searchTerm,
          page,
          totalUsersInDB: 'checking...'
        })
        
        // Also check total users in database for debugging
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .neq('id', currentUser.id)
          .eq('is_active', true)
        
        console.log('📊 Database stats:', {
          totalActiveUsers: count,
          existingConversationUsers: existingUserIds.size,
          availableForNewChat: (count || 0) - existingUserIds.size
        })
      }
      
      if (error) {
        console.error('Error loading users:', error)
        setError('Failed to load users. Please try again.')
        return
      }
      
      // Process users with validation - fix data mapping with fallbacks
      const newUsers: User[] = (users || [])
        .filter(user => {
          const shouldInclude = user?.id && user.id !== currentUser.id
          if (!shouldInclude) {
            console.log('🚫 Filtering out user:', { 
              userId: user?.id, 
              currentUserId: currentUser.id, 
              userEmail: user?.email,
              reason: !user?.id ? 'No user ID' : 'Same as current user'
            })
          }
          return shouldInclude
        })
        .map(user => {
          // Handle profiles data - could be an array or object depending on query
          const profile = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles
          const safeProfile = profile || {}
          
          // Use multiple fallbacks for display name
          const displayName = 
            user.name ||  // Direct name from users table
            safeProfile.full_name || 
            safeProfile.username || 
            user.email?.split('@')[0] || 
            'Unknown User'
            
          const avatarUrl = safeProfile.avatar_url || '/placeholder-user.jpg'
                   
          return {
            id: user.id,
            name: displayName,
            avatar: avatarUrl,
            status: 'offline' as const,
            lastActive: new Date(user.last_login || Date.now()),
          }
        })
      
      // Update state based on page
      if (page === 0) {
        setAvailableUsers(newUsers)
      } else {
        setAvailableUsers(prev => [...prev, ...newUsers])
      }
      
      setHasMoreUsers(newUsers.length === pageSize)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ loadAvailableUsers completed:', {
          newUsersCount: newUsers.length,
          totalAvailableUsers: page === 0 ? newUsers.length : availableUsers.length + newUsers.length
        })
      }
      
    } catch (error) {
      console.error('Error loading available users:', error)
      setError('An unexpected error occurred while loading users.')
    } finally {
      setLoadingUsers(false)
    }
  }, [currentUser, conversations, loadingUsers, availableUsers.length])
  
  // Search handler with debouncing
  const handleSearch = useCallback(async (term: string) => {
    setSearchTerm(term)
    setCurrentPage(0)
    await loadAvailableUsers(term, 0)
  }, [loadAvailableUsers])
  
  // Load more users for pagination
  const loadMoreUsers = useCallback(async () => {
    if (!hasMoreUsers || loadingUsers) return
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    await loadAvailableUsers(searchTerm, nextPage)
  }, [hasMoreUsers, loadingUsers, currentPage, searchTerm, loadAvailableUsers])

  // Create new conversation with comprehensive error handling
  const createConversation = useCallback(async (otherUser: User) => {
    if (!currentUser || creatingConversation) return
    
    try {
      setCreatingConversation(otherUser.id)
      setError(null)
      
      // Debug: Check auth status before creating conversation
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      console.log('🔍 Auth check before creating conversation:', {
        authUser: authUser?.email || 'No auth user',
        authError: authError?.message || 'No auth error',
        currentUser: currentUser?.name || currentUser?.id || 'No current user',
        userId: authUser?.id || 'No user ID'
      })
      
      if (!authUser) {
        throw new Error('User not authenticated. Please log in again.')
      }
      
      // Validate inputs
      if (!otherUser.id || !otherUser.name) {
        throw new Error('Invalid user data')
      }
      
      // Check if conversation already exists
      const existingConv = conversations.find(conv => 
        conv.participants.some(p => p.id === otherUser.id)
      )
      
      if (existingConv) {
        // Open existing conversation
        openChatWindow(existingConv.id)
        setShowNewChat(false)
        return
      }
      
      // Create new conversation with proper field mapping
      const conversationTitle = `Chat with ${otherUser.name}`
      const now = new Date().toISOString()
      
      console.log('🔧 Creating conversation with data:', {
        title: conversationTitle,
        status: 'active',
        created_at: now,
        updated_at: now,
        last_message_at: now
      })
      
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: conversationTitle,
          status: 'active',
          created_at: now,
          updated_at: now,
          last_message_at: now
        })
        .select()
        .single()
      
      if (convError) {
        console.error('Error creating conversation:', convError)
        console.error('Full error details:', {
          message: convError.message,
          details: convError.details,
          hint: convError.hint,
          code: convError.code
        })
        throw new Error(`Failed to create conversation: ${convError.message || 'Unknown database error'}`)
      }
      
      if (!conversation || !conversation.id) {
        throw new Error('Conversation created but no data returned')
      }
      
      console.log('✅ Conversation created successfully:', conversation.id)
      
      // Add participants with correct role value
      const participants = [
        {
          conversation_id: conversation.id,
          user_id: currentUser.id,
          role: 'participant', // Use 'participant' instead of 'member'
          joined_at: now,
          last_read_at: now
        },
        {
          conversation_id: conversation.id,
          user_id: otherUser.id,
          role: 'participant', // Use 'participant' instead of 'member'
          joined_at: now,
          last_read_at: now
        }
      ]
      
      console.log('🔧 Adding participants:', participants)
      
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants)
      
      if (participantsError) {
        console.error('Error adding participants:', participantsError)
        console.error('Full participant error details:', {
          message: participantsError.message,
          details: participantsError.details,
          hint: participantsError.hint,
          code: participantsError.code
        })
        
        // Try to cleanup the conversation
        await supabase.from('conversations').delete().eq('id', conversation.id)
        throw new Error(`Failed to add participants: ${participantsError.message || 'Unknown database error'}`)
      }
      
      console.log('✅ Participants added successfully')
      
      // Reload conversations to update UI
      if (loadConversations) {
        await loadConversations()
      }
      
      // Open the new conversation
      openChatWindow(conversation.id)
      setShowNewChat(false)
      
    } catch (error) {
      console.error('Error creating conversation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation'
      setError(errorMessage)
    } finally {
      setCreatingConversation(null)
    }
  }, [currentUser, conversations, openChatWindow, loadConversations, creatingConversation])

  // Load users when showing new chat with enhanced loading
  useEffect(() => {
    if (showNewChat && currentUser) {
      loadAvailableUsers('', 0)
    }
  }, [showNewChat, currentUser, loadAvailableUsers])

  // Debounced search effect
  useEffect(() => {
    if (!showNewChat) return
    
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== '') {
        handleSearch(searchTerm)
      }
    }, 300)
    
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, showNewChat, handleSearch])

  // Memoized filtered conversations for performance
  const filteredConversations = useMemo(() => {
    // Don't show any conversations if user is not authenticated or loaded
    if (!currentUser) {
      return []
    }

    // First filter conversations where current user is participant
    const validConversations = conversations.filter((conv) => {
      // Check if current user is a participant in this conversation
      const isParticipant = conv.participants.some((p: User) => p.id === currentUser.id)
      
      if (!isParticipant) {
        return false
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

    // Group conversations by other participant ID to remove duplicates
    const conversationMap = new Map()
    
    validConversations.forEach(conv => {
      const otherParticipant = conv.participants.find((p: User) => p.id !== currentUser.id)
      if (otherParticipant) {
        const existingConv = conversationMap.get(otherParticipant.id)
        
        // Keep the conversation with the most recent message
        if (!existingConv || 
            (conv.lastMessage && existingConv.lastMessage && 
             new Date(conv.lastMessage.timestamp) > new Date(existingConv.lastMessage.timestamp))) {
          conversationMap.set(otherParticipant.id, conv)
        } else if (!existingConv.lastMessage && conv.lastMessage) {
          // Prefer conversation with messages over empty ones
          conversationMap.set(otherParticipant.id, conv)
        }
      }
    })

    // Convert map back to array and sort by last message timestamp
    return Array.from(conversationMap.values()).sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    })
  }, [conversations, currentUser, searchQuery, getConversationTitle])

  // Memoized filtered available users for performance (server-side filtering is preferred)
  const filteredAvailableUsers = useMemo(() => {
    // Since we're doing server-side filtering now, just return the users
    // Client-side filtering is only for real-time search refinement
    return availableUsers
  }, [availableUsers])

  if (!isDropdownOpen) return null

  // Don't show dropdown if user is not authenticated
  if (!authContext?.isAuthenticated || !currentUser) {
    return null
  }

  if (loading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-[calc(100vw-120px)] sm:w-80 max-w-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 rounded-xl shadow-xl z-[9999]"
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
        className="absolute right-0 top-full mt-2 w-[calc(100vw-120px)] sm:w-80 max-w-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 rounded-xl shadow-xl z-[9999] overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 dark:border-gray-800/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {showNewChat ? 'Start New Chat' : 'Messages'}
            </h3>
            <div className="flex items-center space-x-2">
              {showNewChat ? (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setShowNewChat(false)
                    setSearchQuery("")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                  onClick={() => setShowNewChat(true)}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={showNewChat ? "Search..." : "Search..."}
              value={showNewChat ? searchTerm : searchQuery}
              onChange={(e) => showNewChat ? setSearchTerm(e.target.value) : setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 text-sm"
            />
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {showNewChat ? (
            // Show available users for new chat
            <>
              {loadingUsers && availableUsers.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neo-mint dark:border-purist-blue mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
                </div>
              ) : filteredAvailableUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? (
                    <>
                      <p className="text-sm mb-2">No users found matching "{searchTerm}"</p>
                      <p className="text-xs">Try a different search term</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm mb-2">All users already have conversations</p>
                      <p className="text-xs">Check your existing conversations in "Messages"</p>
                    </>
                  )}
                </div>
              ) : (
                filteredAvailableUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    className="p-3 border-b border-white/5 dark:border-gray-800/5 last:border-b-0 cursor-pointer"
                    onClick={() => createConversation(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white/20">
                        <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-xs sm:text-sm font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(user.lastActive, { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {creatingConversation === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neo-mint dark:border-purist-blue"></div>
                        ) : (
                          <MessageCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              {/* Load More Button */}
              {hasMoreUsers && !searchTerm && availableUsers.length > 0 && (
                <div className="p-3 border-t border-white/10 dark:border-gray-800/10">
                  <Button
                    onClick={loadMoreUsers}
                    disabled={loadingUsers}
                    variant="ghost"
                    className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {loadingUsers ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neo-mint dark:border-purist-blue"></div>
                        <span>Loading more users...</span>
                      </div>
                    ) : (
                      "Load More Users"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Show existing conversations
            <>
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
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Wrap with ErrorBoundary for better error handling
export default function MessageDropdown() {
  return (
    <MessageErrorBoundary>
      <MessageDropdownContent />
    </MessageErrorBoundary>
  )
}
