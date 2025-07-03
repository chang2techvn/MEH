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

  // Handle realtime message events
  const handleNewMessage = useCallback(async (messageData: any) => {
    try {
      console.log('📨 Realtime message received:', messageData);
      
      // Fetch sender information if not available
      let senderInfo = null
      if (messageData.sender_id) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, name, avatar')
          .eq('id', messageData.sender_id)
          .single()
        
        senderInfo = userData
      }

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
          // Check if message already exists by real ID
          const existingMessage = conversation.messages.find(msg => msg.id === messageData.id)
          if (existingMessage) {
            console.log('⚠️ Message already exists, skipping:', messageData.id);
            return prev
          }

          // Check if this is replacing an optimistic message from current user
          const isFromCurrentUser = messageData.sender_id === currentUser?.id
          let updatedMessages = [...conversation.messages]
          
          if (isFromCurrentUser && currentUser) {
            // Look for optimistic message to replace (temporary ID starting with 'temp-')
            const optimisticIndex = conversation.messages.findIndex(msg => 
              msg.id.startsWith('temp-') && 
              msg.senderId === currentUser.id &&
              Math.abs(msg.timestamp.getTime() - new Date(messageData.created_at).getTime()) < 10000 // Within 10 seconds
            )
            
            if (optimisticIndex !== -1) {
              console.log('🔄 Replacing optimistic message at index:', optimisticIndex);
              // Replace optimistic message with real message
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

  // Realtime subscriptions for chat
  const setupRealtimeSubscriptions = useCallback(async () => {
    if (!currentUser) return

    try {
      // Clean up existing subscriptions
      cleanupRealtimeSubscriptions()

      console.log('🔔 Setting up realtime subscriptions for', currentUser.id)

      // Set up global subscription for conversation participants updates
      // This helps us know when new conversations are created or when read status changes
      const globalChannel = supabase
        .channel('global-chat-updates')
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
            
            if (payload.eventType === 'UPDATE' && payload.new.last_read_at !== payload.old?.last_read_at) {
              // Read status was updated, refresh unread counts
              handleReadStatusUpdate(payload.new.conversation_id, payload.new.last_read_at)
            } else if (payload.eventType === 'INSERT') {
              // New conversation participation, reload conversations
              // Use setTimeout to avoid circular dependency
              setTimeout(() => {
                loadConversations() // Refetch conversations instead of full reload
              }, 100)
            }
          }
        )
        .subscribe((status) => {
          console.log('🔔 Global chat subscription status:', status)
        })

      globalChannelRef.current = globalChannel

    } catch (error) {
      console.error('❌ Error setting up realtime subscriptions:', error)
    }
  }, [currentUser, handleReadStatusUpdate])

  const setupConversationSubscription = useCallback((conversationId: string) => {
    if (!currentUser) return

    // Don't create duplicate subscriptions
    if (channelsRef.current.has(conversationId)) {
      return
    }

    console.log(`💬 Setting up subscription for conversation ${conversationId}`)

    const channel = supabase
      .channel(`conversation-${conversationId}`)
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
      .subscribe((status) => {
        console.log(`💬 Conversation ${conversationId} subscription status:`, status)
      })

    channelsRef.current.set(conversationId, channel)
  }, [currentUser, handleNewMessage, handleMessageUpdate, handleTypingEvent])

  const cleanupRealtimeSubscriptions = useCallback(() => {
    console.log('🧹 Cleaning up realtime subscriptions')
    
    // Cleanup individual conversation channels
    channelsRef.current.forEach((channel, conversationId) => {
      console.log(`🧹 Cleaning up subscription for conversation ${conversationId}`)
      supabase.removeChannel(channel)
    })
    channelsRef.current.clear()

    // Cleanup global channel
    if (globalChannelRef.current) {
      console.log('🧹 Cleaning up global chat subscription')
      supabase.removeChannel(globalChannelRef.current)
      globalChannelRef.current = null
    }

    // Clear all typing timeouts
    typingTimeoutsRef.current.forEach((timeout) => {
      clearTimeout(timeout)
    })
    typingTimeoutsRef.current.clear()
  }, [])

  // Load conversations (optimized with useCallback)
  const loadConversations = useCallback(async () => {
    try {
      console.log('🔄 Starting loadConversations...')
      setLoading(true)
      
      // Get current user
      console.log('👤 Getting current user...')
      const user = await dbHelpers.getCurrentUser()
      console.log('👤 Current user result:', user ? `Found: ${user.name} (${user.email})` : 'No user found')
      
      if (!user) {
        console.log('❌ No current user, stopping conversation load')
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
      
      console.log('✅ Current user object created:', currentUserObj.name)
      setCurrentUser(currentUserObj)

      // Get user's conversations from conversation_participants table
      console.log('🔍 Querying conversation participants...')
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

      console.log('📊 Participants query result:', {
        success: !participantsError,
        count: conversationParticipants?.length || 0,
        error: participantsError,
        data: conversationParticipants
      })

      if (participantsError) {
        console.error('❌ ChatContext: Error loading conversation participants:', participantsError)
        setConversations(new Map())
        setLoading(false)
        return
      }

      if (!conversationParticipants || conversationParticipants.length === 0) {
        console.log('⚠️ No conversation participants found for user')
        setConversations(new Map())
        setLoading(false)
        return
      }

      console.log('🔄 Processing', conversationParticipants.length, 'conversation participants...')

      const conversationMap = new Map<string, Conversation>()
      
      // Process conversations in parallel but limit to avoid overwhelming
      const batchSize = 5
      for (let i = 0; i < conversationParticipants.length; i += batchSize) {
        const batch = conversationParticipants.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (participant: any) => {
          const conversation = Array.isArray(participant.conversations) 
            ? participant.conversations[0] 
            : participant.conversations
          if (!conversation) {
            console.log('⚠️ No conversation data in participant:', participant)
            return null
          }

          console.log('🔄 Processing conversation:', conversation.id, conversation.title)

          try {
            // Get messages for this conversation (limit to recent messages)
            const { data: messagesData, error: messagesError } = await supabase
              .from('conversation_messages')
              .select(`
                id,
                content,
                sender_id,
                created_at,
                message_type,
                media_url,
                sender:users!sender_id(id, name, avatar)
              `)
              .eq('conversation_id', conversation.id)
              .order('created_at', { ascending: false })
              .limit(50) // Only load recent messages initially

            console.log(`📨 Messages for ${conversation.id}:`, {
              success: !messagesError,
              count: messagesData?.length || 0,
              error: messagesError
            })

            if (messagesError) {
              console.error(`Error loading messages for conversation ${conversation.id}:`, messagesError)
              return null
            }

            // Get other participants
            const { data: participantIds, error: participantIdsError } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', conversation.id)
              .neq('user_id', user.id)

            let otherParticipants = []
            if (participantIds && participantIds.length > 0) {
              // Then get user details for each participant
              for (const p of participantIds) {
                const { data: userData, error: userError } = await supabase
                  .from('users')
                  .select('id, name, avatar, last_active')
                  .eq('id', p.user_id)
                  .single()

                if (userData && !userError) {
                  otherParticipants.push({
                    user_id: p.user_id,
                    user: userData
                  })
                } else {
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
            console.log('✅ Adding conversation to map:', conv.id, conv.participants?.map(p => p.name))
            conversationMap.set(conv.id, conv)
          }
        })
      }

      console.log('📝 Final conversation map size:', conversationMap.size)
      console.log('📝 Conversation map contents:', Array.from(conversationMap.keys()))
      
      setConversations(conversationMap)
      
      console.log('✅ Conversations set in state, map size:', conversationMap.size)
      
      // Set up realtime subscriptions after conversations are loaded
      // Use setTimeout to avoid setting up subscriptions in the same tick
      setTimeout(() => {
        setupRealtimeSubscriptions()
        // Set up individual conversation subscriptions
        conversationMap.forEach((conversation, conversationId) => {
          setupConversationSubscription(conversationId)
        })
      }, 100)
      
    } catch (error) {
      console.error('❌ ChatContext: Error loading conversations:', error)
      setConversations(new Map())
    } finally {
      console.log('🏁 loadConversations finished, setting loading to false')
      setLoading(false)
    }
  }, [setupRealtimeSubscriptions])

  // Cleanup old conversations (memory management)
  const cleanupOldConversations = useCallback(() => {
    const maxConversations = 50 // Keep only recent 50 conversations
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
    const now = Date.now()

    setConversations(prevConversations => {
      const newConversations = new Map()
      const conversationsArray = Array.from(prevConversations.entries())
      
      // Sort by last message time
      conversationsArray.sort((a, b) => {
        const aTime = a[1].lastMessage?.timestamp?.getTime() || 0
        const bTime = b[1].lastMessage?.timestamp?.getTime() || 0
        return bTime - aTime
      })

      // Keep only recent conversations
      conversationsArray.slice(0, maxConversations).forEach(([id, conv]) => {
        const lastMessageTime = conv.lastMessage?.timestamp?.getTime() || 0
        if (now - lastMessageTime < maxAge) {
          newConversations.set(id, conv)
        }
      })

      return newConversations
    })
  }, [])

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
      console.log('🚀 Sending message:', { conversationId, text, currentUser: currentUser?.id });
      
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

      console.log('📝 Created optimistic message:', optimisticMessage);

      // Update UI immediately with optimistic message
      setConversations(prev => {
        const newConversations = new Map(prev)
        const conversation = newConversations.get(conversationId)
        if (conversation) {
          console.log('✅ Adding optimistic message to conversation');
          newConversations.set(conversationId, {
            ...conversation,
            messages: [...conversation.messages, optimisticMessage],
            lastMessage: optimisticMessage,
          })
        } else {
          console.log('❌ Conversation not found for optimistic update');
        }
        return newConversations
      })

      // Create message in database
      console.log('💾 Inserting message to database...');
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
        console.error('❌ Database insert failed:', messageError);
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

      console.log('✅ Database insert successful:', messageData);

      // DON'T replace optimistic message here - let realtime event handle it
      // This prevents duplicate messages when realtime event arrives
      console.log('⏳ Waiting for realtime event to replace optimistic message');

      console.log('⏰ Updating conversation timestamp...');
      // Update last_message_at in conversations table
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      console.log('✅ Message sending completed successfully');

    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }, [currentUser])

  // Typing indicator functionality
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (!currentUser) return

    const channel = channelsRef.current.get(conversationId)
    if (!channel) return

    if (isTyping) {
      // Send typing start event
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: true,
          conversationId
        }
      })

      // Clear any existing timeout
      const existingTimeout = typingTimeoutsRef.current.get(conversationId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Set timeout to automatically stop typing after 3 seconds
      const timeout = setTimeout(() => {
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            userId: currentUser.id,
            userName: currentUser.name,
            isTyping: false,
            conversationId
          }
        })
        typingTimeoutsRef.current.delete(conversationId)
      }, 3000)

      typingTimeoutsRef.current.set(conversationId, timeout)
    } else {
      // Send typing stop event
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: false,
          conversationId
        }
      })

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

  // Set up realtime subscriptions when conversations change
  useEffect(() => {
    if (currentUser && conversations.size > 0) {
      console.log('🔔 Setting up conversation subscriptions for', conversations.size, 'conversations')
      
      // Set up subscriptions for any new conversations
      conversations.forEach((conversation, conversationId) => {
        if (!channelsRef.current.has(conversationId)) {
          console.log('🔔 Setting up new subscription for conversation:', conversationId)
          setupConversationSubscription(conversationId)
        }
      })

      // Clean up subscriptions for conversations that no longer exist
      const currentConversationIds = new Set(conversations.keys())
      channelsRef.current.forEach((channel, conversationId) => {
        if (!currentConversationIds.has(conversationId)) {
          console.log(`🧹 Removing subscription for conversation ${conversationId}`)
          supabase.removeChannel(channel)
          channelsRef.current.delete(conversationId)
        }
      })
    }
  }, [currentUser, conversations.size, setupConversationSubscription]) // Use size instead of the full conversations object

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 ChatProvider unmounting, cleaning up all subscriptions')
      cleanupRealtimeSubscriptions()
    }
  }, [cleanupRealtimeSubscriptions])

  // Periodic cleanup
  useEffect(() => {
    const cleanup = setInterval(cleanupOldConversations, 5 * 60 * 1000) // Every 5 minutes
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

// Backward compatibility hook (use separate hooks when possible)
export function useChat() {
  const state = useChatState()
  const ui = useChatUI()
  const actions = useChatActions()
  
  return {
    ...state,
    ...ui,
    ...actions,
    // Convert Map back to array for compatibility
    conversations: Array.from(state.conversations.values()),
  }
}
