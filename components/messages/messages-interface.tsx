"use client"

import { useState, useEffect, useRef } from "react"
import ConversationList from "./conversation-list"
import MessageThread from "./message-thread"
import type { Conversation, Message, User } from "./types"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"

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
  {
    id: "user6",
    name: "James Wilson",
    avatar: "/placeholder.svg?height=200&width=200&text=JW",
    status: "offline",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: "user7",
    name: "Olivia Martinez",
    avatar: "/placeholder.svg?height=200&width=200&text=OM",
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
    "I'm struggling with the difference between 'affect' and 'effect'. Can you explain?",
    "Thanks for your help yesterday!",
    "I completed the writing assignment. Would you mind reviewing it?",
    "What resources do you recommend for improving listening skills?",
    "I'm planning to take the IELTS test next month. Any advice?",
  ]

  const otherUserMessages = [
    "Hello! My practice is going well. I've been focusing on vocabulary.",
    "For pronunciation, try recording yourself and comparing with native speakers.",
    "Of course! That grammar rule is about...",
    "I'm glad you liked it! Movies are excellent for learning natural expressions.",
    "How about Thursday at 6 PM?",
    "'Affect' is usually a verb, while 'effect' is usually a noun. For example...",
    "You're welcome! You're making great progress.",
    "Sure, I'd be happy to review it. Just send it over.",
    "Podcasts are fantastic for improving listening skills. I recommend...",
    "For IELTS, focus on time management and practice with past papers.",
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

export default function MessagesInterface() {
  const [conversations, setConversations] = useState<Conversation[]>(generateSampleConversations())
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set the first conversation as active by default
    if (conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0])
    }
  }, [conversations, activeConversation])

  useEffect(() => {
    // On mobile, hide sidebar when a conversation is selected
    if (isMobile && activeConversation) {
      setShowSidebar(false)
    } else if (!isMobile) {
      setShowSidebar(true)
    }
  }, [activeConversation, isMobile])

  const handleSelectConversation = (conversation: Conversation) => {
    // Mark conversation as read when selected
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === conversation.id) {
        return { ...conv, unreadCount: 0 }
      }
      return conv
    })

    setConversations(updatedConversations)
    setActiveConversation(conversation)
  }

  const handleSendMessage = (text: string, attachments: any[] = []) => {
    if (!activeConversation) return

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
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === activeConversation.id) {
        const updatedMessages = [...conv.messages, newMessage]
        return {
          ...conv,
          messages: updatedMessages,
          lastMessage: newMessage,
        }
      }
      return conv
    })

    setConversations(updatedConversations)
    setActiveConversation({
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage],
      lastMessage: newMessage,
    })

    // Simulate reply after a delay
    setTimeout(() => {
      const otherUser = activeConversation.participants.find((p) => p.id !== currentUser.id)
      if (!otherUser) return

      // Set typing indicator
      const withTypingIndicator = conversations.map((conv) => {
        if (conv.id === activeConversation.id) {
          return { ...conv, isTyping: true }
        }
        return conv
      })
      setConversations(withTypingIndicator)

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

          const finalConversations = conversations.map((conv) => {
            if (conv.id === activeConversation.id) {
              const updatedMessages = [...conv.messages, newMessage, replyMessage]
              return {
                ...conv,
                messages: updatedMessages,
                lastMessage: replyMessage,
                isTyping: false,
              }
            }
            return conv
          })

          setConversations(finalConversations)
          setActiveConversation({
            ...activeConversation,
            messages: [...activeConversation.messages, newMessage, replyMessage],
            lastMessage: replyMessage,
            isTyping: false,
          })
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
      "I had a similar experience when I was learning that topic.",
      "That's a good question. Let me think about it...",
      "I'm not sure I understand. Could you explain it differently?",
      "That's exactly what I needed to know. Thank you!",
      "Let's discuss this more during our next lesson.",
    ]

    return replies[Math.floor(Math.random() * replies.length)]
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="flex h-full rounded-lg overflow-hidden border shadow-lg bg-card">
        {/* Mobile menu button */}
        {isMobile && (
          <Button variant="ghost" size="icon" className="absolute top-20 left-6 z-50 md:hidden" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
        )}

        {/* Sidebar with conversation list */}
        <AnimatePresence mode="wait">
          {(showSidebar || !isMobile) && (
            <motion.div
              initial={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`${
                isMobile ? "absolute z-40 h-[calc(100vh-4rem)] w-4/5 max-w-sm" : "hidden md:flex md:w-1/3 lg:w-1/4"
              } flex-col border-r bg-card`}
            >
              <ConversationList
                conversations={conversations}
                activeConversationId={activeConversation?.id}
                onSelectConversation={handleSelectConversation}
                currentUser={currentUser}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <MessageThread
              conversation={activeConversation}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col p-8 text-center">
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6 animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Your Messages</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Select a conversation from the sidebar to start chatting with your language partners and teachers.
              </p>
              {isMobile && (
                <Button onClick={toggleSidebar} className="animate-bounce">
                  View Conversations
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
