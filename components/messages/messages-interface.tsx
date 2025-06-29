"use client"

import { useState, useEffect, useRef } from "react"
import ConversationList from "./conversation-list"
import MessageThread from "./message-thread"
import type { Conversation, Message, User } from "./types"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"
import { useChat } from "@/contexts/chat-context-realtime"

export default function MessagesInterface() {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use chat context (with backward compatibility for now)
  const { conversations, loading, currentUser, sendMessage, loadConversations } = useChat()// Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

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
    setActiveConversation(conversation)
  }

  const handleSendMessage = async (text: string, attachments: any[] = []) => {
    if (!activeConversation || !currentUser) return

    try {
      await sendMessage(activeConversation.id, text, attachments)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
        <div className="flex h-full rounded-lg overflow-hidden border shadow-lg bg-card">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          </div>
        </div>
      </div>
    )
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
            >            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversation?.id}
              onSelectConversation={handleSelectConversation}
              currentUser={currentUser || {
                id: 'current-user',
                name: 'Current User',
                avatar: '/placeholder.svg?height=40&width=40&text=CU',
                status: 'online',
                lastActive: new Date(),
              }}
            />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <MessageThread
              conversation={activeConversation}
              currentUser={currentUser || {
                id: 'current-user',
                name: 'Current User',
                avatar: '/placeholder.svg?height=40&width=40&text=CU',
                status: 'online',
                lastActive: new Date(),
              }}
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
