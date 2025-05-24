"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Conversation, Message, User } from "@/components/messages/types"

// Sample data
const currentUser: User = {
  id: "current-user",
  name: "You",
  avatar: "/placeholder.svg?height=200&width=200",
  status: "online",
  lastActive: new Date(),
}

const sampleUsers: User[] = [
  {
    id: "user1",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=200&width=200&text=SJ",
    status: "online",
    lastActive: new Date(),
  },
  {
    id: "user2",
    name: "Michael Chen",
    avatar: "/placeholder.svg?height=200&width=200&text=MC",
    status: "offline",
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "user3",
    name: "Emma Williams",
    avatar: "/placeholder.svg?height=200&width=200&text=EW",
    status: "online",
    lastActive: new Date(),
  },
  {
    id: "user4",
    name: "David Rodriguez",
    avatar: "/placeholder.svg?height=200&width=200&text=DR",
    status: "away",
    lastActive: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: "user5",
    name: "Sophia Lee",
    avatar: "/placeholder.svg?height=200&width=200&text=SL",
    status: "online",
    lastActive: new Date(),
  },
]

const generateSampleMessages = (userId: string, count: number): Message[] => {
  const messages: Message[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const isFromCurrentUser = Math.random() > 0.5
    const timeOffset = 1000 * 60 * (count - i)

    messages.push({
      id: `msg-${userId}-${i}`,
      senderId: isFromCurrentUser ? currentUser.id : userId,
      text: getSampleMessage(isFromCurrentUser),
      timestamp: new Date(now.getTime() - timeOffset),
      status: "read",
      attachments:
        i % 7 === 0
          ? [
              {
                type: "image",
                url: `/placeholder.svg?height=300&width=400&text=Image+${i}`,
                name: `image-${i}.jpg`,
              },
            ]
          : [],
      reactions: i % 5 === 0 ? [{ emoji: "👍", count: 1 }] : [],
    })
  }

  return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

const getSampleMessage = (isFromCurrentUser: boolean): string => {
  const currentUserMessages = [
    "Hi there! How's your English practice going?",
    "I've been working on my pronunciation. Any tips?",
    "Could you help me understand this grammar rule?",
    "I watched that movie you recommended. It was great for learning idioms!",
    "When are we having our next speaking practice session?",
  ]

  const otherUserMessages = [
    "Hello! My practice is going well. I've been focusing on vocabulary.",
    "For pronunciation, try recording yourself and comparing with native speakers.",
    "Of course! That grammar rule is about...",
    "I'm glad you liked it! Movies are excellent for learning natural expressions.",
    "How about Thursday at 6 PM?",
  ]

  const messages = isFromCurrentUser ? currentUserMessages : otherUserMessages
  return messages[Math.floor(Math.random() * messages.length)]
}

const generateSampleConversations = (): Conversation[] => {
  return sampleUsers.map((user) => {
    const messageCount = 5 + Math.floor(Math.random() * 15)
    const messages = generateSampleMessages(user.id, messageCount)
    const lastMessage = messages[messages.length - 1]

    return {
      id: `conv-${user.id}`,
      participants: [currentUser, user],
      messages: messages,
      unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
      lastMessage: lastMessage,
      isTyping: user.id === "user1" || user.id === "user5",
    }
  })
}

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
  currentUser: User
  windowPositions: Record<string, WindowPosition>
  openChatWindow: (conversationId: string) => void
  closeChatWindow: (conversationId: string) => void
  minimizeChatWindow: (conversationId: string) => void
  maximizeChatWindow: (conversationId: string) => void
  setActiveConversation: (conversationId: string | null) => void
  toggleDropdown: () => void
  closeDropdown: () => void
  sendMessage: (conversationId: string, text: string, attachments?: any[]) => void
  getConversationById: (conversationId: string) => Conversation | undefined
  updateWindowPosition: (conversationId: string, position: WindowPosition) => void
  rearrangeAllWindows: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(generateSampleConversations())
  const [openChatWindows, setOpenChatWindows] = useState<string[]>([])
  const [minimizedChatWindows, setMinimizedChatWindows] = useState<string[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [windowPositions, setWindowPositions] = useState<Record<string, WindowPosition>>({})

  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0)

  // Calculate a non-overlapping position for a new chat window
  const calculateNewWindowPosition = (conversationId: string): WindowPosition => {
    // Default position for the first window - center it horizontally and vertically
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
    const windowWidth = 350 // Width of chat window
    const windowHeight = 450 // Height of chat window
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const padding = 20 // Padding between windows

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
    positions.push({ x: 0, y: 0 }) // Top left
    positions.push({ x: screenWidth - windowWidth, y: 0 }) // Top right
    positions.push({ x: 0, y: screenHeight - windowHeight }) // Bottom left
    positions.push({ x: screenWidth - windowWidth, y: screenHeight - windowHeight }) // Bottom right
    positions.push({ x: (screenWidth - windowWidth) / 2, y: 0 }) // Top center
    positions.push({ x: (screenWidth - windowWidth) / 2, y: screenHeight - windowHeight }) // Bottom center
    positions.push({ x: 0, y: (screenHeight - windowHeight) / 2 }) // Middle left
    positions.push({ x: screenWidth - windowWidth, y: (screenHeight - windowHeight) / 2 }) // Middle right
    positions.push({ x: (screenWidth - windowWidth) / 2, y: (screenHeight - windowHeight) / 2 }) // Center

    // Find the first position that doesn't overlap with existing windows
    for (const pos of positions) {
      let overlaps = false

      for (const existingPos of existingPositions) {
        // Check if windows would overlap
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

  const updateWindowPosition = (conversationId: string, position: { x: number; y: number }) => {
    setWindowPositions((prev) => ({
      ...prev,
      [conversationId]: position,
    }))

    // Lưu vị trí vào localStorage nếu có
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

    // Save window positions to localStorage for persistence
    try {
      const allPositions = { ...windowPositions }
      localStorage.setItem("chatWindowPositions", JSON.stringify(allPositions))
    } catch (e) {
      console.error("Failed to save window positions", e)
    }
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

  const sendMessage = (conversationId: string, text: string, attachments: any[] = []) => {
    const conversation = conversations.find((conv) => conv.id === conversationId)
    if (!conversation) return

    const newMessage: Message = {
      id: `msg-new-${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date(),
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

    // Simulate reply after a delay
    setTimeout(() => {
      const otherUser = conversation.participants.find((p) => p.id !== currentUser.id)
      if (!otherUser) return

      // Set typing indicator
      setConversations((prevConversations) =>
        prevConversations.map((conv) => {
          if (conv.id === conversationId) {
            return { ...conv, isTyping: true }
          }
          return conv
        }),
      )

      // After a delay, add the response
      setTimeout(
        () => {
          const replyMessage: Message = {
            id: `msg-reply-${Date.now()}`,
            senderId: otherUser.id,
            text: getReplyMessage(text),
            timestamp: new Date(),
            status: "read",
            attachments: [],
            reactions: [],
          }

          setConversations((prevConversations) =>
            prevConversations.map((conv) => {
              if (conv.id === conversationId) {
                const updatedMessages = [...conv.messages, replyMessage]
                return {
                  ...conv,
                  messages: updatedMessages,
                  lastMessage: replyMessage,
                  isTyping: false,
                }
              }
              return conv
            }),
          )
        },
        1500 + Math.random() * 2000,
      )
    }, 1000)
  }

  const getReplyMessage = (text: string): string => {
    const replies = [
      "That's interesting! Tell me more about it.",
      "I see what you mean. Have you considered trying a different approach?",
      "Great point! I think that's a good way to practice English.",
      "I agree with you. Let's schedule a practice session soon.",
      "Thanks for sharing that. It's really helpful for my learning.",
    ]

    return replies[Math.floor(Math.random() * replies.length)]
  }

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

  // Thêm đoạn code để khôi phục vị trí cửa sổ chat từ localStorage
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

  // Thêm hàm để sắp xếp lại tất cả các cửa sổ chat
  const rearrangeAllWindows = () => {
    if (openChatWindows.length <= 1) return

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const windowWidth = 350
    const windowHeight = 450
    const padding = 20

    const newPositions: Record<string, WindowPosition> = {}

    // Arrange windows in a grid or cascade pattern
    openChatWindows.forEach((id, index) => {
      // For grid layout
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

  const value = {
    conversations,
    openChatWindows,
    minimizedChatWindows,
    activeConversation,
    isDropdownOpen,
    totalUnreadCount,
    currentUser,
    windowPositions,
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
