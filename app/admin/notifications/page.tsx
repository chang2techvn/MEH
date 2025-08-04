"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, addDays, addWeeks, addMonths } from "date-fns"
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Filter,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Repeat,
  Save,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash,
  Users,
  X,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Student",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "Student",
    lastActive: "5 mins ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    role: "Teacher",
    lastActive: "1 day ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@example.com",
    role: "Student",
    lastActive: "Just now",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david@example.com",
    role: "Student",
    lastActive: "3 days ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Jessica Taylor",
    email: "jessica@example.com",
    role: "Teacher",
    lastActive: "1 hour ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Ryan Martinez",
    email: "ryan@example.com",
    role: "Student",
    lastActive: "2 days ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Olivia Anderson",
    email: "olivia@example.com",
    role: "Student",
    lastActive: "4 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock data for message templates
const messageTemplates = [
  {
    id: 1,
    name: "New Event Announcement",
    subject: "Join Our Upcoming Event!",
    content: "We're excited to announce our upcoming event on [DATE]. Don't miss out on this opportunity to [BENEFIT].",
  },
  {
    id: 2,
    name: "Weekly Challenge",
    subject: "Your Weekly English Challenge is Here",
    content: "This week's challenge focuses on [TOPIC]. Complete it by [DATE] to earn bonus points!",
  },
  {
    id: 3,
    name: "Course Update",
    subject: "Important Course Update",
    content:
      "We've updated the [COURSE_NAME] with new materials. Check it out now to enhance your learning experience.",
  },
]

// Mock data for scheduled messages
const initialScheduledMessages = [
  {
    id: 1,
    title: "Weekly Newsletter",
    type: "email",
    recipients: 876,
    date: new Date(2025, 4, 15, 9, 0),
    status: "scheduled",
    recurring: "weekly",
  },
  {
    id: 2,
    title: "New Course Announcement",
    type: "zalo",
    recipients: 1254,
    date: new Date(2025, 4, 18, 14, 30),
    status: "scheduled",
    recurring: "none",
  },
  {
    id: 3,
    title: "Weekend Challenge",
    type: "email",
    recipients: 542,
    date: new Date(2025, 4, 20, 10, 0),
    status: "scheduled",
    recurring: "weekly",
  },
  {
    id: 4,
    title: "Monthly Progress Report",
    type: "email",
    recipients: 1254,
    date: new Date(2025, 5, 1, 8, 0),
    status: "scheduled",
    recurring: "monthly",
  },
]

// Mock data for notification stats
const notificationStats = {
  totalSent: 12458,
  openRate: 68,
  clickRate: 24,
  deliveryRate: 98,
}

// Helper function to get future dates based on recurring pattern
const getFutureDates = (baseDate: Date, recurring: string, count = 3) => {
  const dates = []
  let currentDate = new Date(baseDate)

  for (let i = 0; i < count; i++) {
    switch (recurring) {
      case "daily":
        currentDate = addDays(currentDate, 1)
        break
      case "weekly":
        currentDate = addWeeks(currentDate, 1)
        break
      case "monthly":
        currentDate = addMonths(currentDate, 1)
        break
      default:
        return [] // No recurring dates
    }
    dates.push(new Date(currentDate))
  }

  return dates
}

// AI suggestion prompts
const aiSuggestionPrompts = [
  "Write an announcement for a new English course",
  "Create a reminder for an upcoming event",
  "Draft a congratulatory message for course completion",
  "Write a welcome message for new users",
  "Create a notification about platform updates",
  "Write a message encouraging users to practice daily",
]

// Recent notification activity
const recentActivity = [
  {
    id: 1,
    title: "Course Update Notification",
    type: "email",
    recipients: 1248,
    sentAt: "2 hours ago",
    openRate: 42,
  },
  {
    id: 2,
    title: "Weekend Challenge Reminder",
    type: "zalo",
    recipients: 876,
    sentAt: "Yesterday",
    openRate: 68,
  },
  {
    id: 3,
    title: "New Learning Resources",
    type: "email",
    recipients: 1024,
    sentAt: "3 days ago",
    openRate: 51,
  },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [messageType, setMessageType] = useState("email")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [messageSubject, setMessageSubject] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [selectedTime, setSelectedTime] = useState("12:00")
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showUserSelector, setShowUserSelector] = useState(false)
  const [scheduledMessages, setScheduledMessages] = useState(initialScheduledMessages)
  const [selectedScheduleType, setSelectedScheduleType] = useState("once")
  const [selectedTimezone, setSelectedTimezone] = useState("utc+7")
  const [calendarView, setCalendarView] = useState<Date>(new Date())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [showScheduleDetails, setShowScheduleDetails] = useState<number | null>(null)
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progressValues, setProgressValues] = useState({
    openRate: 0,
    clickRate: 0,
    deliveryRate: 0,
  })

  // Filter users based on search query
  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle select all users
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
    setSelectAll(!selectAll)
  }

  // Handle individual user selection
  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
      setSelectAll(false)
    } else {
      setSelectedUsers([...selectedUsers, userId])
      if (selectedUsers.length + 1 === filteredUsers.length) {
        setSelectAll(true)
      }
    }
  }

  // Handle template selection
  const handleSelectTemplate = (templateId: number) => {
    const template = messageTemplates.find((t) => t.id === templateId)
    if (template) {
      setMessageSubject(template.subject)
      setMessageContent(template.content)
      setSelectedTemplate(templateId)
    }
  }

  // Simulate AI response
  const handleAiAssist = () => {
    if (!aiPrompt.trim()) return

    setAiLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const responses = [
        "We're thrilled to announce our upcoming English Speaking Workshop on [DATE]. Join us for an interactive session where you'll practice conversation skills with native speakers and fellow learners. Spaces are limited, so register now to secure your spot!",
        "Don't miss our special event: 'Mastering English Idioms' happening this weekend. This workshop will help you understand and use common English expressions that native speakers use every day. Click the link below to register and take your English to the next level!",
        "Important announcement: We've just released new learning materials in your dashboard. These resources focus on business English and professional communication. Check them out now to enhance your career prospects and communication skills!",
      ]

      setAiResponse(responses[Math.floor(Math.random() * responses.length)])
      setAiLoading(false)
    }, 1500)
  }

  // Generate AI suggestions
  const generateAiSuggestions = () => {
    setIsGeneratingSuggestions(true)

    // Simulate API call delay
    setTimeout(() => {
      const suggestions = [
        "Try adding a personalized greeting with the recipient's name",
        "Include a clear call-to-action button at the end",
        "Keep your message concise - aim for 150 words or less",
        "Add an engaging subject line with action words",
        "Include social proof or testimonials if relevant",
      ]

      setAiSuggestions(suggestions)
      setIsGeneratingSuggestions(false)
    }, 1200)
  }

  // Handle using AI response
  const handleUseAiResponse = () => {
    setMessageContent(aiResponse)
    setShowAiAssistant(false)
  }

  // Handle send message
  const handleSendMessage = () => {
    if (selectedUsers.length === 0) return

    setIsSending(true)

    // Simulate sending delay
    setTimeout(() => {
      setIsSending(false)
      setShowSuccess(true)

      // If scheduling, add to scheduled messages
      if (date && activeTab === "compose") {
        const [hours, minutes] = selectedTime.split(":").map(Number)
        const scheduleDate = new Date(date)
        scheduleDate.setHours(hours, minutes)

        const newScheduledMessage = {
          id: scheduledMessages.length + 1,
          title: messageSubject || "Untitled Message",
          type: messageType,
          recipients: selectedUsers.length,
          date: scheduleDate,
          status: "scheduled",
          recurring: selectedScheduleType,
        }

        setScheduledMessages([...scheduledMessages, newScheduledMessage])
      }

      // Reset form after success
      setTimeout(() => {
        setShowSuccess(false)
        if (activeTab === "compose") {
          setMessageSubject("")
          setMessageContent("")
          setSelectedUsers([])
          setSelectAll(false)
          setSelectedTemplate(null)
        }
      }, 3000)
    }, 2000)
  }

  // Handle delete scheduled message
  const handleDeleteScheduledMessage = (id: number) => {
    setScheduledMessages(scheduledMessages.filter((message) => message.id !== id))
    setShowDeleteConfirm(null)
  }

  // Handle save template
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || !messageContent.trim()) return

    // Add new template
    const newTemplate = {
      id: messageTemplates.length + 1,
      name: newTemplateName,
      subject: messageSubject,
      content: messageContent,
    }

    // In a real app, you would save this to your database
    // For now, we'll just close the dialog
    setShowNewTemplateDialog(false)
    setNewTemplateName("")

    toast({
      title: "Template saved",
      description: "Your message template has been saved successfully",
    })
  }

  // Refresh data
  const refreshData = () => {
    setIsLoading(true)

    // Reset progress values to create animation effect
    setProgressValues({
      openRate: 0,
      clickRate: 0,
      deliveryRate: 0,
    })

    // Simulate API call
    setTimeout(() => {
      setProgressValues({
        openRate: notificationStats.openRate,
        clickRate: notificationStats.clickRate,
        deliveryRate: notificationStats.deliveryRate,
      })
      setIsLoading(false)
      toast({
        title: "Dashboard refreshed",
        description: "Latest notification data has been loaded",
      })
    }, 1500)
  }

  // Effect to generate AI suggestions when content changes
  useEffect(() => {
    if (messageContent.length > 50 && aiSuggestions.length === 0 && !isGeneratingSuggestions) {
      generateAiSuggestions()
    }
  }, [messageContent])

  // Effect to animate progress bars on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValues({
        openRate: notificationStats.openRate,
        clickRate: notificationStats.clickRate,
        deliveryRate: notificationStats.deliveryRate,
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Notification Center</h1>
          <p className="text-muted-foreground mt-1">Send targeted messages to your users via email and Zalo</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading} className="shadow-neo">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 shadow-neo"
            onClick={() => setActiveTab("compose")}
          >
            <Send className="h-4 w-4 mr-2" />
            New Message
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative group hover:bg-muted transition-colors"
                  onClick={() =>
                    toast({
                      title: "Notifications",
                      description: "You have new notifications",
                    })
                  }
                >
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
                  <Bell className="relative h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-neo-mint to-purist-blue text-[10px] text-white shadow-glow-sm notification-indicator">
                    3
                  </span>
                  <span className="sr-only">Notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-neo-mint/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Bell className="h-4 w-4 mr-2 text-purist-blue" />
                Total Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{notificationStats.totalSent.toLocaleString()}</div>
                <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="font-medium">+8%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Across all channels</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purist-blue/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2 text-neo-mint" />
                Open Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{progressValues.openRate}%</div>
                <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="font-medium">+3%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Average email open rate</p>
              <div className="mt-3">
                <Progress value={progressValues.openRate} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cantaloupe/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-cassis" />
                Click Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{progressValues.clickRate}%</div>
                <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="font-medium">+2%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Average click-through rate</p>
              <div className="mt-3">
                <Progress value={progressValues.clickRate} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-mellow-yellow/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Check className="h-4 w-4 mr-2 text-purist-blue" />
                Delivery Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{progressValues.deliveryRate}%</div>
                <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="font-medium">+1%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Successful delivery rate</p>
              <div className="mt-3">
                <Progress value={progressValues.deliveryRate} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="compose"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Compose</span>
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Scheduled</span>
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="overview" className="space-y-6 mt-0">
                  {/* Activity and Recent Notifications */}
                  <div className="grid gap-6 md:grid-cols-7">
                    <Card className="md:col-span-4 border-none shadow-neo">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                          <CardTitle className="text-lg font-semibold">Notification Activity</CardTitle>
                          <CardDescription>Message engagement over the last 30 days</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-purist-blue/10">
                          <ArrowUpRight className="h-3 w-3 mr-1 text-purist-blue" />
                          Improving
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[240px] w-full rounded-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center relative overflow-hidden">
                          {/* Simulated chart with animated bars */}
                          <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                            {[40, 65, 35, 85, 55, 45, 70, 60, 75, 50, 90, 65].map((height, i) => (
                              <motion.div
                                key={i}
                                className="w-4 bg-gradient-to-t from-purist-blue to-neo-mint rounded-t-md"
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{
                                  delay: i * 0.05,
                                  duration: 0.7,
                                  type: "spring",
                                  stiffness: 50,
                                }}
                              />
                            ))}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-3 border-none shadow-neo">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            View all
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription>Latest messages sent to users</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentActivity.map((activity, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                            >
                              <div
                                className={cn(
                                  "p-2 rounded-full",
                                  activity.type === "email"
                                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                                )}
                              >
                                {activity.type === "email" ? (
                                  <Mail className="h-4 w-4" />
                                ) : (
                                  <MessageSquare className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{activity.title}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                                    {activity.recipients} recipients
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">{activity.sentAt}</p>
                                </div>
                              </div>
                              <div className="text-xs font-medium whitespace-nowrap flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                                {activity.openRate}% open rate
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Templates and Quick Actions */}
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-none shadow-neo">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Message Templates</CardTitle>
                        <CardDescription>Reusable message templates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {messageTemplates.map((template, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 flex items-center justify-center">
                                <Mail className="h-5 w-5 text-purist-blue" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{template.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{template.subject}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => {
                                  handleSelectTemplate(template.id)
                                  setActiveTab("compose")
                                }}
                              >
                                Use
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-neo">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Upcoming Scheduled</CardTitle>
                        <CardDescription>Next messages to be sent</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {scheduledMessages
                            .filter((msg) => new Date(msg.date) > new Date())
                            .sort((a, b) => a.date.getTime() - b.date.getTime())
                            .slice(0, 3)
                            .map((message, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                              >
                                <div
                                  className={cn(
                                    "p-2 rounded-full",
                                    message.type === "email"
                                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                      : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                                  )}
                                >
                                  {message.type === "email" ? (
                                    <Mail className="h-4 w-4" />
                                  ) : (
                                    <MessageSquare className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium leading-none">{message.title}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">
                                      {format(message.date, "MMM d")} at {format(message.date, "p")}
                                    </p>
                                    {message.recurring !== "none" && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                                        {message.recurring}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-neo">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                        <CardDescription>Common notification tasks</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              label: "New Message",
                              icon: <Edit className="h-4 w-4 text-purist-blue" />,
                              tab: "compose",
                            },
                            { label: "Schedule", icon: <Clock className="h-4 w-4 text-neo-mint" />, tab: "scheduled" },
                            { label: "Templates", icon: <Mail className="h-4 w-4 text-cassis" />, tab: "overview" },
                            {
                              label: "AI Assistant",
                              icon: <Sparkles className="h-4 w-4 text-purple-500" />,
                              tab: "compose",
                            },
                            {
                              label: "Analytics",
                              icon: <BarChart3 className="h-4 w-4 text-purist-blue" />,
                              tab: "overview",
                            },
                            {
                              label: "Settings",
                              icon: <Settings className="h-4 w-4 text-muted-foreground" />,
                              tab: "overview",
                            },
                          ].map((action, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-neo hover:shadow-glow-sm transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center"
                              onClick={() => {
                                setActiveTab(action.tab)
                                if (action.label === "AI Assistant") {
                                  setShowAiAssistant(true)
                                }
                              }}
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 flex items-center justify-center">
                                {action.icon}
                              </div>
                              <span className="text-xs font-medium">{action.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </motion.div>
            )}

            {activeTab === "compose" && (
              <motion.div
                key="compose"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="compose" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Recipient Selection */}
                    <Card className="lg:col-span-1 border-none shadow-neo">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Recipients
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {selectedUsers.length} selected
                          </Badge>
                        </CardTitle>
                        <CardDescription>Select users to receive your notification</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => setShowUserSelector(true)}
                            >
                              <Users className="h-3.5 w-3.5 mr-1" />
                              Select Users
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => setSelectedUsers([])}
                            >
                              <X className="h-3.5 w-3.5 mr-1" />
                              Clear All
                            </Button>
                          </div>

                          {selectedUsers.length > 0 ? (
                            <ScrollArea className="h-[300px] rounded-md border p-2">
                              <div className="space-y-2">
                                {selectedUsers.map((userId) => {
                                  const user = mockUsers.find((u) => u.id === userId)
                                  if (!user) return null

                                  return (
                                    <motion.div
                                      key={user.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="text-sm font-medium">{user.name}</p>
                                          <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleSelectUser(user.id)}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </motion.div>
                                  )
                                })}
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] border rounded-md p-4">
                              <Users className="h-12 w-12 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground text-center">No recipients selected</p>
                              <p className="text-xs text-muted-foreground text-center mt-1">
                                Click "Select Users" to choose recipients
                              </p>
                            </div>
                          )}

                          <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Scheduling Options</Label>
                            </div>

                            <div className="space-y-3">
                              <div className="grid gap-2">
                                <Label htmlFor="schedule-type">Delivery Type</Label>
                                <Select value={selectedScheduleType} onValueChange={setSelectedScheduleType}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select schedule type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="once">Send Once</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor="date">Start Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id="date"
                                      variant={"outline"}
                                      className={cn(
                                        "justify-start text-left font-normal",
                                        !date && "text-muted-foreground",
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {date ? format(date, "PPP") : "Select date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                  </PopoverContent>
                                </Popover>
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor="time">Time</Label>
                                <div className="flex items-center gap-2">
                                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectLabel>Morning</SelectLabel>
                                        {["08:00", "09:00", "10:00", "11:00"].map((time) => (
                                          <SelectItem key={time} value={time}>
                                            {time}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                      <SelectGroup>
                                        <SelectLabel>Afternoon</SelectLabel>
                                        {["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                                          <SelectItem key={time} value={time}>
                                            {time}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                      <SelectGroup>
                                        <SelectLabel>Evening</SelectLabel>
                                        {["18:00", "19:00", "20:00", "21:00"].map((time) => (
                                          <SelectItem key={time} value={time}>
                                            {time}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid gap-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="utc+7">Vietnam (UTC+7)</SelectItem>
                                    <SelectItem value="utc+8">Singapore/China (UTC+8)</SelectItem>
                                    <SelectItem value="utc+9">Japan/Korea (UTC+9)</SelectItem>
                                    <SelectItem value="utc+0">UTC</SelectItem>
                                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {selectedScheduleType !== "once" && (
                                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                                  <h4 className="text-sm font-medium mb-2 flex items-center">
                                    <Repeat className="h-4 w-4 mr-1" />
                                    Recurring Preview
                                  </h4>
                                  <div className="space-y-1">
                                    {date &&
                                      getFutureDates(date, selectedScheduleType).map((futureDate, index) => (
                                        <div key={index} className="text-xs text-muted-foreground">
                                          {format(futureDate, "PPP")} at {selectedTime}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Middle and Right Columns - Message Composition */}
                    <Card className="lg:col-span-2 border-none shadow-neo">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Edit className="h-5 w-5" />
                            Compose Message
                          </span>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className={cn(
                                      "h-8 w-8 transition-all",
                                      showAiAssistant && "bg-purple-100 dark:bg-purple-900/20 text-purple-500",
                                    )}
                                    onClick={() => setShowAiAssistant(!showAiAssistant)}
                                  >
                                    <Sparkles className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>AI Writing Assistant</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Save className="h-3.5 w-3.5 mr-1" />
                                  Save as Template
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Save as Template</DialogTitle>
                                  <DialogDescription>
                                    Save your current message as a template for future use
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="template-name">Template Name</Label>
                                    <Input
                                      id="template-name"
                                      placeholder="Enter template name"
                                      value={newTemplateName}
                                      onChange={(e) => setNewTemplateName(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Preview</Label>
                                    <div className="p-3 bg-muted rounded-md">
                                      <p className="font-medium">{messageSubject || "(No subject)"}</p>
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                                        {messageContent || "(No content)"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setShowNewTemplateDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleSaveTemplate} disabled={!newTemplateName.trim()}>
                                    Save Template
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Select onValueChange={(value) => handleSelectTemplate(Number.parseInt(value))}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Templates" />
                              </SelectTrigger>
                              <SelectContent>
                                {messageTemplates.map((template) => (
                                  <SelectItem key={template.id} value={template.id.toString()}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardTitle>
                        <CardDescription>Create your notification message</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs value={messageType} onValueChange={setMessageType} className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="email" className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </TabsTrigger>
                            <TabsTrigger value="zalo" className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Zalo
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="email" className="space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="subject">Subject</Label>
                              <Input
                                id="subject"
                                placeholder="Enter email subject"
                                value={messageSubject}
                                onChange={(e) => setMessageSubject(e.target.value)}
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="content">Content</Label>
                              <div className="relative">
                                <Textarea
                                  id="content"
                                  placeholder="Write your message here..."
                                  className="min-h-[200px]"
                                  value={messageContent}
                                  onChange={(e) => setMessageContent(e.target.value)}
                                />

                                {showAiAssistant && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute inset-0 bg-background border rounded-md shadow-lg p-4 z-10"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="text-sm font-medium flex items-center">
                                        <Sparkles className="h-4 w-4 text-purple-500 mr-1" />
                                        AI Writing Assistant
                                      </h3>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => setShowAiAssistant(false)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <div className="space-y-3">
                                      <div className="flex gap-2">
                                        <Input
                                          placeholder="Describe what you want to write..."
                                          value={aiPrompt}
                                          onChange={(e) => setAiPrompt(e.target.value)}
                                          className="flex-1"
                                        />
                                        <Button onClick={handleAiAssist} disabled={aiLoading || !aiPrompt.trim()}>
                                          {aiLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                          ) : (
                                            <Sparkles className="h-4 w-4 mr-1" />
                                          )}
                                          Generate
                                        </Button>
                                      </div>

                                      {aiResponse && (
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className="p-3 bg-muted rounded-md"
                                        >
                                          <p className="text-sm mb-2">{aiResponse}</p>
                                          <div className="flex justify-end">
                                            <Button size="sm" variant="secondary" onClick={handleUseAiResponse}>
                                              <Check className="h-3.5 w-3.5 mr-1" />
                                              Use This
                                            </Button>
                                          </div>
                                        </motion.div>
                                      )}

                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {aiSuggestionPrompts.map((prompt, index) => (
                                          <Badge
                                            key={index}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-muted transition-colors"
                                            onClick={() => setAiPrompt(prompt)}
                                          >
                                            {prompt}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="include-images" />
                              <Label htmlFor="include-images">Include images</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="track-opens" defaultChecked />
                              <Label htmlFor="track-opens">Track opens and clicks</Label>
                            </div>

                            {aiSuggestions.length > 0 && !showAiAssistant && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-md"
                              >
                                <h4 className="text-sm font-medium mb-2 flex items-center text-purple-700 dark:text-purple-400">
                                  <Sparkles className="h-4 w-4 mr-1" />
                                  AI Writing Suggestions
                                </h4>
                                <ul className="space-y-1">
                                  {aiSuggestions.map((suggestion, index) => (
                                    <li
                                      key={index}
                                      className="text-xs text-purple-700 dark:text-purple-400 flex items-start"
                                    >
                                      <Check className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                      {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </TabsContent>

                          <TabsContent value="zalo" className="space-y-4">
                            <div className="grid gap-2">
                              <Label htmlFor="zalo-title">Title</Label>
                              <Input
                                id="zalo-title"
                                placeholder="Enter message title"
                                value={messageSubject}
                                onChange={(e) => setMessageSubject(e.target.value)}
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="zalo-content">Message</Label>
                              <Textarea
                                id="zalo-content"
                                placeholder="Write your Zalo message here..."
                                className="min-h-[200px]"
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="include-buttons" />
                              <Label htmlFor="include-buttons">Include action buttons</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch id="send-push" defaultChecked />
                              <Label htmlFor="send-push">Send as push notification</Label>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-6">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Globe className="h-3.5 w-3.5 mr-1" />
                            Preview
                          </Button>
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          disabled={
                            isSending ||
                            selectedUsers.length === 0 ||
                            !messageContent.trim() ||
                            (messageType === "email" && !messageSubject.trim())
                          }
                          className="relative"
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : showSuccess ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Sent Successfully!
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              {selectedScheduleType !== "once" ? "Schedule Recurring" : "Schedule"}
                            </>
                          )}

                          {showSuccess && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.2, 1] }}
                              className="absolute inset-0 bg-green-500/20 rounded-md"
                            />
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>
              </motion.div>
            )}

            {activeTab === "scheduled" && (
              <motion.div
                key="scheduled"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="scheduled" className="space-y-6 mt-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Scheduled Messages</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-3.5 w-3.5 mr-1" />
                        Filter
                      </Button>
                      <Button size="sm" onClick={() => setActiveTab("compose")}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        New Schedule
                      </Button>
                    </div>
                  </div>

                  {scheduledMessages.length > 0 ? (
                    <div className="grid gap-4">
                      {scheduledMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="relative overflow-hidden"
                        >
                          <Card className="border-l-4 border-l-primary border-none shadow-neo">
                            <CardContent className="p-0">
                              <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "p-2 rounded-full",
                                      message.type === "email"
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                                    )}
                                  >
                                    {message.type === "email" ? (
                                      <Mail className="h-5 w-5" />
                                    ) : (
                                      <MessageSquare className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{message.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {format(message.date, "PPP")} at {format(message.date, "p")}
                                      {message.recurring !== "none" && (
                                        <span className="ml-2 text-xs">• Recurring {message.recurring}</span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {message.recipients} recipient{message.recipients !== 1 && "s"}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      message.status === "scheduled"
                                        ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                        : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                                    )}
                                  >
                                    {message.status === "scheduled" ? "Scheduled" : "Sent"}
                                  </Badge>

                                  <div className="flex items-center">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setShowScheduleDetails(message.id)}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Edit Schedule</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500"
                                            onClick={() => setShowDeleteConfirm(message.id)}
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Delete Schedule</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              </div>

                              {/* Upcoming occurrences for recurring messages */}
                              {message.recurring !== "none" && (
                                <div className="px-4 pb-4 pt-0">
                                  <div className="p-3 bg-muted/50 rounded-md">
                                    <h4 className="text-xs font-medium mb-2 flex items-center">
                                      <Repeat className="h-3.5 w-3.5 mr-1" />
                                      Upcoming Occurrences
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                      {getFutureDates(message.date, message.recurring).map((futureDate, index) => (
                                        <div key={index} className="text-xs text-muted-foreground flex items-center">
                                          <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground/70" />
                                          {format(futureDate, "PPP")} at {format(message.date, "p")}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Delete confirmation */}
                          <AnimatePresence>
                            {showDeleteConfirm === message.id && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center"
                              >
                                <div className="p-4 text-center">
                                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                  <h3 className="font-medium mb-1">Delete this scheduled message?</h3>
                                  <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
                                  <div className="flex items-center justify-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(null)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteScheduledMessage(message.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Schedule details */}
                          <AnimatePresence>
                            {showScheduleDetails === message.id && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center"
                              >
                                <div className="p-4 w-full max-w-md">
                                  <h3 className="font-medium mb-3 flex items-center">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit Schedule
                                  </h3>
                                  <div className="space-y-3 mb-4">
                                    <div className="grid gap-1.5">
                                      <Label htmlFor="edit-title">Title</Label>
                                      <Input id="edit-title" defaultValue={message.title} />
                                    </div>
                                    <div className="grid gap-1.5">
                                      <Label htmlFor="edit-date">Next Send Date</Label>
                                      <div className="flex items-center gap-2">
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {format(message.date, "PPP")}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={message.date} initialFocus />
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                    </div>
                                    <div className="grid gap-1.5">
                                      <Label htmlFor="edit-time">Time</Label>
                                      <Select defaultValue={format(message.date, "HH:mm")}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {["08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map(
                                            (time) => (
                                              <SelectItem key={time} value={time}>
                                                {time}
                                              </SelectItem>
                                            ),
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid gap-1.5">
                                      <Label htmlFor="edit-recurring">Recurring</Label>
                                      <Select defaultValue={message.recurring}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="none">No Repeat</SelectItem>
                                          <SelectItem value="daily">Daily</SelectItem>
                                          <SelectItem value="weekly">Weekly</SelectItem>
                                          <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setShowScheduleDetails(null)}>
                                      Cancel
                                    </Button>
                                    <Button size="sm" onClick={() => setShowScheduleDetails(null)}>
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 border rounded-md">
                      <Bell className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No scheduled messages</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Create a new message to schedule it for delivery
                      </p>
                      <Button onClick={() => setActiveTab("compose")}>
                        <Plus className="h-4 w-4 mr-1" />
                        Create New Message
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </motion.div>
            )}

            {activeTab === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="calendar" className="space-y-6 mt-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCalendarView(addMonths(calendarView, -1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-xl font-semibold">{format(calendarView, "MMMM yyyy")}</h2>
                      <Button variant="outline" size="icon" onClick={() => setCalendarView(addMonths(calendarView, 1))}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCalendarView(new Date())}>
                        Today
                      </Button>
                      <Select defaultValue="month">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Card className="border-none shadow-neo">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-7 gap-1">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                          <div key={day} className="text-center text-sm font-medium py-2">
                            {day}
                          </div>
                        ))}

                        {/* Calendar grid - this is a simplified version */}
                        {Array.from({ length: 35 }).map((_, index) => {
                          // This is a simplified calendar view - in a real app you'd calculate actual dates
                          const day = index + 1
                          const hasEvents = scheduledMessages.some((msg) => {
                            const msgDate = new Date(msg.date)
                            return msgDate.getDate() === day && msgDate.getMonth() === calendarView.getMonth()
                          })

                          const events = scheduledMessages.filter((msg) => {
                            const msgDate = new Date(msg.date)
                            return msgDate.getDate() === day && msgDate.getMonth() === calendarView.getMonth()
                          })

                          return (
                            <div
                              key={index}
                              className={cn(
                                "min-h-[100px] p-1 border rounded-md",
                                day > 31 && "opacity-50 bg-muted/50",
                                hasEvents && "border-primary/50",
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <span className={cn("text-sm font-medium", day > 31 && "text-muted-foreground")}>
                                  {day <= 31 ? day : day - 31}
                                </span>
                                {hasEvents && <Badge className="text-[10px] px-1">{events.length}</Badge>}
                              </div>

                              <div className="mt-1 space-y-1">
                                {events.map((event) => (
                                  <div
                                    key={event.id}
                                    className={cn(
                                      "text-[10px] p-1 rounded truncate",
                                      event.type === "email"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                        : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
                                    )}
                                  >
                                    {format(event.date, "HH:mm")} - {event.title}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-neo">
                    <CardHeader>
                      <CardTitle className="text-lg">Upcoming Scheduled Messages</CardTitle>
                      <CardDescription>View all your upcoming scheduled messages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {scheduledMessages
                          .filter((msg) => new Date(msg.date) > new Date())
                          .sort((a, b) => a.date.getTime() - b.date.getTime())
                          .slice(0, 5)
                          .map((message) => (
                            <div key={message.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "p-2 rounded-full",
                                    message.type === "email"
                                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                      : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                                  )}
                                >
                                  {message.type === "email" ? (
                                    <Mail className="h-4 w-4" />
                                  ) : (
                                    <MessageSquare className="h-4 w-4" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium">{message.title}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {format(message.date, "PPP")} at {format(message.date, "p")}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline">
                                {message.recipients} recipient{message.recipients !== 1 && "s"}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* User Selection Dialog */}
      <Dialog open={showUserSelector} onOpenChange={setShowUserSelector}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Recipients</DialogTitle>
            <DialogDescription>Choose users to receive your notification</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all users" />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "Teacher" ? "outline" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No users found matching your search
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{selectedUsers.length} users selected</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUserSelector(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowUserSelector(false)}>Confirm Selection</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
