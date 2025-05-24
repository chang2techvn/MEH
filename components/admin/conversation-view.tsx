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

interface ConversationViewProps {
  conversationId: string | null
  isLoading: boolean
  onBackToList: () => void
  isMobile: boolean
}

// Sample conversation data
const sampleConversations: Record<string, any> = {
  msg1: {
    user: {
      id: "user1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      role: "student",
      email: "sarah.johnson@example.com",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      timezone: "GMT-5",
      lastActive: "2 hours ago",
      memberSince: "Jan 2025",
      level: "Intermediate",
    },
    messages: [
      {
        id: "m1",
        sender: "user",
        text: "Hello! I'm having trouble with the pronunciation exercise in lesson 5. Could you help me?",
        timestamp: new Date(2025, 4, 18, 14, 30),
        status: "read",
      },
      {
        id: "m2",
        sender: "admin",
        text: "Hi Sarah, I'd be happy to help with the pronunciation exercise. Which specific words or sounds are you struggling with?",
        timestamp: new Date(2025, 4, 18, 14, 35),
        status: "read",
      },
      {
        id: "m3",
        sender: "user",
        text: "Thank you! I'm having difficulty with the 'th' sound in words like 'think' and 'though'. They sound the same to me.",
        timestamp: new Date(2025, 4, 18, 14, 40),
        status: "read",
      },
      {
        id: "m4",
        sender: "admin",
        text: "I understand. The 'th' sound can be tricky for many English learners. There are actually two different 'th' sounds in English: the voiceless 'th' (as in 'think') and the voiced 'th' (as in 'though').",
        timestamp: new Date(2025, 4, 18, 14, 45),
        status: "read",
      },
      {
        id: "m5",
        sender: "admin",
        text: "For 'think', place the tip of your tongue between your teeth and blow air out without vibrating your vocal cords. For 'though', the tongue position is the same, but you need to vibrate your vocal cords.",
        timestamp: new Date(2025, 4, 18, 14, 47),
        status: "read",
      },
      {
        id: "m6",
        sender: "user",
        text: "I'll try that! Is there a video demonstration in the course materials that shows the difference?",
        timestamp: new Date(2025, 4, 18, 14, 52),
        status: "read",
      },
    ],
    notes: [
      {
        id: "n1",
        text: "Student struggles with 'th' sounds - recommend additional pronunciation exercises",
        timestamp: new Date(2025, 4, 18, 14, 55),
        author: "Admin",
      },
      {
        id: "n2",
        text: "Follow up next week to check progress on pronunciation",
        timestamp: new Date(2025, 4, 18, 15, 0),
        author: "Admin",
      },
    ],
  },
  msg2: {
    user: {
      id: "user2",
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40&text=MC",
      role: "student",
      email: "michael.chen@example.com",
      phone: "+1 (555) 987-6543",
      location: "San Francisco, USA",
      timezone: "GMT-8",
      lastActive: "5 hours ago",
      memberSince: "Feb 2025",
      level: "Advanced",
    },
    messages: [
      {
        id: "m1",
        sender: "user",
        text: "I've completed the writing assignment on environmental issues. Could you review it when you have time?",
        timestamp: new Date(2025, 4, 17, 10, 15),
        status: "read",
      },
      {
        id: "m2",
        sender: "admin",
        text: "Hi Michael, I'll review your assignment today. Is there any specific aspect you'd like me to focus on?",
        timestamp: new Date(2025, 4, 17, 11, 30),
        status: "read",
      },
      {
        id: "m3",
        sender: "user",
        text: "Thank you! I'm particularly concerned about my use of transitional phrases and paragraph structure.",
        timestamp: new Date(2025, 4, 17, 12, 45),
        status: "read",
      },
      {
        id: "m4",
        sender: "admin",
        text: "I've reviewed your assignment. Your arguments are well-researched and compelling. Regarding transitions, I've added some suggestions in the comments. Your paragraph structure is generally good, but some paragraphs could be more focused on a single main idea.",
        timestamp: new Date(2025, 4, 18, 9, 20),
        status: "read",
      },
      {
        id: "m5",
        sender: "user",
        text: "Thank you for the feedback on my writing assignment. I've made the suggested changes.",
        timestamp: new Date(2025, 4, 18, 12, 15),
        status: "read",
      },
    ],
    notes: [
      {
        id: "n1",
        text: "Student shows strong analytical skills but needs work on cohesion",
        timestamp: new Date(2025, 4, 18, 9, 30),
        author: "Admin",
      },
    ],
  },
  msg3: {
    user: {
      id: "user3",
      name: "Emma Williams",
      avatar: "/placeholder.svg?height=40&width=40&text=EW",
      role: "teacher",
      email: "emma.williams@example.com",
      phone: "+1 (555) 234-5678",
      location: "Chicago, USA",
      timezone: "GMT-6",
      lastActive: "1 hour ago",
      memberSince: "Dec 2024",
      level: "Advanced",
    },
    messages: [
      {
        id: "m1",
        sender: "user",
        text: "I've uploaded the new speaking practice materials for the advanced students. Could you review them before I share with the class?",
        timestamp: new Date(2025, 4, 18, 10, 45),
        status: "read",
      },
      {
        id: "m2",
        sender: "admin",
        text: "Hi Emma, I'll take a look at the materials today. Are there any specific aspects you'd like feedback on?",
        timestamp: new Date(2025, 4, 18, 11, 0),
        status: "read",
      },
      {
        id: "m3",
        sender: "user",
        text: "Thanks! I'm particularly interested in whether the difficulty level is appropriate and if the topics are engaging enough for advanced students.",
        timestamp: new Date(2025, 4, 18, 11, 15),
        status: "read",
      },
    ],
    notes: [
      {
        id: "n1",
        text: "Emma consistently provides high-quality materials - very reliable team member",
        timestamp: new Date(2025, 4, 18, 11, 30),
        author: "Admin",
      },
    ],
  },
}

export function ConversationView({ conversationId, isLoading, onBackToList, isMobile }: ConversationViewProps) {
  const [replyText, setReplyText] = useState("")
  const [activeTab, setActiveTab] = useState("conversation")
  const [newNote, setNewNote] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Scroll to bottom of messages when conversation changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversationId])

  // Handle sending a reply
  const handleSendReply = () => {
    if (!replyText.trim()) return

    toast({
      title: "Message sent",
      description: "Your reply has been sent successfully.",
    })

    setReplyText("")
  }

  // Handle adding a note
  const handleAddNote = () => {
    if (!newNote.trim()) return

    toast({
      title: "Note added",
      description: "Your note has been added to this conversation.",
    })

    setNewNote("")
  }

  // Handle flagging a conversation
  const handleFlagConversation = () => {
    toast({
      title: "Conversation flagged",
      description: "This conversation has been flagged for review.",
    })
  }

  // Handle archiving a conversation
  const handleArchiveConversation = () => {
    toast({
      title: "Conversation archived",
      description: "This conversation has been moved to the archive.",
    })
  }

  // Handle deleting a conversation
  const handleDeleteConversation = () => {
    toast({
      title: "Conversation deleted",
      description: "This conversation has been permanently deleted.",
      variant: "destructive",
    })
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

  const conversation = sampleConversations[conversationId]

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
                  { label: "Phone", value: conversation.user.phone },
                  { label: "Location", value: conversation.user.location },
                ]}
              />

              <ProfileInfoCard
                title="Account Details"
                icon={<Info className="h-4 w-4" />}
                items={[
                  { label: "Member Since", value: conversation.user.memberSince },
                  { label: "Last Active", value: conversation.user.lastActive },
                  { label: "Timezone", value: conversation.user.timezone },
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
