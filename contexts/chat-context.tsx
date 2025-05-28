"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Conversation, Message, User } from "@/components/messages/types"
import { supabase, dbHelpers } from "@/lib/supabase"

interface WindowPosition {
  x: number
  y: number
}

interface ChatContextType {
  conversations: Conversation[]
  openChatWindows: string[]
  minimizedChatWindows: string[]
  activeConversation: string | null
  isDropdownOpen: boolean
  totalUnreadCount: number
  currentUser: User | null
  windowPositions: Record<string, WindowPosition>
  loading: boolean
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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [openChatWindows, setOpenChatWindows] = useState<string[]>([])
  const [minimizedChatWindows, setMinimizedChatWindows] = useState<string[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [windowPositions, setWindowPositions] = useState<Record<string, WindowPosition>>({})
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0)

  // Load current user and conversations from Supabase
  const loadConversations = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const user = await dbHelpers.getCurrentUser()
      if (!user) return

      setCurrentUser({
        id: user.id,
        name: user.name || "You",
        avatar: user.avatar || "/placeholder.svg?height=200&width=200",
        status: "online",
        lastActive: new Date(user.last_active),
      })

      // Get user's conversations
      const conversationData = await dbHelpers.getUserConversations(user.id)
      
      const formattedConversations: Conversation[] = (await Promise.all(
        conversationData.map(async (item: any) => {
          const conversation = item.conversation
          if (!conversation) return null

          // Get messages for this conversation
          const messagesData = await dbHelpers.getConversationMessages(conversation.id)
          
          // Get other participants
          const { data: participantsData } = await supabase
            .from('conversation_participants')
            .select(`
              user:users(id, name, avatar, last_active)
            `)
            .eq('conversation_id', conversation.id)
            .neq('user_id', user.id)

          const participants: User[] = participantsData?.map((p: any) => ({
            id: p.user.id,
            name: p.user.name || "Unknown",
            avatar: p.user.avatar || "/placeholder.svg?height=200&width=200",
            status: "offline",
            lastActive: new Date(p.user.last_active),
          })) || []

          participants.unshift({
            id: user.id,
            name: user.name || "You",
            avatar: user.avatar || "/placeholder.svg?height=200&width=200",
            status: "online",
            lastActive: new Date(user.last_active),
          })

          const messages: Message[] = messagesData.map((msg: any) => ({
            id: msg.id,
            senderId: msg.sender_id,
            text: msg.content,
            timestamp: new Date(msg.created_at),
            status: "read" as const,
            attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
            reactions: [],
          }))

          const lastMessage = messages[messages.length - 1]

          return {
            id: conversation.id,
            participants,
            messages,
            unreadCount: 0,
            lastMessage,
            isTyping: false,
          }
        })
      )).filter(Boolean) as Conversation[]

      setConversations(formattedConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate a non-overlapping position for a new chat window
  const calculateNewWindowPosition = (conversationId: string): WindowPosition => {
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

    // Define a grid of possible positions
    const positions: WindowPosition[] = []

    // Add positions in a grid pattern
    const cols = Math.floor((screenWidth - padding) / (windowWidth + padding))
    const rows = Math.floor((screenHeight - padding) / (windowHeight + padding))

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        positions.push({
          x: padding + col * (windowWidth + padding),
          y: padding + row * (windowHeight + padding),
        })
      }
    }

    // Add positions along the edges
    positions.push({ x: 0, y: 0 })
    positions.push({ x: screenWidth - windowWidth, y: 0 })
    positions.push({ x: 0, y: screenHeight - windowHeight })
    positions.push({ x: screenWidth - windowWidth, y: screenHeight - windowHeight })
    positions.push({ x: (screenWidth - windowWidth) / 2, y: 0 })
    positions.push({ x: (screenWidth - windowWidth) / 2, y: screenHeight - windowHeight })
    positions.push({ x: 0, y: (screenHeight - windowHeight) / 2 })
    positions.push({ x: screenWidth - windowWidth, y: (screenHeight - windowHeight) / 2 })
    positions.push({ x: (screenWidth - windowWidth) / 2, y: (screenHeight - windowHeight) / 2 })

    // Find the first position that doesn't overlap with existing windows
    for (const pos of positions) {
      let overlaps = false

      for (const existingPos of existingPositions) {
        const horizontalOverlap = pos.x < existingPos.x + windowWidth && pos.x + windowWidth > existingPos.x
        const verticalOverlap = pos.y < existingPos.y + windowHeight && pos.y + windowHeight > existingPos.y

        if (horizontalOverlap && verticalOverlap) {
          overlaps = true
          break
        }
      }

      if (!overlaps) {
        return pos
      }
    }

    // If all positions overlap, offset from the last window
    const lastPosition = existingPositions[existingPositions.length - 1]
    return {
      x: Math.min(screenWidth - windowWidth, lastPosition.x + 30),
      y: Math.min(screenHeight - windowHeight, lastPosition.y + 30),
    }
  }

  const updateWindowPosition = (conversationId: string, position: WindowPosition) => {
    setWindowPositions((prev) => ({
      ...prev,
      [conversationId]: position,
    }))

    // Save position to localStorage
    try {
      const savedPositions = JSON.parse(localStorage.getItem("chatWindowPositions") || "{}")
      localStorage.setItem(
        "chatWindowPositions",
        JSON.stringify({
          ...savedPositions,
          [conversationId]: position,
        }),
      )
    } catch (error) {
      console.error("Failed to save window position to localStorage", error)
    }
  }

  const openChatWindow = (conversationId: string) => {
    // Mark conversation as read
    setConversations((prevConversations) =>
      prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          return { ...conv, unreadCount: 0 }
        }
        return conv
      }),
    )

    // If it's minimized, maximize it
    if (minimizedChatWindows.includes(conversationId)) {
      setMinimizedChatWindows((prev) => prev.filter((id) => id !== conversationId))
    }

    // If it's not already open, add it to open windows and calculate position
    if (!openChatWindows.includes(conversationId)) {
      setOpenChatWindows((prev) => [...prev, conversationId])

      // Calculate and set a non-overlapping position
      const newPosition = calculateNewWindowPosition(conversationId)
      updateWindowPosition(conversationId, newPosition)
    }

    // Set as active conversation
    setActiveConversation(conversationId)

    // Close dropdown
    setIsDropdownOpen(false)
  }

  const closeChatWindow = (conversationId: string) => {
    setOpenChatWindows((prev) => prev.filter((id) => id !== conversationId))
    setMinimizedChatWindows((prev) => prev.filter((id) => id !== conversationId))

    // If this was the active conversation, set active to null
    if (activeConversation === conversationId) {
      setActiveConversation(null)
    }
  }

  const minimizeChatWindow = (conversationId: string) => {
    if (!minimizedChatWindows.includes(conversationId)) {
      setMinimizedChatWindows((prev) => [...prev, conversationId])
    }

    // If this was the active conversation, set active to null
    if (activeConversation === conversationId) {
      setActiveConversation(null)
    }
  }

  const maximizeChatWindow = (conversationId: string) => {
    setMinimizedChatWindows((prev) => prev.filter((id) => id !== conversationId))
    setActiveConversation(conversationId)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev)
  }

  const closeDropdown = () => {
    setIsDropdownOpen(false)
  }

  const getConversationById = (conversationId: string) => {
    return conversations.find((conv) => conv.id === conversationId)
  }

  const sendMessage = async (conversationId: string, text: string, attachments: any[] = []) => {
    if (!currentUser) return

    const conversation = conversations.find((conv) => conv.id === conversationId)
    if (!conversation) return

    try {
      // Insert message into database
      const { data: messageData, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: text,
          attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
        })
        .select()
        .single()

      if (error) throw error

      const newMessage: Message = {
        id: messageData.id,
        senderId: currentUser.id,
        text,
        timestamp: new Date(messageData.created_at),
        status: "sent",
        attachments,
        reactions: [],
      }

      // Add message to conversation
      setConversations((prevConversations) =>
        prevConversations.map((conv) => {
          if (conv.id === conversationId) {
            const updatedMessages = [...conv.messages, newMessage]
            return {
              ...conv,
              messages: updatedMessages,
              lastMessage: newMessage,
            }
          }
          return conv
        }),
      )

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)

    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const rearrangeAllWindows = () => {
    if (openChatWindows.length <= 1) return

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const windowWidth = 350
    const windowHeight = 450
    const padding = 20

    const newPositions: Record<string, WindowPosition> = {}

    // Arrange windows in a grid pattern
    openChatWindows.forEach((id, index) => {
      const cols = Math.max(1, Math.floor(Math.sqrt(openChatWindows.length)))
      const col = index % cols
      const row = Math.floor(index / cols)

      newPositions[id] = {
        x: Math.min(screenWidth - windowWidth, padding + col * (windowWidth + padding)),
        y: Math.min(screenHeight - windowHeight, padding + row * (windowHeight + padding)),
      }
    })

    setWindowPositions(newPositions)

    // Save to localStorage
    try {
      localStorage.setItem("chatWindowPositions", JSON.stringify(newPositions))
    } catch (e) {
      console.error("Failed to save window positions", e)
    }
  }

  // Load conversations on mount
  useEffect(() => {
    loadConversations()

    // Set up real-time subscriptions for new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as any
          
          setConversations((prevConversations) =>
            prevConversations.map((conv) => {
              if (conv.id === newMessage.conversation_id) {
                const messageObj: Message = {
                  id: newMessage.id,
                  senderId: newMessage.sender_id,
                  text: newMessage.content,
                  timestamp: new Date(newMessage.created_at),
                  status: "read",
                  attachments: newMessage.attachments ? JSON.parse(newMessage.attachments) : [],
                  reactions: [],
                }

                return {
                  ...conv,
                  messages: [...conv.messages, messageObj],
                  lastMessage: messageObj,
                }
              }
              return conv
            })
          )
        }
      )
      .subscribe()

    return () => {
      messagesSubscription.unsubscribe()
    }
  }, [])

  // Load window positions from localStorage
  useEffect(() => {
    try {
      const savedPositions = JSON.parse(localStorage.getItem("chatWindowPositions") || "{}")
      if (Object.keys(savedPositions).length > 0) {
        setWindowPositions(savedPositions)
      }
    } catch (error) {
      console.error("Failed to load window positions from localStorage", error)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".chat-dropdown") && !target.closest(".chat-button")) {
        closeDropdown()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const value = {
    conversations,
    openChatWindows,
    minimizedChatWindows,
    activeConversation,
    isDropdownOpen,
    totalUnreadCount,
    currentUser,
    windowPositions,
    loading,
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
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
