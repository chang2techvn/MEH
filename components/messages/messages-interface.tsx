"use client"

import { useState, useEffect, useRef } from "react"
import ConversationList from "./conversation-list"
import MessageThread from "./message-thread"
import type { Conversation, Message, User } from "./types"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"
import { supabase, dbHelpers } from "@/lib/supabase"
import type { Database } from "@/types/database.types"
import { toast } from "@/hooks/use-toast"

// Types from Supabase schema
type UserRow = Database['public']['Tables']['users']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']
type ConversationRow = Database['public']['Tables']['conversations']['Row']

// Current user will be loaded from auth context in a real app
const getCurrentUserId = () => {
  // For now, we'll use a hardcoded ID. In a real app, this would come from auth context
  return "current-user-id" // This should be replaced with actual user ID from auth
}

// Mapping function to convert Supabase data to component types
const mapUserRowToUser = (userRow: UserRow): User => ({
  id: userRow.id,
  name: userRow.name || 'Unknown User',
  avatar: userRow.avatar || '/placeholder.svg?height=40&width=40&text=' + (userRow.name?.[0] || 'U'),
  status: userRow.is_active ? 'online' : 'offline',
  lastActive: new Date(userRow.last_active || userRow.created_at || Date.now()),
})

const mapMessageRowToMessage = (messageRow: MessageRow, senderData: UserRow | null): Message => ({
  id: messageRow.id,
  senderId: messageRow.sender_id || 'unknown',
  text: messageRow.content,
  timestamp: new Date(messageRow.created_at || Date.now()),
  status: 'read', // Default status
  attachments: messageRow.media_urls ? messageRow.media_urls.map(url => ({ url, type: 'image' })) : [],
  reactions: [], // Could be extended if reactions are added to schema
})

const mapConversationData = (
  conversationRow: ConversationRow,
  participants: UserRow[],
  messages: MessageRow[],
  currentUserId: string
): Conversation => {
  const mappedParticipants = participants.map(mapUserRowToUser)
  const mappedMessages = messages.map(msg => mapMessageRowToMessage(msg, null))
  const lastMessage = mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1] : null
  
  return {
    id: conversationRow.id,
    participants: mappedParticipants,
    messages: mappedMessages,
    unreadCount: 0, // Could be calculated based on last_read_at in participants
    lastMessage,
    isTyping: false, // Could be extended with real-time typing indicators
  }
}

export default function MessagesInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load current user and conversations from Supabase
  const loadConversations = async () => {
    try {
      setLoading(true)
      const currentUserId = getCurrentUserId()
      
      // First, get current user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUserId)
        .single()

      if (userError) {
        console.error('Error fetching current user:', userError)
        // For demo purposes, create a default user
        setCurrentUser({
          id: currentUserId,
          name: 'Current User',
          avatar: '/placeholder.svg?height=40&width=40&text=CU',
          status: 'online',
          lastActive: new Date(),
        })
      } else {
        setCurrentUser(mapUserRowToUser(userData))
      }

      // Get user's conversations with participants and messages
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation:conversations(
            id,
            type,
            name,
            description,
            is_group,
            last_message_at,
            created_at
          )
        `)
        .eq('user_id', currentUserId)
        .eq('is_active', true)

      if (conversationError) {
        console.error('Error fetching conversations:', conversationError)
        toast({
          title: "Error loading conversations",
          description: "Failed to load your conversations. Please try again.",
          variant: "destructive",
        })
        return
      }

      const conversationPromises = conversationData?.map(async (item: any) => {
        const conversation = item.conversation
        
        // Get all participants for this conversation
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('user:users(*)')
          .eq('conversation_id', conversation.id)
          .eq('is_active', true)

        // Get recent messages for this conversation
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id(id, name, avatar)
          `)
          .eq('conversation_id', conversation.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })
          .limit(50) // Limit to recent 50 messages

        const participants = participantError ? [] : participantData?.map((p: any) => p.user) || []
        const messages = messageError ? [] : messageData || []

        return mapConversationData(conversation, participants, messages, currentUserId)
      }) || []

      const loadedConversations = await Promise.all(conversationPromises)
      setConversations(loadedConversations)

    } catch (error) {
      console.error('Error loading conversations:', error)
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

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

  const handleSendMessage = async (text: string, attachments: any[] = []) => {
    if (!activeConversation || !currentUser) return

    try {
      // Create the message in the database
      const { data: newMessageData, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation.id,
          sender_id: currentUser.id,
          content: text,
          type: 'TEXT',
          attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        toast({
          title: "Error sending message",
          description: "Failed to send your message. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Create the message object for local state
      const newMessage: Message = {
        id: newMessageData.id,
        senderId: currentUser.id,
        text,
        timestamp: new Date(newMessageData.created_at),
        status: "sent",
        attachments,
        reactions: [],
      }

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', activeConversation.id)

      // Add message to local state
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

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
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
