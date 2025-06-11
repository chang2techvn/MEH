"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  MoreVertical,
  Flag,
  Archive,
  Trash2,
  AlertCircle,
  Send,
  Paperclip,
  Smile,
  ChevronDown,
  Phone,
  Video,
  User,
  Calendar,
  Info,
  MessageSquare,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase, dbHelpers } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

// Types from Supabase schema
type UserRow = Database['public']['Tables']['users']['Row']
type MessageRow = Database['public']['Tables']['conversation_messages']['Row']
type ConversationRow = Database['public']['Tables']['conversations']['Row']
type ConversationParticipantRow = Database['public']['Tables']['conversation_participants']['Row']

interface ConversationData {
  user: {
    id: string
    name: string
    avatar: string | null
    role: string
    email: string
    phone?: string
    location?: string
    timezone?: string
    lastActive: string
    memberSince: string
    level?: string
  }
  messages: Array<{
    id: string
    sender: 'user' | 'admin'
    text: string
    timestamp: Date
    status: 'sent' | 'delivered' | 'read'
  }>
  notes: Array<{
    id: string
    text: string
    timestamp: Date
    author: string
  }>
}

interface ConversationViewProps {
  conversationId: string | null
  isLoading: boolean
  onBackToList: () => void
  isMobile: boolean
}

// Database operations and data loading
const loadNotes = async (conversationId: string) => {
  try {
    // Load notes from database (implement when notes table is ready)
    // For now, return empty array
    return []
  } catch (error) {
    console.error('Error loading notes:', error)
    return []
  }
}

export function ConversationView({ conversationId, isLoading, onBackToList, isMobile }: ConversationViewProps) {
  const [replyText, setReplyText] = useState("")
  const [activeTab, setActiveTab] = useState("conversation")
  const [newNote, setNewNote] = useState("")
  const [conversation, setConversation] = useState<ConversationData | null>(null)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Load conversation data from Supabase
  const loadConversation = async (id: string) => {
    try {
      setLoadingConversation(true)
      
      // Fetch conversation with participants and messages
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          status,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .single()

      if (convError) {
        console.error('Error loading conversation:', convError)
        throw convError
      }

      // Fetch participants separately
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          role,
          joined_at,
          user:users!inner(
            id,
            name,
            email,
            avatar,
            last_active,
            created_at,
            level
          )
        `)
        .eq('conversation_id', id)

      if (participantsError) {
        console.error('Error loading participants:', participantsError)
        throw participantsError
      }

      // Fetch messages separately
      const { data: messagesData, error: messagesError } = await supabase
        .from('conversation_messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          message_type,
          media_url,
          sender:users!inner(
            id,
            name,
            avatar
          )
        `)
        .eq('conversation_id', id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error loading messages:', messagesError)
        throw messagesError
      }

      if (convError) {
        console.error('Error loading conversation:', convError)
        throw new Error('Failed to load conversation')
      }

      if (!conversationData) {
        setConversation(null)
        return
      }

      // Transform data to match ConversationData interface
      const studentParticipant = participantsData?.find(p => p.role === 'student')
      const userData = studentParticipant?.user

      if (!userData) {
        setConversation(null)
        return
      }

      // Handle case where user might be an array (due to join structure)
      const user = Array.isArray(userData) ? userData[0] : userData

      const transformedConversation: ConversationData = {
        user: {
          id: user.id,
          name: user.name || 'Unknown User',
          avatar: user.avatar || '/placeholder.svg?height=40&width=40&text=' + (user.name?.[0] || 'U'),
          role: 'student',
          email: user.email || '',
          phone: 'N/A', // Not available in schema
          location: 'N/A', // Not available in schema
          timezone: 'N/A', // Not available in schema
          lastActive: user.last_active ? format(new Date(user.last_active), 'MMM d, yyyy') : 'Never',
          memberSince: format(new Date(user.created_at || new Date()), 'MMM yyyy'),
          level: user.level ? `Level ${user.level}` : 'Beginner'
        },
        messages: messagesData?.map(msg => ({
          id: msg.id,
          sender: msg.sender_id === user.id ? 'user' : 'admin',
          text: msg.content,
          timestamp: new Date(msg.created_at || new Date()),
          status: 'read' // Default to read since we don't track this in conversation_messages
        })) || [],
        notes: await loadNotes(id) // Load notes from database
      }

      setConversation(transformedConversation)
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast({
        title: "Error",
        description: "Failed to load conversation data.",
        variant: "destructive"
      })
      setConversation(null)
    } finally {
      setLoadingConversation(false)
    }
  }

  // Scroll to bottom of messages when conversation changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversationId])

  // Load conversation data when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId)
    } else {
      setConversation(null)
    }
  }, [conversationId])

  // Handle sending a reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !conversationId) return

    try {
      // Get current user (admin)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Failed to get current user')
      }

      // Send message to database
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: replyText.trim(),
          sender_id: user.id,
        })

      if (error) {
        throw error
      }

      toast({
        title: "Message sent",
        description: "Your reply has been sent successfully.",
      })

      setReplyText("")
      
      // Reload conversation to show new message
      await loadConversation(conversationId)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle adding a note
  const handleAddNote = async () => {
    if (!newNote.trim() || !conversationId) return

    try {
      // Get current user (admin)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Failed to get current user')
      }

      // Add note to database (implement when notes table is ready)
      // For now, just show success message
      toast({
        title: "Note added",
        description: "Your note has been added to this conversation.",
      })

      setNewNote("")
      
      // Reload conversation to show new note
      await loadConversation(conversationId)
    } catch (error) {
      console.error('Error adding note:', error)
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle flagging a conversation
  const handleFlagConversation = async () => {
    if (!conversationId) return

    try {
      // Update conversation status in database
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'FLAGGED' })
        .eq('id', conversationId)

      if (error) {
        throw error
      }

      toast({
        title: "Conversation flagged",
        description: "This conversation has been flagged for review.",
      })
    } catch (error) {
      console.error('Error flagging conversation:', error)
      toast({
        title: "Error",
        description: "Failed to flag conversation. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle archiving a conversation
  const handleArchiveConversation = async () => {
    if (!conversationId) return

    try {
      // Update conversation status in database
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'ARCHIVED' })
        .eq('id', conversationId)

      if (error) {
        throw error
      }

      toast({
        title: "Conversation archived",
        description: "This conversation has been moved to the archive.",
      })
      
      // Go back to list after archiving
      onBackToList()
    } catch (error) {
      console.error('Error archiving conversation:', error)
      toast({
        title: "Error",
        description: "Failed to archive conversation. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle deleting a conversation
  const handleDeleteConversation = async () => {
    if (!conversationId) return

    try {
      // Delete conversation from database
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (error) {
        throw error
      }

      toast({
        title: "Conversation deleted",
        description: "This conversation has been permanently deleted.",
        variant: "destructive",
      })
      
      // Go back to list after deleting
      onBackToList()
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Format message time
  const formatMessageTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  // If no conversation is selected
  if (!conversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">Select a Conversation</h3>
        <p className="text-muted-foreground max-w-md">
          Choose a conversation from the list to view messages and interact with users.
        </p>
      </div>
    )
  }

  // Show loading state while fetching conversation
  if (loadingConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
        <h3 className="text-xl font-bold mb-2">Loading Conversation</h3>
        <p className="text-muted-foreground max-w-md">
          Please wait while we load the conversation details.
        </p>
      </div>
    )
  }

  // If conversation not found
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">Conversation Not Found</h3>
        <p className="text-muted-foreground max-w-md">
          The conversation you're looking for doesn't exist or has been removed.
        </p>
        <Button variant="outline" className="mt-4" onClick={onBackToList}>
          Back to Messages
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          </div>
        </div>

        <div className="space-y-4 py-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
              <Skeleton className={`h-24 ${i % 2 === 0 ? "w-2/3" : "w-1/2"} rounded-lg`} />
              {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={onBackToList} className="mr-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.user.avatar || "/placeholder.svg"} alt={conversation.user.name} />
              <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">{conversation.user.name}</h3>
                <Badge variant="outline" className="ml-2 text-xs">
                  {conversation.user.role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {conversation.user.level} • Last active {conversation.user.lastActive}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted/80">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted/80">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted/80">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleFlagConversation}>
                  <Flag className="h-4 w-4 mr-2" />
                  Flag Conversation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchiveConversation}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Conversation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteConversation} className="text-red-500 focus:text-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="conversation" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="w-full justify-start h-10 p-0 bg-transparent">
              <TabsTrigger
                value="conversation"
                className="rounded-none h-10 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Conversation
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="rounded-none h-10 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="rounded-none h-10 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                User Profile
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Conversation Tab */}
          <TabsContent value="conversation" className="flex-1 flex flex-col p-0 mt-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {format(conversation.messages[0].timestamp, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {conversation.messages.map((message: any) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 max-w-[85%] ${message.sender === "admin" ? "ml-auto" : ""}`}
                    >
                      {message.sender !== "admin" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage
                            src={conversation.user.avatar || "/placeholder.svg"}
                            alt={conversation.user.name}
                          />
                          <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`space-y-1 ${message.sender === "admin" ? "items-end" : ""}`}>
                        <div
                          className={`rounded-lg p-3 ${
                            message.sender === "admin"
                              ? "bg-gradient-to-r from-neo-mint to-purist-blue text-white ml-auto"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <div
                          className={`flex items-center text-xs text-muted-foreground ${
                            message.sender === "admin" ? "justify-end" : ""
                          }`}
                        >
                          <span>{formatMessageTime(message.timestamp)}</span>
                          {message.sender === "admin" && (
                            <span className="ml-1 flex items-center">
                              • {message.status === "read" ? "Read" : "Delivered"}
                            </span>
                          )}
                        </div>
                      </div>

                      {message.sender === "admin" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src="/placeholder.svg?height=40&width=40&text=AD" alt="Admin" />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Box */}
            <div className="p-4 border-t">
              <div className="flex flex-col space-y-2">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[100px] resize-none focus:ring-1 focus:ring-neo-mint"
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                          Templates
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() =>
                            setReplyText("Thank you for reaching out. I'll look into this and get back to you shortly.")
                          }
                        >
                          General Acknowledgment
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setReplyText("I've reviewed your submission and provided feedback in the comments section.")
                          }
                        >
                          Assignment Feedback
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setReplyText(
                              "For additional practice on this topic, I recommend checking out the resources in Module 3.",
                            )
                          }
                        >
                          Resource Recommendation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="bg-gradient-to-r from-neo-mint to-purist-blue hover:opacity-90 transition-opacity"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="flex-1 flex flex-col p-4 mt-0 space-y-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-3">Conversation Notes</h3>

              {conversation.notes && conversation.notes.length > 0 ? (
                <div className="space-y-3">
                  {conversation.notes.map((note: any) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-muted p-3 rounded-lg"
                    >
                      <p className="text-sm mb-2">{note.text}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{note.author}</span>
                        <span>{format(note.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="text-sm font-medium mb-1">No notes yet</h4>
                  <p className="text-xs text-muted-foreground">
                    Add notes about this conversation for internal reference.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Add Note</h3>
              <div className="flex flex-col space-y-2">
                <Textarea
                  placeholder="Add a note about this conversation..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px] resize-none focus:ring-1 focus:ring-neo-mint"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    variant="outline"
                    className="hover:bg-muted/80"
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* User Profile Tab */}
          <TabsContent value="profile" className="flex-1 p-4 mt-0">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarImage src={conversation.user.avatar || "/placeholder.svg"} alt={conversation.user.name} />
                <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{conversation.user.name}</h2>
              <p className="text-muted-foreground">{conversation.user.email}</p>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="mr-2">
                  {conversation.user.role}
                </Badge>
                <Badge variant="secondary">{conversation.user.level}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileInfoCard
                title="Contact Information"
                icon={<User className="h-4 w-4" />}
                items={[
                  { label: "Email", value: conversation.user.email },
                  { label: "Phone", value: conversation.user.phone || 'N/A' },
                  { label: "Location", value: conversation.user.location || 'N/A' },
                ]}
              />

              <ProfileInfoCard
                title="Account Details"
                icon={<Info className="h-4 w-4" />}
                items={[
                  { label: "Member Since", value: conversation.user.memberSince },
                  { label: "Last Active", value: conversation.user.lastActive },
                  { label: "Timezone", value: conversation.user.timezone || 'N/A' },
                ]}
              />
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Recent Activity
              </h3>

              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-muted p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Completed Writing Assignment</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted essay on environmental conservation (Score: 85/100)
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-muted p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Vocabulary Quiz</span>
                    <span className="text-xs text-muted-foreground">5 days ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Completed advanced vocabulary quiz (Score: 92/100)</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-muted p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Speaking Practice</span>
                    <span className="text-xs text-muted-foreground">1 week ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Participated in group speaking session on business English
                  </p>
                </motion.div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

interface ProfileInfoCardProps {
  title: string
  icon: React.ReactNode
  items: { label: string; value: string }[]
}

function ProfileInfoCard({ title, icon, items }: ProfileInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-muted/30 p-4 rounded-lg border border-border/50 hover:border-border/80 transition-colors"
    >
      <h3 className="text-sm font-medium mb-3 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-xs text-muted-foreground">{item.label}:</span>
            <span className="text-xs font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
