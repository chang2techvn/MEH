"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import type { Conversation, Message, User } from "@/components/messages/types"
import { supabase, dbHelpers } from "@/lib/supabase"

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

  // Memoized computed values
  const totalUnreadCount = useMemo(() => {
    let total = 0
    conversations.forEach(conv => {
      total += conv.unreadCount
    })
    return total
  }, [conversations])

  // Load conversations (optimized with useCallback)
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get current user
      const user = await dbHelpers.getCurrentUser()
      if (!user) {
        console.log('No current user found')
        setLoading(false)
        return
      }

      setCurrentUser({
        id: user.id,
        name: user.name || "You",
        avatar: user.avatar || "/placeholder.svg?height=200&width=200",
        status: "online",
        lastActive: new Date(user.last_active || Date.now()),
      })

      // Get user's conversations from conversation_participants table
      const { data: conversationParticipants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          role,
          joined_at,
          last_read_at,
          conversation:conversations!inner(
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
        console.error('Error loading conversation participants:', participantsError)
        setConversations(new Map())
        setLoading(false)
        return
      }

      if (!conversationParticipants || conversationParticipants.length === 0) {
        console.log('No conversations found for user')
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
          const conversation = participant.conversation
          if (!conversation) return null

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

            if (messagesError) {
              console.error(`Error loading messages for conversation ${conversation.id}:`, messagesError)
              return null
            }

            // Get other participants
            const { data: otherParticipants, error: otherParticipantsError } = await supabase
              .from('conversation_participants')
              .select(`
                user_id,
                role,
                user:users!user_id(id, name, avatar, last_active)
              `)
              .eq('conversation_id', conversation.id)
              .neq('user_id', user.id)

            if (otherParticipantsError) {
              console.error(`Error loading participants for conversation ${conversation.id}:`, otherParticipantsError)
              return null
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
                  participants.push({
                    id: p.user.id,
                    name: p.user.name || "Unknown User",
                    avatar: p.user.avatar || "/placeholder.svg?height=200&width=200",
                    status: "offline", // Could be enhanced with real-time status
                    lastActive: new Date(p.user.last_active || Date.now()),
                  })
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

            return {
              id: conversation.id,
              participants,
              messages,
              unreadCount: 0, // Could calculate based on last_read_at
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

      console.log(`Loaded ${conversationMap.size} conversations`)
      setConversations(conversationMap)
    } catch (error) {
      console.error('Error loading conversations:', error)
      setConversations(new Map())
    } finally {
      setLoading(false)
    }
  }, [])

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

  const openChatWindow = useCallback((conversationId: string) => {
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
  }, [windowPositions, calculateNewWindowPosition, updateWindowPosition])

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
        throw messageError
      }

      // Create optimistic message for UI
      const newMessage: Message = {
        id: messageData.id,
        senderId: currentUser.id,
        text,
        timestamp: new Date(),
        status: "sent",
        attachments: attachments || [],
        reactions: [],
      }

      // Update local conversation
      setConversations(prev => {
        const newConversations = new Map(prev)
        const conversation = newConversations.get(conversationId)
        if (conversation) {
          newConversations.set(conversationId, {
            ...conversation,
            messages: [...conversation.messages, newMessage],
            lastMessage: newMessage,
          })
        }
        return newConversations
      })

    } catch (error) {
      console.error('Error sending message:', error)
      throw error
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
