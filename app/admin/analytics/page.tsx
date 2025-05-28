"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Share2,
  Printer,
  FileText,
  Users,
  Clock,
  Award,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Video,
  Zap,
  AlertTriangle,
  Info,
  X,
  MoreHorizontal,
  Layers,
  Eye,
} from "lucide-react"
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { supabase, dbHelpers } from "@/lib/supabase"

interface AnalyticsData {
  userGrowthData: Array<{ month: string; users: number; previousUsers: number }>
  challengeCompletionData: Array<{ challenge: string; completed: number; target: number; color: string }>
  userLevelDistribution: Array<{ level: string; count: number; percentage: number; color: string }>
  engagementByTimeData: Array<{ hour: string; users: number; previousUsers: number }>
  skillImprovementData: Array<{ skill: string; improvement: number; previousImprovement: number; trend: string }>
  topPerformingVideos: Array<{
    id: string
    title: string
    views: number
    completionRate: number
    avgWatchTime: number
    trend: string
    trendPercentage: number
  }>
  quickStats: {
    totalUsers: number
    activeUsers: number
    totalChallenges: number
    completedSubmissions: number
    averageScore: number
    newUsersThisMonth: number
  }
}

const timeRangeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
]

const chartTypeOptions = [
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "pie", label: "Pie Chart", icon: PieChart },
]

const retentionCohortData = [
  { cohort: "Week 1", day1: 100, day7: 82, day14: 68, day30: 54, day60: 42, day90: 35 },
  { cohort: "Week 2", day1: 100, day7: 85, day14: 72, day30: 58, day60: 45, day90: 38 },
  { cohort: "Week 3", day1: 100, day7: 80, day14: 65, day30: 52, day60: 40, day90: 32 },
  { cohort: "Week 4", day1: 100, day7: 88, day14: 75, day30: 62, day60: 48, day90: 40 },
  { cohort: "Week 5", day1: 100, day7: 84, day14: 70, day30: 56, day60: 44, day90: 36 },
]

const learningPathData = [
  { path: "Conversational English", users: 1245, completionRate: 68, satisfaction: 4.2 },
  { path: "Business English", users: 876, completionRate: 72, satisfaction: 4.5 },
  { path: "Academic English", users: 654, completionRate: 65, satisfaction: 4.0 },
  { path: "Travel English", users: 1532, completionRate: 82, satisfaction: 4.7 },
  { path: "English for Interviews", users: 945, completionRate: 75, satisfaction: 4.3 },
]

// Helper function to format numbers
const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}

// Helper function to format time
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Helper function to get trend color
const getTrendColor = (trend: string) => {
  return trend === "up" ? "text-green-500" : "text-red-500"
}

// Helper function to get trend icon
const getTrendIcon = (trend: string) => {
  return trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
}

// Helper function to format date ranges
const formatDateRange = (range: string) => {
  const today = new Date()

  switch (range) {
    case "today":
      return format(today, "MMMM d, yyyy")
    case "yesterday":
      return format(subDays(today, 1), "MMMM d, yyyy")
    case "last7days":
      return `${format(subDays(today, 6), "MMM d")} - ${format(today, "MMM d, yyyy")}`
    case "last30days":
      return `${format(subDays(today, 29), "MMM d")} - ${format(today, "MMM d, yyyy")}`
    case "thisMonth":
      return format(today, "MMMM yyyy")
    case "lastMonth":
      return format(subMonths(today, 1), "MMMM yyyy")
    case "thisYear":
      return format(today, "yyyy")
    default:
      return "Custom Range"
  }
}

// Add data loading functions
const loadAnalyticsData = async (timeRange: string): Promise<AnalyticsData> => {
  try {
    const { users, messages, challenges, submissions } = await dbHelpers.getAnalyticsData()
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      case '1y':
        startDate = subDays(now, 365)
        break
      default:
        startDate = subDays(now, 30)
    }

    // Process user growth data
    const userGrowthData = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = endOfMonth(subMonths(now, i))
      const monthUsers = users.filter(u => {
        const createdAt = new Date(u.joined_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }).length

      const prevMonthStart = startOfMonth(subMonths(now, i + 1))
      const prevMonthEnd = endOfMonth(subMonths(now, i + 1))
      const prevMonthUsers = users.filter(u => {
        const createdAt = new Date(u.joined_at)
        return createdAt >= prevMonthStart && createdAt <= prevMonthEnd
      }).length

      userGrowthData.push({
        month: format(monthStart, 'MMM'),
        users: monthUsers,
        previousUsers: prevMonthUsers
      })
    }

    // Calculate challenge completion data
    const challengeStats = challenges.reduce((acc: any, challenge: any) => {
      const challengeSubmissions = submissions.filter(s => 
        s.challenge_id === challenge.id && s.status === 'COMPLETED'
      )
      const completionRate = challengeSubmissions.length > 0 
        ? (challengeSubmissions.filter(s => s.score && s.score >= 70).length / challengeSubmissions.length) * 100
        : 0

      const categoryKey = challenge.category || 'Other'
      if (!acc[categoryKey]) {
        acc[categoryKey] = { total: 0, completed: 0 }
      }
      acc[categoryKey].total += challengeSubmissions.length
      acc[categoryKey].completed += challengeSubmissions.filter(s => s.score && s.score >= 70).length
      return acc
    }, {})

    const challengeCompletionData = Object.entries(challengeStats).map(([category, stats]: [string, any], index) => ({
      challenge: category,
      completed: Math.round((stats.completed / Math.max(stats.total, 1)) * 100),
      target: 80,
      color: [
        'bg-green-500', 'bg-blue-500', 'bg-purple-500', 
        'bg-orange-500', 'bg-pink-500', 'bg-yellow-500'
      ][index % 6]
    }))

    // Calculate user level distribution
    const levelDistribution = users.reduce((acc: any, user: any) => {
      const level = user.level || 1
      let category = 'Beginner'
      if (level > 5) category = 'Advanced'
      else if (level > 2) category = 'Intermediate'
      
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    const totalUsers = users.length
    const userLevelDistribution = Object.entries(levelDistribution).map(([level, count]: [string, any], index) => ({
      level,
      count,
      percentage: Math.round((count / totalUsers) * 100),
      color: ['bg-green-500', 'bg-blue-500', 'bg-purple-500'][index]
    }))

    // Calculate hourly engagement
    const engagementByTimeData = []
    for (let hour = 0; hour < 24; hour += 2) {
      const currentHourMessages = messages.filter(m => {
        const messageHour = new Date(m.created_at).getHours()
        return messageHour === hour
      }).length

      engagementByTimeData.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        users: currentHourMessages,
        previousUsers: Math.floor(currentHourMessages * 0.8) // Simulated previous data
      })
    }

    // Calculate skill improvement data
    const skillImprovementData = [
      'SPEAKING', 'LISTENING', 'READING', 'WRITING', 'GRAMMAR', 'VOCABULARY'
    ].map((skill, index) => {
      const skillSubmissions = submissions.filter(s => 
        challenges.find(c => c.id === s.challenge_id)?.category === skill
      )
      const avgScore = skillSubmissions.length > 0
        ? skillSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / skillSubmissions.length
        : 0

      return {
        skill: skill.charAt(0) + skill.slice(1).toLowerCase(),
        improvement: Math.round(avgScore),
        previousImprovement: Math.round(avgScore * 0.9), // Simulated previous data
        trend: avgScore > 50 ? 'up' : 'down'
      }
    })

    // Get top performing content (using resources as proxy for videos)
    const { data: resources } = await supabase
      .from('resources')
      .select('*')
      .eq('type', 'VIDEO')
      .order('views', { ascending: false })
      .limit(5)

    const topPerformingVideos = resources?.map((resource: any, index) => ({
      id: resource.id,
      title: resource.title,
      views: resource.views || 0,
      completionRate: 65 + Math.random() * 30, // Simulated
      avgWatchTime: 180 + Math.random() * 120, // Simulated
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trendPercentage: Math.floor(Math.random() * 15) + 1
    })) || []

    // Calculate quick stats
    const activeUsers = users.filter(u => {
      const lastActive = new Date(u.last_active)
      return (now.getTime() - lastActive.getTime()) < (7 * 24 * 60 * 60 * 1000) // Active in last 7 days
    }).length

    const completedSubmissions = submissions.filter(s => s.status === 'COMPLETED').length
    const averageScore = submissions.length > 0
      ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length
      : 0

    const thisMonthStart = startOfMonth(now)
    const newUsersThisMonth = users.filter(u => 
      new Date(u.joined_at) >= thisMonthStart
    ).length

    return {
      userGrowthData,
      challengeCompletionData,
      userLevelDistribution,
      engagementByTimeData,
      skillImprovementData,
      topPerformingVideos,
      quickStats: {
        totalUsers: users.length,
        activeUsers,
        totalChallenges: challenges.length,
        completedSubmissions,
        averageScore: Math.round(averageScore),
        newUsersThisMonth
      }
    }
  } catch (error) {
    console.error('Error loading analytics data:', error)
    // Return empty data structure on error
    return {
      userGrowthData: [],
      challengeCompletionData: [],
      userLevelDistribution: [],
      engagementByTimeData: [],
      skillImprovementData: [],
      topPerformingVideos: [],
      quickStats: {
        totalUsers: 0,
        activeUsers: 0,
        totalChallenges: 0,
        completedSubmissions: 0,
        averageScore: 0,
        newUsersThisMonth: 0
      }
    }
  }
}

// Chart components
const LineChartComponent = ({ data, isLoading = false }: { data: any[]; isLoading?: boolean }) => {
  const chartHeight = 200
  const chartWidth = 600
  const maxValue = Math.max(...data.map((item) => item.users)) * 1.1

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />
  }

  return (
    <div className="relative h-[200px] w-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((line, i) => (
          <line
            key={i}
            x1="0"
            y1={chartHeight - (chartHeight * line) / 4}
            x2={chartWidth}
            y2={chartHeight - (chartHeight * line) / 4}
            stroke="#e5e7eb"
            strokeDasharray="5,5"
          />
        ))}

        {/* Previous period line */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
          d={`M ${data.map((item, i) => `${(i * chartWidth) / (data.length - 1)},${chartHeight - (item.previousUsers / maxValue) * chartHeight}`).join(" L ")}`}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Current period line */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d={`M ${data.map((item, i) => `${(i * chartWidth) / (data.length - 1)},${chartHeight - (item.users / maxValue) * chartHeight}`).join(" L ")}`}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
        />

        {/* Data points */}
        {data.map((item, i) => (
          <motion.circle
            key={i}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 5, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2 + i * 0.1 }}
            cx={(i * chartWidth) / (data.length - 1)}
            cy={chartHeight - (item.users / maxValue) * chartHeight}
            fill="white"
            stroke="#3b82f6"
            strokeWidth="2"
            className="cursor-pointer hover:r-6"
          />
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {data
          .filter((_, i) => i % 2 === 0 || i === data.length - 1)
          .map((item, i) => (
            <div key={i}>{item.month || item.hour}</div>
          ))}
      </div>
    </div>
  )
}

const BarChartComponent = ({ data, isLoading = false }: { data: any[]; isLoading?: boolean }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />
  }

  return (
    <div className="space-y-6 w-full">
      {data.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="space-y-2"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.challenge || item.skill}</span>
              {item.trend && (
                <span className={cn("flex items-center text-xs", getTrendColor(item.trend))}>
                  {getTrendIcon(item.trend)}
                  <span className="ml-1">{item.improvement - item.previousImprovement}%</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.completed || item.improvement}%</span>
              {item.target && <span className="text-xs text-muted-foreground">Target: {item.target}%</span>}
            </div>
          </div>
          <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.completed || item.improvement}%` }}
              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
              className={cn("h-full rounded-full", item.color || "bg-primary")}
            />
            {item.target && (
              <div
                className="absolute top-0 h-full border-l-2 border-dashed border-yellow-500"
                style={{ left: `${item.target}%` }}
              />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

const PieChartComponent = ({ data, isLoading = false }: { data: any[]; isLoading?: boolean }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)
  let cumulativePercentage = 0

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      <div className="relative w-40 h-40">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {data.map((item, i) => {
            const startAngle = cumulativePercentage * 3.6 // 3.6 degrees per percentage point
            const endAngle = (cumulativePercentage + item.percentage) * 3.6
            cumulativePercentage += item.percentage

            const startAngleRad = (startAngle - 90) * (Math.PI / 180)
            const endAngleRad = (endAngle - 90) * (Math.PI / 180)

            const largeArcFlag = item.percentage > 50 ? 1 : 0

            const x1 = 50 + 40 * Math.cos(startAngleRad)
            const y1 = 50 + 40 * Math.sin(startAngleRad)
            const x2 = 50 + 40 * Math.cos(endAngleRad)
            const y2 = 50 + 40 * Math.sin(endAngleRad)

            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ')

            return (
              <motion.path
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                d={pathData}
                fill={`hsl(${210 + i * 60}, 70%, ${60 - i * 10}%)`}
                className="hover:opacity-80 cursor-pointer"
              />
            )
          })}
        </svg>
      </div>
      <div className="space-y-3">
        {data.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: `hsl(${210 + i * 60}, 70%, ${60 - i * 10}%)` }}
            />
            <div>
              <div className="text-sm font-medium">{item.level}</div>
              <div className="text-xs text-muted-foreground">
                {item.count} users ({item.percentage}%)
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)
  const [showInsights, setShowInsights] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  // Refs for scroll animations
  const chartsRef = useRef<HTMLDivElement>(null)

  // Load analytics data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const data = await loadAnalyticsData(timeRange)
      setAnalyticsData(data)
      setIsLoading(false)
    }

    loadData()
  }, [timeRange])

  // Function to handle data refresh
  const refreshData = async () => {
    setIsRefreshing(true)
    const data = await loadAnalyticsData(timeRange)
    setAnalyticsData(data)
    setIsRefreshing(false)

    toast({
      title: "Data refreshed",
      description: "Analytics data has been updated with the latest information.",
    })
  }

  // Function to handle data export
  const exportData = () => {
    toast({
      title: "Export started",
      description: "Analytics data is being exported. You'll be notified when it's ready.",
    })
  }

  // Function to toggle video details
  const toggleVideoDetails = (id: string) => {
    setExpandedVideo(expandedVideo === id ? null : id)
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your platform performance and user engagement
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
                  {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={exportData}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
      >
        {[
          {
            title: "Total Users",
            value: analyticsData?.quickStats.totalUsers || 0,
            change: "+12%",
            trend: "up",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Active Users",
            value: analyticsData?.quickStats.activeUsers || 0,
            change: "+8%",
            trend: "up",
            icon: Zap,
            color: "text-green-600",
            bgColor: "bg-green-50",
          },
          {
            title: "Total Challenges",
            value: analyticsData?.quickStats.totalChallenges || 0,
            change: "+5%",
            trend: "up",
            icon: Award,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
          },
          {
            title: "Completed",
            value: analyticsData?.quickStats.completedSubmissions || 0,
            change: "+15%",
            trend: "up",
            icon: CheckCircle,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
          },
          {
            title: "Avg Score",
            value: `${analyticsData?.quickStats.averageScore || 0}%`,
            change: "+3%",
            trend: "up",
            icon: TrendingUp,
            color: "text-pink-600",
            bgColor: "bg-pink-50",
          },
          {
            title: "New This Month",
            value: analyticsData?.quickStats.newUsersThisMonth || 0,
            change: "+22%",
            trend: "up",
            icon: Users,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
          },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                      )}
                      {!isLoading && (
                        <span className={cn("flex items-center text-xs font-medium", getTrendColor(stat.trend))}>
                          {getTrendIcon(stat.trend)}
                          {stat.change}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-full", stat.bgColor)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  User Growth
                </CardTitle>
                <CardDescription>Monthly user registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent data={analyticsData?.userGrowthData || []} isLoading={isLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Challenge Completion
                </CardTitle>
                <CardDescription>Completion rates by category</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent data={analyticsData?.challengeCompletionData || []} isLoading={isLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  User Levels
                </CardTitle>
                <CardDescription>Distribution of user skill levels</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={analyticsData?.userLevelDistribution || []} isLoading={isLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Hourly Engagement
                </CardTitle>
                <CardDescription>User activity throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent data={analyticsData?.engagementByTimeData || []} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user behavior and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  User analytics coming soon...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Skill Improvement
              </CardTitle>
              <CardDescription>Average improvement rates by skill area</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent data={analyticsData?.skillImprovementData || []} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Top Performing Content
              </CardTitle>
              <CardDescription>Most engaging video content</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData?.topPerformingVideos.map((video, i) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => toggleVideoDetails(video.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{video.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {video.views} views
                            </span>
                            <span>{video.completionRate}% completion</span>
                            <span>{Math.floor(video.avgWatchTime / 60)}:{(video.avgWatchTime % 60).toString().padStart(2, '0')} avg watch time</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("flex items-center text-sm", getTrendColor(video.trend))}>
                          {getTrendIcon(video.trend)}
                          {video.trendPercentage}%
                        </span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", expandedVideo === video.id && "rotate-180")} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
