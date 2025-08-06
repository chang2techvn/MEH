"use client"

import { useState, useEffect } from "react"
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
import { 
  getDashboardStats, 
  getRecentActivities, 
  getNewUsers, 
  getPopularResources,
  type DashboardStats,
  type RecentActivity,
  type NewUser,
  type PopularResource
} from "@/app/actions/admin-dashboard"

// Helper function to format duration in seconds to MM:SS format
const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  
  // Real data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalChallenges: 0,
    totalSubmissions: 0,
    dailyActiveUsers: 0,
    weeklyCompletionRate: 0,
    monthlyGrowthRate: 0,
    engagementRate: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [newUsers, setNewUsers] = useState<NewUser[]>([])
  const [popularResources, setPopularResources] = useState<PopularResource[]>([])
  
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

  // Load real data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [stats, activities, users, resources] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(),
        getNewUsers(),
        getPopularResources()
      ])

      setDashboardStats(stats)
      setRecentActivities(activities)
      setNewUsers(users)
      setPopularResources(resources)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    await loadDashboardData()
    toast({
      title: "Dashboard refreshed",
      description: "Latest data has been loaded successfully",
    })
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
        router.push("/admin")
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
        router.push("/admin")
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

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neo-mint/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-purist-blue" />
              Total Users
            </CardTitle>
          </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{dashboardStats.totalUsers}</div>
                <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="font-medium">+{dashboardStats.monthlyGrowthRate}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Compared to previous month</p>
              <div className="mt-3">
                <Progress value={Math.min(dashboardStats.monthlyGrowthRate, 100)} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

        <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purist-blue/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2 text-neo-mint" />
              Active Learners
            </CardTitle>
          </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{dashboardStats.dailyActiveUsers}</div>
                <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="font-medium">+{Math.round((dashboardStats.dailyActiveUsers / dashboardStats.totalUsers) * 100)}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Daily active users</p>
              <div className="mt-3">
                <Progress value={Math.min((dashboardStats.dailyActiveUsers / dashboardStats.totalUsers) * 100, 100)} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

        <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cantaloupe/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-cassis" />
              Challenge Completion
            </CardTitle>
          </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{dashboardStats.weeklyCompletionRate}%</div>
                <div className="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span className="font-medium">+{dashboardStats.weeklyCompletionRate > 50 ? Math.round(dashboardStats.weeklyCompletionRate - 50) : 0}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Weekly completion rate</p>
              <div className="mt-3">
                <Progress value={dashboardStats.weeklyCompletionRate} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

        <Card className="overflow-hidden border-none shadow-neo neo-card hover:shadow-glow-sm transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-mellow-yellow/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purist-blue" />
              Engagement Rate
            </CardTitle>
          </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{dashboardStats.engagementRate}%</div>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                  dashboardStats.engagementRate > 50 
                    ? 'text-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'text-red-500 bg-red-50 dark:bg-red-900/20'
                }`}>
                  {dashboardStats.engagementRate > 50 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  <span className="font-medium">{dashboardStats.engagementRate > 50 ? '+' : '-'}{Math.abs(dashboardStats.engagementRate - 50)}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Weekly engagement rate</p>
              <div className="mt-3">
                <Progress value={dashboardStats.engagementRate} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Main Content Tabs */}
      <div>
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

          {activeTab === "overview" && (
            <div>
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
                          {/* Simulated chart with static bars */}
                          <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                            {[40, 65, 35, 85, 55, 45, 70, 60, 75, 50, 90, 65].map((height, i) => (
                              <div
                                key={i}
                                className="w-4 bg-gradient-to-t from-purist-blue to-neo-mint rounded-t-md"
                                style={{ height: `${height}%` }}
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
                      <CardContent>
                        <div className="space-y-4">
                          {recentActivities.slice(0, 4).map((activity, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                              onClick={() => {
                                toast({
                                  title: "Activity details",
                                  description: `Viewing details for ${activity.userName}'s activity`,
                                })
                              }}
                            >
                              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                <AvatarImage src={activity.userAvatar || "/placeholder.svg"} alt={activity.userName} />
                                <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                                  {activity.userName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{activity.userName}</p>
                                <p className="text-xs text-muted-foreground">{activity.action}</p>
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Popular Content and Quick Actions */}
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-none shadow-neo h-full flex flex-col">
                      <CardHeader className="pb-2 flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold">Popular Challenges</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => router.push("/admin/challenges")}
                          >
                            View all
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription>Most attempted learning challenges</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 flex-1">
                        <div className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                          <div className="space-y-2 p-4">
                            {popularResources.map((resource, i) => (
                              <div
                                key={i}
                                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer border border-border/40 hover:border-border"
                                onClick={() => {
                                  toast({
                                    title: "Challenge details",
                                    description: `Viewing details for ${resource.title}`,
                                  })
                                }}
                              >
                                {/* Compact thumbnail */}
                                <div className="relative w-16 h-10 rounded bg-muted flex-shrink-0 overflow-hidden">
                                  {resource.thumbnailUrl ? (
                                    <img
                                      src={resource.thumbnailUrl}
                                      alt={resource.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 flex items-center justify-center">
                                      {/* Type icons as fallback */}
                                      {resource.type === 'Reading Exercise' && <BookOpen className="h-3 w-3 text-purist-blue" />}
                                      {resource.type === 'Writing Practice' && <Zap className="h-3 w-3 text-neo-mint" />}
                                      {resource.type === 'Speaking Challenge' && <MessageSquare className="h-3 w-3 text-cassis" />}
                                      {resource.type === 'Listening Test' && <Activity className="h-3 w-3 text-mellow-yellow" />}
                                      {resource.type === 'Practice Challenge' && <Award className="h-3 w-3 text-purist-blue" />}
                                      {resource.type === 'Grammar Practice' && <BookOpen className="h-3 w-3 text-cassis" />}
                                      {resource.type === 'Interactive' && <Video className="h-3 w-3 text-neo-mint" />}
                                    </div>
                                  )}
                                  
                                  {/* Duration badge */}
                                  <div className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] px-1 py-0.5 rounded-tl font-medium leading-none">
                                    {formatDuration(resource.duration)}
                                  </div>
                                  
                                  {/* Gradient overlay for better text visibility */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                </div>
                                
                                {/* Compact content */}
                                <div className="flex-1 min-w-0 space-y-0.5">
                                  <h4 className="text-xs font-medium leading-tight text-foreground line-clamp-1">
                                    {resource.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3 bg-gradient-to-r from-neo-mint/10 to-purist-blue/10 font-medium">
                                      {resource.difficulty || 'Intermediate'}
                                    </Badge>
                                    <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground"></div>
                                    <span className="text-[10px]">{resource.type}</span>
                                  </div>
                                </div>
                                
                                {/* Compact stats */}
                                <div className="flex flex-col items-end gap-0.5 text-[9px] text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-2.5 w-2.5" />
                                    <span>{resource.views}</span>
                                  </div>
                                  <span>Aug 6, 2025</span>
                                </div>
                                
                                {/* Action button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Navigate to challenge details
                                    router.push(`/admin/challenges/${resource.id}`)
                                  }}
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-neo h-full flex flex-col">
                      <CardHeader className="pb-2 flex-shrink-0">
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
                      <CardContent className="flex-1">
                        <div className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                          <div className="space-y-4">
                            {newUsers.map((user, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                              onClick={() => {
                                toast({
                                  title: "User details",
                                  description: `Viewing profile for ${user.name}`,
                                })
                              }}
                            >
                              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback className="bg-gradient-to-br from-purist-blue to-cassis text-white">
                                  {user.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                    {user.level}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">{user.joinedAgo}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-neo h-full flex flex-col">
                      <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                          <div className="grid grid-cols-2 gap-3 p-1">
                            {quickActions.map((action, i) => (
                            <button
                              key={i}
                              className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-neo hover:shadow-glow-sm transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center"
                              onClick={() => handleQuickAction(action.id)}
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 flex items-center justify-center">
                                {action.icon}
                              </div>
                              <span className="text-xs font-medium">{action.label}</span>
                            </button>
                          ))}
                          </div>
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
                          <div
                            key={i}
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
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            )}

            {activeTab === "users" && (
              <div>
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
              </div>
            )}

            {activeTab === "content" && (
              <div>
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
              </div>
            )}

            {activeTab === "learning" && (
              <div>
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
              </div>
            )}
        </Tabs>
      </div>

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

// Sample data for quick actions
const quickActions = [
  {
    id: "addResource",
    label: "Add Resource",
    icon: <BookOpen className="h-5 w-5 text-purist-blue" />,
  },
  {
    id: "manageUsers",
    label: "Manage Users",
    icon: <Users className="h-5 w-5 text-neo-mint" />,
  },
  {
    id: "viewReports",
    label: "View Reports",
    icon: <BarChart3 className="h-5 w-5 text-cassis" />,
  },
  {
    id: "sendNotification",
    label: "Send Notification",
    icon: <Bell className="h-5 w-5 text-mellow-yellow" />,
  },
  {
    id: "createChallenge",
    label: "Create Challenge",
    icon: <Zap className="h-5 w-5 text-purist-blue" />,
  },
  {
    id: "siteSettings",
    label: "Site Settings",
    icon: <Globe className="h-5 w-5 text-neo-mint" />,
  },
]

// Sample data for upcoming events (keeping this as it's calendar-related, not user data)
const upcomingEvents = [
  {
    title: "Weekly Team Meeting",
    date: { month: "May", day: "15" },
    time: "10:00 AM - 11:30 AM",
    type: "Meeting",
  },
  {
    title: "New Course Launch",
    date: { month: "May", day: "18" },
    time: "All day event",
    type: "Launch",
  },
  {
    title: "Content Review Session",
    date: { month: "May", day: "20" },
    time: "2:00 PM - 4:00 PM",
    type: "Review",
  },
]
