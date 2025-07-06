"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react"
import type { Conversation, Message, User } from "@/components/messages/types"
import { supabase, dbHelpers } from "@/lib/supabase"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

interface WindowPosition {
  x: number
  y: number
}

// Utility functions for performance optimization
const TYPING_DEBOUNCE_TIME = 1000 // 1 second
const MESSAGE_BATCH_SIZE = 20 // Load messages in batches
const CONVERSATION_CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes

// Debounce function for typing indicators
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Split into 3 separate contexts for better performance
interface ChatStateContextType {
  conversations: Map<string, Conversation>
  currentUser: User | null
  loading: boolean
  totalUnreadCount: number
}

interface ChatUIContextType {
  openChatWindows: string[]
  minimizedChatWindows: string[]
  activeConversation: string | null
  isDropdownOpen: boolean
  windowPositions: Record<string, WindowPosition>
}

interface ChatActionsContextType {
  openChatWindow: (conversationId: string) => void
  closeChatWindow: (conversationId: string) => void
  minimizeChatWindow: (conversationId: string) => void
  maximizeChatWindow: (conversationId: string) => void
  setActiveConversation: (conversationId: string | null) => void
  toggleDropdown: () => void
  closeDropdown: () => void
  sendMessage: (conversationId: string, text: string, attachments?: any[]) => Promise<void>
  getConversationById: (conversationId: string) => Conversation | undefined
  updateWindowPosition: (conversationId: string, position: WindowPosition) => void
  rearrangeAllWindows: () => void
  loadConversations: () => Promise<void>
  cleanupOldConversations: () => void
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void
}

// Create separate contexts
const ChatStateContext = createContext<ChatStateContextType | undefined>(undefined)
const ChatUIContext = createContext<ChatUIContextType | undefined>(undefined)
const ChatActionsContext = createContext<ChatActionsContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // State management
  const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map())
  const [openChatWindows, setOpenChatWindows] = useState<string[]>([])
  const [minimizedChatWindows, setMinimizedChatWindows] = useState<string[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [windowPositions, setWindowPositions] = useState<Record<string, WindowPosition>>({})
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Realtime subscriptions management
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map())
  const globalChannelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Memoized computed values
  const totalUnreadCount = useMemo(() => {
    let total = 0
    conversations.forEach(conv => {
      total += conv.unreadCount
    })
    return total
  }, [conversations])

  // Memoized conversations array for performance
  const conversationsArray = useMemo(() => {
    return Array.from(conversations.values()).sort((a, b) => {
      const aTime = a.lastMessage?.timestamp?.getTime() || 0
      const bTime = b.lastMessage?.timestamp?.getTime() || 0
      return bTime - aTime // Sort by most recent message
    })
  }, [conversations])

  // Handle realtime message events - optimized
  const handleNewMessage = useCallback(async (messageData: any) => {
    try {
      console.log('📨 Realtime message received:', messageData);
      
      // Create message object directly without fetching user data 
      // (user data should already be available in conversation participants)
      const newMessage: Message = {
        id: messageData.id,
        senderId: messageData.sender_id,
        text: messageData.content || '',
        timestamp: new Date(messageData.created_at),
        status: "delivered",
        attachments: messageData.media_url ? [{ url: messageData.media_url, type: 'image' }] : [],
        reactions: [],
      }

      console.log('📝 Converted to message object:', newMessage);

      setConversations(prev => {
        const newConversations = new Map(prev)
        const conversation = newConversations.get(messageData.conversation_id)
        
        if (conversation) {
          // Check if message already exists to avoid duplicates - more efficient check
          const messageExists = conversation.messages.some(msg => msg.id === messageData.id)
          if (messageExists) {
            console.log('⚠️ Message already exists, skipping:', messageData.id);
            return prev
          }

          // Optimized optimistic message replacement logic
          const isFromCurrentUser = messageData.sender_id === currentUser?.id
          let updatedMessages = [...conversation.messages]
          
          if (isFromCurrentUser && currentUser) {
            // Look for optimistic message to replace (more efficient)
            const optimisticIndex = conversation.messages.findIndex(msg => 
              msg.id.startsWith('temp-') && 
              msg.senderId === currentUser.id &&
              Math.abs(msg.timestamp.getTime() - new Date(messageData.created_at).getTime()) < 10000
            )
            
            if (optimisticIndex !== -1) {
              console.log('🔄 Replacing optimistic message at index:', optimisticIndex);
              updatedMessages[optimisticIndex] = newMessage
            } else {
              console.log('➕ Adding new message from current user (no optimistic found)');
              updatedMessages.push(newMessage)
            }
          } else {
            console.log('➕ Adding new message from other user');
            updatedMessages.push(newMessage)
          }

          // Calculate unread count - only increment if sender is not current user
          const newUnreadCount = isFromCurrentUser ? conversation.unreadCount : conversation.unreadCount + 1

          console.log('✅ Adding realtime message to conversation:', messageData.conversation_id);
          const updatedConversation = {
            ...conversation,
            messages: updatedMessages,
            lastMessage: newMessage,
            unreadCount: newUnreadCount
          }

          newConversations.set(messageData.conversation_id, updatedConversation)
          console.log('✅ Updated conversation with new message');
        } else {
          console.log('❌ Conversation not found for realtime message:', messageData.conversation_id);
        }
        
        return newConversations
      })

      // Play notification sound for messages from others (optional)
      if (messageData.sender_id !== currentUser?.id) {
        // Could add notification sound here
        console.log('🔔 New message from another user')
      }

    } catch (error) {
      console.error('❌ Error handling new message:', error)
    }
  }, [currentUser])

  const handleMessageUpdate = useCallback((messageData: any) => {
    setConversations(prev => {
      const newConversations = new Map(prev)
      const conversation = newConversations.get(messageData.conversation_id)
      
      if (conversation) {
        const updatedMessages = conversation.messages.map(msg => 
          msg.id === messageData.id 
            ? {
                ...msg,
                text: messageData.content || msg.text,
                status: "delivered" as const
              }
            : msg
        )

        newConversations.set(messageData.conversation_id, {
          ...conversation,
          messages: updatedMessages
        })
      }
      
      return newConversations
    })
  }, [])

  const handleReadStatusUpdate = useCallback((conversationId: string, lastReadAt: string) => {
    setConversations(prev => {
      const newConversations = new Map(prev)
      const conversation = newConversations.get(conversationId)
      
      if (conversation) {
        // Recalculate unread count based on new read timestamp
        const lastReadDate = new Date(lastReadAt)
        const unreadCount = conversation.messages.filter(msg => 
          msg.timestamp > lastReadDate && msg.senderId !== currentUser?.id
        ).length

        newConversations.set(conversationId, {
          ...conversation,
          unreadCount
        })
      }
      
      return newConversations
    })
  }, [currentUser])

  const handleTypingEvent = useCallback((payload: any) => {
    const { userId, isTyping, conversationId } = payload
    
    // Don't show typing indicator for current user
    if (userId === currentUser?.id) return

    setConversations(prev => {
      const newConversations = new Map(prev)
      const conversation = newConversations.get(conversationId)
      
      if (conversation) {
        newConversations.set(conversationId, {
          ...conversation,
          isTyping: isTyping
        })
      }
      
      return newConversations
    })
  }, [currentUser])

  // Track retry attempts and subscription state to prevent infinite loops
  const retryAttemptsRef = useRef<Map<string, number>>(new Map())
  const globalRetryAttemptsRef = useRef<number>(0)
  const isCleaningUpRef = useRef<boolean>(false)
  const setupInProgressRef = useRef<boolean>(false)

  // Individual conversation subscription setup
  const setupConversationSubscription = useCallback((conversationId: string, retryCount: number = 0) => {
    if (!currentUser || isCleaningUpRef.current) return

    // Check if we already have a subscription for this conversation
    const existingChannel = channelsRef.current.get(conversationId)
    if (existingChannel) {
      console.log(`📡 Channel already exists for conversation ${conversationId}, skipping`)
      return
    }

    // Check retry limit
    const currentRetries = retryAttemptsRef.current.get(conversationId) || 0
    if (currentRetries >= 3) {
      console.error(`❌ Max retry attempts reached for conversation ${conversationId}`)
      return
    }

    console.log(`💬 Setting up subscription for conversation ${conversationId} (attempt ${currentRetries + 1})`)
    
    const channel = supabase
      .channel(`conversation-${conversationId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: currentUser.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('💬 New message received:', payload)
          handleNewMessage(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('💬 Message updated:', payload)
          handleMessageUpdate(payload.new)
        }
      )
      .on(
        'broadcast',
        { event: 'typing' },
        (payload) => {
          console.log('⌨️ Typing event received:', payload)
          handleTypingEvent(payload.payload)
        }
      )
      .subscribe((status, err) => {
        console.log(`💬 Conversation ${conversationId} subscription status:`, status, err)
        
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Successfully subscribed to conversation ${conversationId}`)
          // Reset retry count on successful subscription
          retryAttemptsRef.current.delete(conversationId)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error(`❌ Failed to subscribe to conversation ${conversationId}:`, status, err)
          
          // Don't retry if we're cleaning up
          if (isCleaningUpRef.current) {
            console.log('🧹 Skipping retry due to cleanup in progress')
            return
          }
          
          // Clean up failed channel reference only
          channelsRef.current.delete(conversationId)
          
          // Update retry count
          const retries = retryAttemptsRef.current.get(conversationId) || 0
          retryAttemptsRef.current.set(conversationId, retries + 1)
          
          // Retry with exponential backoff if under limit
          if (retries < 2) {
            const retryDelay = Math.min(2000 * Math.pow(2, retries), 8000)
            console.log(`🔄 Retrying subscription for conversation ${conversationId} in ${retryDelay}ms (attempt ${retries + 2}/3)`)
            setTimeout(() => {
              if (!isCleaningUpRef.current) {
                setupConversationSubscription(conversationId, retries + 1)
              }
            }, retryDelay)
          } else {
            console.error(`❌ Max retry attempts reached for conversation ${conversationId}`)
            retryAttemptsRef.current.delete(conversationId)
          }
        }
      })

    channelsRef.current.set(conversationId, channel)
  }, [currentUser, handleNewMessage, handleMessageUpdate, handleTypingEvent])

  const cleanupRealtimeSubscriptions = useCallback(() => {
    if (isCleaningUpRef.current) {
      console.log('🧹 Cleanup already in progress, skipping')
      return
    }
    
    console.log('🧹 Starting cleanup of realtime subscriptions')
    isCleaningUpRef.current = true
    
    try {
      // Cleanup individual conversation channels
      const channelEntries = Array.from(channelsRef.current.entries())
      channelEntries.forEach(([conversationId, channel]) => {
        console.log(`🧹 Cleaning up subscription for conversation ${conversationId}`)
        try {
          // Unsubscribe first to prevent callbacks during removal
          channel.unsubscribe()
          supabase.removeChannel(channel)
        } catch (error) {
          console.error(`Error cleaning up channel ${conversationId}:`, error)
        }
      })
      channelsRef.current.clear()

      // Cleanup global channel
      if (globalChannelRef.current) {
        console.log('🧹 Cleaning up global chat subscription')
        try {
          globalChannelRef.current.unsubscribe()
          supabase.removeChannel(globalChannelRef.current)
        } catch (error) {
          console.error('Error cleaning up global channel:', error)
        }
        globalChannelRef.current = null
      }

      // Clear all typing timeouts
      typingTimeoutsRef.current.forEach((timeout) => {
        clearTimeout(timeout)
      })
      typingTimeoutsRef.current.clear()

      // Clear retry attempts
      retryAttemptsRef.current.clear()
      globalRetryAttemptsRef.current = 0
      
      console.log('🧹 Cleanup completed successfully')
    } catch (error) {
      console.error('Error during cleanup:', error)
    } finally {
      // Always reset cleanup flag
      setTimeout(() => {
        isCleaningUpRef.current = false
      }, 1000) // Small delay to ensure all operations complete
    }
  }, [])

  // Realtime subscriptions setup (defined after cleanup for better organization)
  const setupRealtimeSubscriptions = useCallback(async () => {
    if (!currentUser || isCleaningUpRef.current || setupInProgressRef.current) {
      console.log('🔔 Skipping realtime setup - user not ready or setup in progress')
      return
    }

    setupInProgressRef.current = true

    try {
      // Clean up existing subscriptions and wait for completion
      await new Promise<void>((resolve) => {
        cleanupRealtimeSubscriptions()
        // Wait for cleanup to complete
        const checkCleanup = () => {
          if (!isCleaningUpRef.current) {
            resolve()
          } else {
            setTimeout(checkCleanup, 100)
          }
        }
        checkCleanup()
      })

      console.log('🔔 Setting up realtime subscriptions for user:', currentUser.id)

      // Set up global subscription for conversation participants updates
      const globalChannel = supabase
        .channel('global-chat-updates', {
          config: {
            broadcast: { self: false },
            presence: { key: currentUser.id }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversation_participants',
            filter: `user_id=eq.${currentUser.id}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            console.log('🔔 Global participant update:', payload)
            
            if (payload.eventType === 'UPDATE' && payload.new?.last_read_at !== payload.old?.last_read_at) {
              handleReadStatusUpdate(payload.new.conversation_id, payload.new.last_read_at)
            } else if (payload.eventType === 'INSERT') {
              // Reload conversations when new ones are added
              // Use a ref to avoid circular dependency
              setLoading(true)
              setTimeout(() => {
                // Trigger a reload without circular dependency
                window.dispatchEvent(new CustomEvent('reloadConversations'))
              }, 100)
            }
          }
        )
        .subscribe((status, err) => {
          console.log('🔔 Global chat subscription status:', status, err)
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Global chat subscription established')
            globalRetryAttemptsRef.current = 0 // Reset retry count on success
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error('❌ Global chat subscription failed:', status, err)
            
            // Don't retry if we're cleaning up or already retrying too much
            if (isCleaningUpRef.current || globalRetryAttemptsRef.current >= 3) {
              console.log('🔔 Skipping global retry due to cleanup or max attempts reached')
              return
            }
            
            globalRetryAttemptsRef.current++
            const retryDelay = Math.min(3000 * globalRetryAttemptsRef.current, 15000)
            
            console.log(`🔄 Retrying global chat subscription in ${retryDelay}ms (attempt ${globalRetryAttemptsRef.current}/3)`)
            setTimeout(() => {
              if (!isCleaningUpRef.current && !setupInProgressRef.current) {
                setupRealtimeSubscriptions()
              }
            }, retryDelay)
          }
        })

      globalChannelRef.current = globalChannel

      console.log(`🔔 Global subscription set up, will handle individual conversations via events`)

    } catch (error) {
      console.error('❌ Error setting up realtime subscriptions:', error)
      
      // Only retry if not cleaning up and under retry limit
      if (!isCleaningUpRef.current && globalRetryAttemptsRef.current < 3) {
        globalRetryAttemptsRef.current++
        const retryDelay = Math.min(3000 * globalRetryAttemptsRef.current, 15000)
        
        console.log(`🔄 Retrying realtime subscriptions after error in ${retryDelay}ms (attempt ${globalRetryAttemptsRef.current}/3)`)
        setTimeout(() => {
          if (!isCleaningUpRef.current && !setupInProgressRef.current) {
            setupRealtimeSubscriptions()
          }
        }, retryDelay)
      }
    } finally {
      setupInProgressRef.current = false
    }
  }, [currentUser, conversations, handleReadStatusUpdate, setupConversationSubscription, cleanupRealtimeSubscriptions])

  // Load conversations (optimized with useCallback)
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get current user
      const user = await dbHelpers.getCurrentUser()
      if (!user) {
        setLoading(false)
        return
      }

      const currentUserObj = {
        id: user.id,
        name: user.name || "You",
        avatar: user.avatar || "/placeholder.svg?height=200&width=200",
        status: "online" as const,
        lastActive: new Date(user.last_active || Date.now()),
      }
      
      setCurrentUser(currentUserObj)

      // Get user's conversations from conversation_participants table
      const { data: conversationParticipants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          role,
          joined_at,
          last_read_at,
          conversations!inner(
            id,
            title,
            status,
            last_message_at,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false })

      if (participantsError) {
        console.error('❌ ChatContext: Error loading conversation participants:', participantsError)
        setConversations(new Map())
        setLoading(false)
        return
      }

      if (!conversationParticipants || conversationParticipants.length === 0) {
        setConversations(new Map())
        setLoading(false)
        return
      }

      const conversationMap = new Map<string, Conversation>()
      
      // Process conversations in parallel but limit to avoid overwhelming
      const batchSize = 5
      for (let i = 0; i < conversationParticipants.length; i += batchSize) {
        const batch = conversationParticipants.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (participant: any) => {
          const conversation = Array.isArray(participant.conversations) 
            ? participant.conversations[0] 
            : participant.conversations
          if (!conversation) return null

          try {
            // Get messages for this conversation - optimized with batch loading
            const { data: messagesData, error: messagesError } = await supabase
              .from('conversation_messages')
              .select(`
                id,
                content,
                sender_id,
                created_at,
                message_type,
                media_url
              `)
              .eq('conversation_id', conversation.id)
              .order('created_at', { ascending: false })
              .limit(MESSAGE_BATCH_SIZE) // Use configurable batch size

            if (messagesError) {
              console.error(`Error loading messages for conversation ${conversation.id}:`, messagesError)
              return null
            }

            // Get other participants with their profile data
            const { data: participantIds, error: participantIdsError } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', conversation.id)
              .neq('user_id', user.id)

            let otherParticipants = []
            if (participantIds && participantIds.length > 0) {
              // Get user details with profiles for each participant
              for (const p of participantIds) {
                const { data: userWithProfile, error: userError } = await supabase
                  .from('users')
                  .select(`
                    id,
                    email,
                    last_active,
                    profiles!inner(
                      full_name,
                      username,
                      avatar_url
                    )
                  `)
                  .eq('id', p.user_id)
                  .single()

                if (userWithProfile && !userError && userWithProfile.profiles && userWithProfile.profiles.length > 0) {
                  const profile = userWithProfile.profiles[0]
                  otherParticipants.push({
                    user_id: p.user_id,
                    user: {
                      id: userWithProfile.id,
                      name: profile.full_name || profile.username || userWithProfile.email,
                      avatar: profile.avatar_url || "/placeholder.svg?height=200&width=200",
                      last_active: userWithProfile.last_active || new Date().toISOString()
                    }
                  })
                } else {
                  console.log(`⚠️ Could not fetch profile for user ${p.user_id}:`, userError)
                  // Create a fallback participant
                  otherParticipants.push({
                    user_id: p.user_id,
                    user: {
                      id: p.user_id,
                      name: `User ${p.user_id.slice(0, 8)}`,
                      avatar: "/placeholder.svg?height=200&width=200",
                      last_active: new Date().toISOString()
                    }
                  })
                }
              }
            }

            const participants: User[] = []
            
            // Add current user
            participants.push({
              id: user.id,
              name: user.name || "You",
              avatar: user.avatar || "/placeholder.svg?height=200&width=200",
              status: "online",
              lastActive: new Date(user.last_active || Date.now()),
            })

            // Add other participants
            if (otherParticipants) {
              otherParticipants.forEach((p: any) => {
                if (p.user) {
                  const participant = {
                    id: p.user.id,
                    name: p.user.name || "Unknown User",
                    avatar: p.user.avatar || "/placeholder.svg?height=200&width=200",
                    status: "offline", // Could be enhanced with real-time status
                    lastActive: new Date(p.user.last_active || Date.now()),
                  }
                  participants.push(participant)
                }
              })
            }

            const messages: Message[] = messagesData?.map((msg: any) => ({
              id: msg.id,
              senderId: msg.sender_id,
              text: msg.content || '',
              timestamp: new Date(msg.created_at),
              status: "read" as const,
              attachments: msg.media_url ? [{ url: msg.media_url, type: 'image' }] : [],
              reactions: [],
            })).reverse() || [] // Reverse to get chronological order

            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

            // Calculate unread count based on last_read_at from current participant record
            const currentParticipantLastRead = new Date(participant.last_read_at || 0)
            const unreadCount = messages.filter(msg => 
              msg.timestamp > currentParticipantLastRead && msg.senderId !== user.id
            ).length

            return {
              id: conversation.id,
              participants,
              messages,
              unreadCount,
              lastMessage,
              isTyping: false,
            }
          } catch (error) {
            console.error(`Error processing conversation ${conversation.id}:`, error)
            return null
          }
        })

        const batchResults = await Promise.all(batchPromises)
        batchResults.forEach(conv => {
          if (conv) {
            conversationMap.set(conv.id, conv)
          }
        })
      }

      setConversations(conversationMap)
      
      // Set up realtime subscriptions directly after conversations are loaded
      console.log('🔔 Setting up realtime subscriptions after loading conversations...');
      setTimeout(async () => {
        // First set up global subscription
        await setupRealtimeSubscriptions()
        
        // Then set up individual conversation subscriptions
        setTimeout(() => {
          console.log('🔔 Setting up individual conversation subscriptions...');
          conversationMap.forEach((conversation, conversationId) => {
            if (!channelsRef.current.has(conversationId)) {
              console.log(`🔔 Setting up subscription for conversation ${conversationId}`);
              setupConversationSubscription(conversationId)
            }
          })
        }, 1000) // Give global subscription time to establish
      }, 500) // Give React time to update state
      
    } catch (error) {
      console.error('❌ ChatContext: Error loading conversations:', error)
      setConversations(new Map())
    } finally {
      setLoading(false)
    }
  }, [])

  // Optimized cleanup for memory management
  const cleanupOldConversations = useCallback(() => {
    const maxConversations = 30 // Reduced for better performance
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days (reduced from 30)
    const now = Date.now()

    setConversations(prevConversations => {
      if (prevConversations.size <= maxConversations) {
        return prevConversations // No cleanup needed
      }

      const newConversations = new Map()
      
      // Use memoized array if available for better performance
      const sortedEntries = Array.from(prevConversations.entries())
        .sort((a, b) => {
          const aTime = a[1].lastMessage?.timestamp?.getTime() || 0
          const bTime = b[1].lastMessage?.timestamp?.getTime() || 0
          return bTime - aTime
        })
        .slice(0, maxConversations) // Keep only top conversations

      // Filter by age and activity
      for (const [id, conv] of sortedEntries) {
        const lastMessageTime = conv.lastMessage?.timestamp?.getTime() || 0
        const isRecent = now - lastMessageTime < maxAge
        const hasUnread = conv.unreadCount > 0
        const isActive = openChatWindows.includes(id) || minimizedChatWindows.includes(id)
        
        // Keep conversation if it's recent, has unread messages, or is actively being used
        if (isRecent || hasUnread || isActive) {
          newConversations.set(id, conv)
        }
      }

      console.log(`🧹 Cleaned up conversations: ${prevConversations.size} → ${newConversations.size}`)
      return newConversations
    })
  }, [openChatWindows, minimizedChatWindows])

  // Window position management
  const calculateNewWindowPosition = useCallback((conversationId: string): WindowPosition => {
    // Default position for the first window
    if (Object.keys(windowPositions).length === 0) {
      return {
        x: Math.max(80, Math.min(window.innerWidth - 380, window.innerWidth / 2 - 175)),
        y: Math.max(0, Math.min(window.innerHeight - 450, window.innerHeight / 2 - 225)),
      }
    }

    // If this window already has a position, return it
    if (windowPositions[conversationId]) {
      return windowPositions[conversationId]
    }

    // Find a position that doesn't overlap with existing windows
    const existingPositions = Object.values(windowPositions)
    const windowWidth = 350
    const windowHeight = 450
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const padding = 20

    // Simplified position calculation for better performance
    const cols = Math.floor((screenWidth - padding) / (windowWidth + padding))
    const rows = Math.floor((screenHeight - padding) / (windowHeight + padding))
    const totalPositions = cols * rows

    // Use modulo to cycle through positions
    const positionIndex = Object.keys(windowPositions).length % totalPositions
    const row = Math.floor(positionIndex / cols)
    const col = positionIndex % cols

    return {
      x: padding + col * (windowWidth + padding),
      y: padding + row * (windowHeight + padding),
    }
  }, [windowPositions])

  // Mark conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!currentUser) return

    try {
      // Update last_read_at in database
      const { error } = await supabase
        .from('conversation_participants')
        .update({ 
          last_read_at: new Date().toISOString() 
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUser.id)

      if (error) {
        console.error('Error marking conversation as read:', error)
        return
      }

      // Update local state to clear unread count
      setConversations(prev => {
        const newConversations = new Map(prev)
        const conversation = newConversations.get(conversationId)
        if (conversation) {
          newConversations.set(conversationId, {
            ...conversation,
            unreadCount: 0
          })
        }
        return newConversations
      })
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }, [currentUser])

  // Memoized actions
  const updateWindowPosition = useCallback((conversationId: string, position: WindowPosition) => {
    setWindowPositions((prev) => ({
      ...prev,
      [conversationId]: position,
    }))

    // Save position to localStorage (debounced)
    setTimeout(() => {
      try {
        const savedPositions = JSON.parse(localStorage.getItem("chatWindowPositions") || "{}")
        localStorage.setItem(
          "chatWindowPositions",
          JSON.stringify({
            ...savedPositions,
            [conversationId]: position,
          })
        )
      } catch (error) {
        console.error('Error saving window position:', error)
      }
    }, 100)
  }, [])

  const openChatWindow = useCallback(async (conversationId: string) => {
    setOpenChatWindows(prev => {
      if (prev.includes(conversationId)) return prev
      return [...prev, conversationId]
    })
    
    setMinimizedChatWindows(prev => prev.filter(id => id !== conversationId))
    setActiveConversation(conversationId)

    // Calculate position if not exists
    if (!windowPositions[conversationId]) {
      const position = calculateNewWindowPosition(conversationId)
      updateWindowPosition(conversationId, position)
    }

    // Mark conversation as read when opened
    await markConversationAsRead(conversationId)
  }, [windowPositions, calculateNewWindowPosition, updateWindowPosition, markConversationAsRead])

  const closeChatWindow = useCallback((conversationId: string) => {
    setOpenChatWindows(prev => prev.filter(id => id !== conversationId))
    setMinimizedChatWindows(prev => prev.filter(id => id !== conversationId))
    setActiveConversation(prev => prev === conversationId ? null : prev)
  }, [])

  const minimizeChatWindow = useCallback((conversationId: string) => {
    setOpenChatWindows(prev => prev.filter(id => id !== conversationId))
    setMinimizedChatWindows(prev => {
      if (prev.includes(conversationId)) return prev
      return [...prev, conversationId]
    })
    setActiveConversation(prev => prev === conversationId ? null : prev)
  }, [])

  const maximizeChatWindow = useCallback((conversationId: string) => {
    setMinimizedChatWindows(prev => prev.filter(id => id !== conversationId))
    setOpenChatWindows(prev => {
      if (prev.includes(conversationId)) return prev
      return [...prev, conversationId]
    })
    setActiveConversation(conversationId)
  }, [])

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev)
  }, [])

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false)
  }, [])

  const getConversationById = useCallback((conversationId: string) => {
    return conversations.get(conversationId)
  }, [conversations])

  const sendMessage = useCallback(async (conversationId: string, text: string, attachments?: any[]) => {
    try {
      if (!currentUser) {
        throw new Error('No current user')
      }

      // Create optimistic message for immediate UI feedback
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`, // Temporary ID
        senderId: currentUser.id,
        text,
        timestamp: new Date(),
        status: "sending",
        attachments: attachments || [],
        reactions: [],
      }

      // Update UI immediately with optimistic message
      setConversations(prev => {
        const newConversations = new Map(prev)
        const conversation = newConversations.get(conversationId)
        if (conversation) {
          newConversations.set(conversationId, {
            ...conversation,
            messages: [...conversation.messages, optimisticMessage],
            lastMessage: optimisticMessage,
          })
        }
        return newConversations
      })

      // Create message in database
      const { data: messageData, error: messageError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: text,
          message_type: 'text',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (messageError) {
        // Remove optimistic message on error
        setConversations(prev => {
          const newConversations = new Map(prev)
          const conversation = newConversations.get(conversationId)
          if (conversation) {
            newConversations.set(conversationId, {
              ...conversation,
              messages: conversation.messages.filter(msg => msg.id !== optimisticMessage.id),
              lastMessage: conversation.messages[conversation.messages.length - 2] || null,
            })
          }
          return newConversations
        })
        throw messageError
      }

      // Replace optimistic message with real message
      setConversations(prev => {
        const newConversations = new Map(prev)
        const conversation = newConversations.get(conversationId)
        if (conversation) {
          const updatedMessages = conversation.messages.map(msg => 
            msg.id === optimisticMessage.id 
              ? {
                  ...msg,
                  id: messageData.id,
                  status: "sent" as const,
                }
              : msg
          )
          
          newConversations.set(conversationId, {
            ...conversation,
            messages: updatedMessages,
            lastMessage: updatedMessages[updatedMessages.length - 1],
          })
        }
        return newConversations
      })

      // Update last_message_at in conversations table
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }, [currentUser])

  // Optimized typing indicator with debounce
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (!currentUser) return

    const channel = channelsRef.current.get(conversationId)
    if (!channel) return

    // Debounced typing start - only send after user stops typing for a moment
    const sendTypingEvent = (typing: boolean) => {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: typing,
          conversationId
        }
      })
    }

    if (isTyping) {
      // Clear any existing timeout
      const existingTimeout = typingTimeoutsRef.current.get(conversationId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Send typing immediately for responsiveness
      sendTypingEvent(true)

      // Set timeout to automatically stop typing after reduced time
      const timeout = setTimeout(() => {
        sendTypingEvent(false)
        typingTimeoutsRef.current.delete(conversationId)
      }, TYPING_DEBOUNCE_TIME)

      typingTimeoutsRef.current.set(conversationId, timeout)
    } else {
      // Send typing stop event immediately
      sendTypingEvent(false)

      // Clear timeout
      const existingTimeout = typingTimeoutsRef.current.get(conversationId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
        typingTimeoutsRef.current.delete(conversationId)
      }
    }
  }, [currentUser])

  const rearrangeAllWindows = useCallback(() => {
    const windowWidth = 350
    const windowHeight = 450
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const padding = 20

    const cols = Math.floor((screenWidth - padding) / (windowWidth + padding))
    
    const newPositions: Record<string, WindowPosition> = {}
    
    openChatWindows.forEach((conversationId, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      
      newPositions[conversationId] = {
        x: padding + col * (windowWidth + padding),
        y: padding + row * (windowHeight + padding),
      }
    })

    setWindowPositions(prev => ({ ...prev, ...newPositions }))
  }, [openChatWindows])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Handle conversation subscription setup - simplified approach
  useEffect(() => {
    if (currentUser && conversations.size > 0 && !isCleaningUpRef.current) {
      console.log('🔔 Checking conversation subscriptions...');
      
      // Set up subscriptions for conversations that don't have them yet
      conversations.forEach((conversation, conversationId) => {
        if (!channelsRef.current.has(conversationId)) {
          console.log(`🔔 Setting up missing subscription for conversation ${conversationId}`)
          setupConversationSubscription(conversationId)
        }
      })
    }
  }, [currentUser, conversations.size, setupConversationSubscription]) // Use size instead of full conversations object

  // Clean up subscriptions for conversations that no longer exist
  useEffect(() => {
    if (conversations.size > 0) {
      const currentConversationIds = new Set(conversations.keys())
      const channelEntries = Array.from(channelsRef.current.entries())
      channelEntries.forEach(([conversationId, channel]) => {
        if (!currentConversationIds.has(conversationId)) {
          console.log(`🧹 Removing subscription for conversation ${conversationId}`)
          try {
            channel.unsubscribe()
            supabase.removeChannel(channel)
          } catch (error) {
            console.error(`Error removing channel ${conversationId}:`, error)
          }
          channelsRef.current.delete(conversationId)
          retryAttemptsRef.current.delete(conversationId)
        }
      })
    }
  }, [conversations])

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 ChatProvider unmounting, cleaning up all subscriptions')
      cleanupRealtimeSubscriptions()
    }
  }, [cleanupRealtimeSubscriptions])

  // Optimized periodic cleanup with configurable interval
  useEffect(() => {
    const cleanup = setInterval(cleanupOldConversations, CONVERSATION_CLEANUP_INTERVAL)
    return () => clearInterval(cleanup)
  }, [cleanupOldConversations])

  // Load saved window positions
  useEffect(() => {
    try {
      const savedPositions = JSON.parse(localStorage.getItem("chatWindowPositions") || "{}")
      setWindowPositions(savedPositions)
    } catch (error) {
      console.error('Error loading saved window positions:', error)
    }
  }, [])

  // Memoized context values
  const stateValue = useMemo(() => ({
    conversations,
    currentUser,
    loading,
    totalUnreadCount,
  }), [conversations, currentUser, loading, totalUnreadCount])

  const uiValue = useMemo(() => ({
    openChatWindows,
    minimizedChatWindows,
    activeConversation,
    isDropdownOpen,
    windowPositions,
  }), [openChatWindows, minimizedChatWindows, activeConversation, isDropdownOpen, windowPositions])

  const actionsValue = useMemo(() => ({
    openChatWindow,
    closeChatWindow,
    minimizeChatWindow,
    maximizeChatWindow,
    setActiveConversation,
    toggleDropdown,
    closeDropdown,
    sendMessage,
    getConversationById,
    updateWindowPosition,
    rearrangeAllWindows,
    loadConversations,
    cleanupOldConversations,
    sendTypingIndicator,
  }), [
    openChatWindow,
    closeChatWindow,
    minimizeChatWindow,
    maximizeChatWindow,
    toggleDropdown,
    closeDropdown,
    sendMessage,
    getConversationById,
    updateWindowPosition,
    rearrangeAllWindows,
    loadConversations,
    cleanupOldConversations,
    sendTypingIndicator,
  ])

  return (
    <ChatStateContext.Provider value={stateValue}>
      <ChatUIContext.Provider value={uiValue}>
        <ChatActionsContext.Provider value={actionsValue}>
          {children}
        </ChatActionsContext.Provider>
      </ChatUIContext.Provider>
    </ChatStateContext.Provider>
  )
}

// Custom hooks for separate contexts
export function useChatState() {
  const context = useContext(ChatStateContext)
  if (context === undefined) {
    throw new Error("useChatState must be used within a ChatProvider")
  }
  return context
}

export function useChatUI() {
  const context = useContext(ChatUIContext)
  if (context === undefined) {
    throw new Error("useChatUI must be used within a ChatProvider")
  }
  return context
}

export function useChatActions() {
  const context = useContext(ChatActionsContext)
  if (context === undefined) {
    throw new Error("useChatActions must be used within a ChatProvider")
  }
  return context
}

// Optimized backward compatibility hook
export function useChat() {
  const state = useChatState()
  const ui = useChatUI()
  const actions = useChatActions()
  
  // Use memoized conversations array for better performance
  const conversationsArray = useMemo(() => {
    return Array.from(state.conversations.values()).sort((a, b) => {
      const aTime = a.lastMessage?.timestamp?.getTime() || 0
      const bTime = b.lastMessage?.timestamp?.getTime() || 0
      return bTime - aTime
    })
  }, [state.conversations])
  
  return {
    ...state,
    ...ui,
    ...actions,
    conversations: conversationsArray,
  }
}
