"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart3,
  BookOpen,
  Users,
  Activity,
  TrendingUp,
  Bell,
  Video,
  MessageSquare,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Zap,
  Globe,
  Plus,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { dbHelpers } from "@/lib/supabase"

// Type definitions for better type safety
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  created_at: string
  last_active?: string
  is_active?: boolean
  role?: string
  points?: number
  streak_days?: number
  level?: number
}

interface Challenge {
  id: string
  title: string
  category?: string
  created_at: string
}

interface ChallengeSubmission {
  id: string
  created_at: string
  ai_evaluation?: any
  user?: User
  challenge?: Challenge
}

interface ResourceType {
  id: string
  title: string
  type: string
  category?: string
  views?: number
  created_at: string
}

interface Message {
  id: string
  created_at: string
  sender_id?: string
  recipient_id?: string
}

interface Post {
  id: string
  title?: string
  created_at: string
  tags?: string[]
}

// Dashboard data interfaces
interface DashboardData {
  quickStats: {
    totalUsers: number
    activeUsers: number
    totalChallenges: number
    completedSubmissions: number
    averageScore: number
    newUsersThisMonth: number
  }
  recentActivities: Activity[]
  popularResources: Resource[]
  newUsers: NewUser[]
  upcomingEvents: Event[]
  progressMetrics: {
    dailyActive: number
    weeklyCompletion: number
    monthlyGrowth: number
    engagementRate: number
  }
}

interface Activity {
  id: string
  user: string
  action: string
  target: string
  time: string
  avatar: string
  type: 'challenge' | 'resource' | 'user' | 'system'
}

interface Resource {
  id: string
  title: string
  type: string
  views: number
  completion: number
  category: string
  uploadedAt: string
}

interface NewUser {
  id: string
  name: string
  level: string
  joinedAgo: string
  avatar: string
}

interface Event {
  id: string
  title: string
  date: { month: string; day: string }
  time: string
  type: string
  attendees: number
  status: 'upcoming' | 'ongoing' | 'completed'
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [progressValues, setProgressValues] = useState({
    dailyActive: 0,
    weeklyCompletion: 0,
    monthlyGrowth: 0,
    engagementRate: 0,
  })
  const [showNotification, setShowNotification] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showResourceDialog, setShowResourceDialog] = useState(false)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showChallengeDialog, setShowChallengeDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [eventTitle, setEventTitle] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventType, setEventType] = useState("meeting")
  const [resourceTitle, setResourceTitle] = useState("")
  const [resourceType, setResourceType] = useState("video")
  const [resourceDescription, setResourceDescription] = useState("")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState("student")
  const [challengeTitle, setChallengeTitle] = useState("")
  const [challengeType, setChallengeType] = useState("writing")
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState("all")

  // Load dashboard data from Supabase
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {    try {
      setIsLoading(true)
      
      // Load data in parallel for better performance
      const [
        usersResult,
        challengesResult,
        submissionsResult,
        resourcesResult,
        messagesResult,
        postsResult
      ] = await Promise.all([
        dbHelpers.getUsers(),
        dbHelpers.getChallenges(),
        dbHelpers.getChallengeSubmissions(),
        dbHelpers.getResources(),
        dbHelpers.getMessages(),
        dbHelpers.getPosts()
      ])

      const users = usersResult.data || []
      const challenges = challengesResult || []
      const submissions = submissionsResult || []
      const resources = resourcesResult || []
      const messages = messagesResult.data || []
      const posts = postsResult.data || []

      // Calculate metrics
      const now = new Date()
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const newUsersThisMonth = users.filter((user) =>
        user.created_at && new Date(user.created_at) >= oneMonthAgo
      ).length

      const activeUsers = users.filter((user) => 
        user.last_active && new Date(user.last_active) >= oneWeekAgo
      ).length

      const completedSubmissions = submissions.filter((submission) => 
        submission.ai_evaluation && submission.ai_evaluation !== null
      ).length

      const avgScore = submissions.length > 0 
        ? Math.round(submissions.reduce((acc: number, sub) => {
            const evaluation = sub.ai_evaluation as any
            return acc + (evaluation?.score || 0)
          }, 0) / submissions.length)        : 0

      // Recent activities from various sources
      const recentActivities: Activity[] = [
        ...submissions.slice(0, 3).map((sub) => ({
          id: sub.id,
          user: 'Anonymous',
          avatar: '/placeholder.svg?height=40&width=40',
          action: 'completed challenge',
          target: sub.challenge?.title || 'Challenge',
          time: formatTimeAgo(sub.created_at || new Date().toISOString()),
          type: 'challenge' as const
        })),
        ...users.slice(0, 2).filter((user) => 
          user.created_at && new Date(user.created_at) >= oneWeekAgo
        ).map((user) => ({
          id: user.id,
          user: user.name,
          avatar: user.avatar || '/placeholder.svg?height=40&width=40',
          action: 'joined platform',
          target: 'Community',
          time: formatTimeAgo(user.created_at || new Date().toISOString()),
          type: 'user' as const
        }))
      ]      // Popular resources based on views and downloads
      const popularResources: Resource[] = resources
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map((resource) => ({
          id: resource.id,
          title: resource.title,
          type: resource.type,
          views: resource.views || 0,
          completion: Math.floor(Math.random() * 30) + 70, // Estimate completion rate
          category: resource.category || 'General',
          uploadedAt: resource.created_at || new Date().toISOString(),
          icon: resource.type === 'VIDEO' ? '🎥' : resource.type === 'AUDIO' ? '🎵' : resource.type === 'PDF' ? '📄' : '📚'
        }))      // New users from this month
      const newUsers: NewUser[] = users
        .filter((user) => user.created_at && new Date(user.created_at) >= oneMonthAgo)
        .slice(0, 5)
        .map((user) => ({
          id: user.id,
          name: user.name,
          level: user.level ? (user.level >= 8 ? 'Advanced' : user.level >= 4 ? 'Intermediate' : 'Beginner') : 'Beginner',
          joinedAgo: formatTimeAgo(user.created_at || new Date().toISOString()),
          avatar: user.avatar || '/placeholder.svg?height=40&width=40'
        }))// Mock upcoming events (replace with real events when available)
      const upcomingEvents: Event[] = [
        {
          id: '1',
          title: 'Weekly Grammar Workshop',
          date: { month: 'JUN', day: '08' },
          time: '2:00 PM',
          type: 'workshop',
          attendees: 25,
          status: 'upcoming'
        },
        {
          id: '2',
          title: 'Speaking Practice Session',
          date: { month: 'JUN', day: '10' },
          time: '6:00 PM',
          type: 'practice',
          attendees: 18,
          status: 'upcoming'
        }
      ]      // Calculate progress metrics
      const dailyActiveUsers = users.filter((user) => 
        user.last_active && new Date(user.last_active) >= oneDayAgo
      ).length
      const dailyActiveRate = users.length > 0 ? Math.round((dailyActiveUsers / users.length) * 100) : 0

      const weeklyCompletions = submissions.filter((sub) => 
        sub.created_at && new Date(sub.created_at) >= oneWeekAgo
      ).length
      const weeklyCompletionRate = challenges.length > 0 ? Math.min(Math.round((weeklyCompletions / challenges.length) * 100), 100) : 0

      const monthlyGrowthRate = users.length > 0 ? Math.round((newUsersThisMonth / users.length) * 100) : 0

      const engagementRate = Math.round((activeUsers / Math.max(users.length, 1)) * 100)

      const dashboardData: DashboardData = {
        quickStats: {
          totalUsers: users.length,
          activeUsers,
          totalChallenges: challenges.length,
          completedSubmissions,
          averageScore: avgScore,
          newUsersThisMonth
        },
        recentActivities: recentActivities.slice(0, 5),
        popularResources,
        newUsers,
        upcomingEvents,
        progressMetrics: {
          dailyActive: dailyActiveRate,
          weeklyCompletion: weeklyCompletionRate,
          monthlyGrowth: monthlyGrowthRate,
          engagementRate
        }
      }

      setDashboardData(dashboardData)
      
      // Animate progress values
      setTimeout(() => {
        setProgressValues(dashboardData.progressMetrics)
      }, 500)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error loading dashboard",
        description: "Unable to load dashboard data. Please refresh the page.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Simulate loading data
  useEffect(() => {
    if (dashboardData) {
      const timer = setTimeout(() => {
        setProgressValues(dashboardData.progressMetrics)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [dashboardData])

  const refreshData = () => {
    loadDashboardData()
  }

  // Handle quick actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "addResource":
        setShowResourceDialog(true)
        break
      case "manageUsers":
        router.push("/admin/users")
        break
      case "viewReports":
        router.push("/admin/analytics")
        break
      case "sendNotification":
        setShowNotificationDialog(true)
        break
      case "createChallenge":
        setShowChallengeDialog(true)
        break
      case "siteSettings":
        router.push("/admin/settings")
        break
      default:
        break
    }
  }

  // Handle navigation to other admin pages
  const handleNavigation = (path: string) => {
    router.push(path)
  }

  // Handle view all actions
  const handleViewAll = (section: string) => {
    switch (section) {
      case "activity":
        router.push("/admin/analytics")
        break
      case "resources":
        router.push("/admin/resources")
        break
      case "users":
        router.push("/admin/users")
        break
      case "calendar":
        router.push("/admin/calendar")
        break
      default:
        break
    }
  }

  // Handle add event
  const handleAddEvent = () => {
    if (!eventTitle || !eventDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowEventDialog(false)
      setEventTitle("")
      setEventDate("")
      setEventType("meeting")

      toast({
        title: "Event added",
        description: "Your event has been added to the calendar",
      })
    }, 1000)
  }

  // Handle add resource
  const handleAddResource = () => {
    if (!resourceTitle || !resourceType) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowResourceDialog(false)
      setResourceTitle("")
      setResourceType("video")
      setResourceDescription("")

      toast({
        title: "Resource added",
        description: "Your learning resource has been added",
      })
    }, 1000)
  }

  // Handle add user
  const handleAddUser = () => {
    if (!userName || !userEmail || !userRole) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowUserDialog(false)
      setUserName("")
      setUserEmail("")
      setUserRole("student")

      toast({
        title: "User added",
        description: "New user has been added to the platform",
      })
    }, 1000)
  }

  // Handle add challenge
  const handleAddChallenge = () => {
    if (!challengeTitle || !challengeType) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowChallengeDialog(false)
      setChallengeTitle("")
      setChallengeType("writing")

      toast({
        title: "Challenge created",
        description: "New challenge has been created successfully",
      })
    }, 1000)
  }

  // Handle send notification
  const handleSendNotification = () => {
    if (!notificationTitle || !notificationMessage) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowNotificationDialog(false)
      setNotificationTitle("")
      setNotificationMessage("")
      setNotificationType("all")

      toast({
        title: "Notification sent",
        description: "Your notification has been sent to users",
      })
    }, 1000)
  }
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

  // Quick actions configuration
  const quickActions = [
    {
      id: "addResource",
      label: "Add Resource",
      icon: <BookOpen className="h-5 w-5 text-purist-blue" />
    },
    {
      id: "manageUsers",
      label: "Manage Users",
      icon: <Users className="h-5 w-5 text-neo-mint" />
    },
    {
      id: "viewReports",
      label: "View Reports",
      icon: <BarChart3 className="h-5 w-5 text-cassis" />
    },
    {
      id: "sendNotification",
      label: "Send Notice",
      icon: <Bell className="h-5 w-5 text-mellow-yellow" />
    },
    {
      id: "createChallenge",
      label: "Create Challenge",
      icon: <Award className="h-5 w-5 text-purist-blue" />
    },
    {
      id: "siteSettings",
      label: "Settings",
      icon: <Zap className="h-5 w-5 text-neo-mint" />
    }
  ]
  // Use upcoming events directly from dashboard data
  const upcomingEvents = dashboardData?.upcomingEvents || []

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
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your platform today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading} className="shadow-neo">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white border-0 shadow-neo"
            onClick={() => setShowNotificationDialog(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
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
                <Users className="h-4 w-4 mr-2 text-purist-blue" />
                Total Users
              </CardTitle>
            </CardHeader>            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{dashboardData?.quickStats.totalUsers || 0}</div>
                <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="font-medium">+{Math.round((dashboardData?.quickStats.newUsersThisMonth || 0) / Math.max(dashboardData?.quickStats.totalUsers || 1, 1) * 100)}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Compared to previous month</p>
              <div className="mt-3">
                <Progress value={progressValues.monthlyGrowth} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purist-blue/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2 text-neo-mint" />
                Active Learners
              </CardTitle>
            </CardHeader>            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{dashboardData?.quickStats.activeUsers || 0}</div>
                <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="font-medium">+{progressValues.dailyActive}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Daily active users</p>
              <div className="mt-3">
                <Progress value={progressValues.dailyActive} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cantaloupe/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-cassis" />
                Challenge Completion
              </CardTitle>
            </CardHeader>            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{progressValues.weeklyCompletion}%</div>
                <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="font-medium">+4%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Weekly completion rate</p>
              <div className="mt-3">
                <Progress value={progressValues.weeklyCompletion} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-mellow-yellow/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-purist-blue" />
                Engagement Rate
              </CardTitle>
            </CardHeader>            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{progressValues.engagementRate}%</div>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                  progressValues.engagementRate >= 70 
                    ? 'text-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'text-red-500 bg-red-50 dark:bg-red-900/20'
                }`}>
                  {progressValues.engagementRate >= 70 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  <span className="font-medium">{progressValues.engagementRate >= 70 ? '+' : '-'}{Math.abs(progressValues.engagementRate - 70)}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Average score: {dashboardData?.quickStats.averageScore || 0}%</p>
              <div className="mt-3">
                <Progress value={progressValues.engagementRate} className="h-1.5" />
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
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
              onClick={() => router.push("/admin/users")}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
              onClick={() => router.push("/admin/video-settings")}
            >
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger
              value="learning"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint/20 data-[state=active]:to-purist-blue/20"
              onClick={() => router.push("/admin/challenges")}
            >
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Learning</span>
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
                  {/* Activity and Recent Users */}
                  <div className="grid gap-6 md:grid-cols-7">
                    <Card className="md:col-span-4 border-none shadow-neo">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                          <CardTitle className="text-lg font-semibold">User Activity</CardTitle>
                          <CardDescription>Platform engagement over the last 30 days</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-purist-blue/10">
                          <TrendingUp className="h-3 w-3 mr-1 text-purist-blue" />
                          Growing
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
                          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => handleViewAll("activity")}
                          >
                            View all
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription>Latest user actions on the platform</CardDescription>
                      </CardHeader>
                      <CardContent>                        <div className="space-y-4">
                          {(dashboardData?.recentActivities || []).slice(0, 4).map((activity, i) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                              onClick={() => {
                                toast({
                                  title: "Activity details",
                                  description: `Viewing details for ${activity.user}'s activity`,
                                })
                              }}
                            >
                              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                <AvatarImage src={activity.avatar} alt={activity.user} />
                                <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                                  {activity.user.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{activity.user}</p>
                                <p className="text-xs text-muted-foreground">{activity.action} {activity.target}</p>
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Popular Content and Quick Actions */}
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-none shadow-neo">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold">Popular Resources</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => handleViewAll("resources")}
                          >
                            View all
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription>Most accessed learning materials</CardDescription>
                      </CardHeader>
                      <CardContent>                        <div className="space-y-4">
                          {(dashboardData?.popularResources || []).map((resource, i) => (
                            <motion.div
                              key={resource.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                              onClick={() => {
                                toast({
                                  title: "Resource details",
                                  description: `Viewing details for ${resource.title}`,
                                })
                              }}
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 flex items-center justify-center">
                                {resource.type === 'video' ? '🎥' : resource.type === 'audio' ? '🎵' : resource.type === 'document' ? '📄' : '📚'}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{resource.title}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-muted-foreground">{resource.views} views</p>
                                  <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                                  <p className="text-xs text-muted-foreground">{resource.type}</p>
                                  <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                                  <p className="text-xs text-muted-foreground">{resource.completion}% completion</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-neo">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold">New Users</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => handleViewAll("users")}
                          >
                            View all
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription>Recently registered learners</CardDescription>
                      </CardHeader>
                      <CardContent>                        <div className="space-y-4">
                          {(dashboardData?.newUsers || []).map((user, i) => (
                            <motion.div
                              key={user.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                              onClick={() => {
                                toast({
                                  title: "User details",
                                  description: `Viewing profile for ${user.name}`,
                                })
                              }}
                            >
                              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-gradient-to-br from-purist-blue to-cassis text-white">
                                  {user.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                    {user.level}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">{user.joinedAgo}</p>
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
                        <CardDescription>Common administrative tasks</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {quickActions.map((action, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-neo hover:shadow-glow-sm transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center"
                              onClick={() => handleQuickAction(action.id)}
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

                  {/* Upcoming Events */}
                  <Card className="border-none shadow-neo">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => handleViewAll("calendar")}
                        >
                          View calendar
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>Scheduled activities and deadlines</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        {upcomingEvents.map((event, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                            onClick={() => {
                              toast({
                                title: "Event details",
                                description: `Viewing details for ${event.title}`,
                              })
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-medium">{event.date.month}</span>
                                <span className="text-lg font-bold leading-none">{event.date.day}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium">{event.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                                <div className="flex items-center gap-1 mt-2">
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0 h-4 bg-gradient-to-r from-neo-mint/10 to-purist-blue/10"
                                  >
                                    {event.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="users" className="space-y-6 mt-0">
                  <Card className="border-none shadow-neo">
                    <CardHeader>
                      <CardTitle>User Analytics</CardTitle>
                      <CardDescription>Detailed user statistics and demographics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-md flex items-center justify-center">
                        <Users className="h-12 w-12 text-muted-foreground opacity-50" />
                        <span className="ml-2 text-muted-foreground">User Analytics Dashboard</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            )}

            {activeTab === "content" && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="content" className="space-y-6 mt-0">
                  <Card className="border-none shadow-neo">
                    <CardHeader>
                      <CardTitle>Content Management</CardTitle>
                      <CardDescription>Manage your learning materials and resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-md flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground opacity-50" />
                        <span className="ml-2 text-muted-foreground">Content Management Dashboard</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            )}

            {activeTab === "learning" && (
              <motion.div
                key="learning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="learning" className="space-y-6 mt-0">
                  <Card className="border-none shadow-neo">
                    <CardHeader>
                      <CardTitle>Learning Progress</CardTitle>
                      <CardDescription>Track student progress and achievements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-md flex items-center justify-center">
                        <Award className="h-12 w-12 text-muted-foreground opacity-50" />
                        <span className="ml-2 text-muted-foreground">Learning Progress Dashboard</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Add Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>Create a new event on the platform calendar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                placeholder="Enter event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-date">Event Date</Label>
              <Input id="event-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Resource Dialog */}
      <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Learning Resource</DialogTitle>
            <DialogDescription>Create a new learning resource for students</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resource-title">Resource Title</Label>
              <Input
                id="resource-title"
                placeholder="Enter resource title"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource-type">Resource Type</Label>
              <Select value={resourceType} onValueChange={setResourceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource-description">Description</Label>
              <Textarea
                id="resource-description"
                placeholder="Enter resource description"
                value={resourceDescription}
                onChange={(e) => setResourceDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResourceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddResource} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                placeholder="Enter user's full name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email Address</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="Enter user's email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">User Role</Label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Challenge Dialog */}
      <Dialog open={showChallengeDialog} onOpenChange={setShowChallengeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
            <DialogDescription>Create a new learning challenge for students</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="challenge-title">Challenge Title</Label>
              <Input
                id="challenge-title"
                placeholder="Enter challenge title"
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenge-type">Challenge Type</Label>
              <Select value={challengeType} onValueChange={setChallengeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select challenge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="speaking">Speaking</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="grammar">Grammar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChallengeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddChallenge} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Challenge
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>Send a notification to platform users</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notification-title">Notification Title</Label>
              <Input
                id="notification-title"
                placeholder="Enter notification title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-message">Message</Label>
              <Textarea
                id="notification-message"
                placeholder="Enter notification message"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-type">Recipients</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="teachers">Teachers Only</SelectItem>
                  <SelectItem value="admins">Admins Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Real-time data state
interface DashboardData {
  recentActivities: Activity[]
  popularResources: Resource[]
  newUsers: NewUser[]
  upcomingEvents: Event[]
}

interface Activity {
  id: string
  user: string
  avatar: string
  action: string
  time: string
  type: "challenge" | "resource" | "user" | "system"
}

interface Resource {
  id: string
  title: string
  views: number
  type: string
  icon: React.ReactNode
}

interface NewUser {
  id: string
  name: string
  level: string
  joinedAgo: string
  avatar: string
}

interface Event {
  id: string
  title: string
  date: { month: string; day: string }
  time: string
  type: string
}
