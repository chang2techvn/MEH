"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Helmet } from "react-helmet"
import {
  BarChart3,
  LineChart,
  PieChart,
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
  Video,
  Zap,
  AlertTriangle,
  Info,
  X,
  MoreHorizontal,
  Eye,
  Clock,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  ArrowUpDown,
  BookOpen,
  FileVideo,
  FileAudio,
  FileQuestion,
  Layers,
  BarChart,
  ArrowRight,
} from "lucide-react"
import { format, subDays, subMonths, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"


// Interface for content analytics data
interface ContentAnalyticsData {
  contentPerformanceData: Array<{ month: string; views: number; engagement: number; completion: number }>
  contentTypeDistribution: Array<{ type: string; count: number; percentage: number; color: string }>
  topPerformingContent: Array<{
    id: string
    title: string
    type: string
    views: number
    completionRate: number
    avgEngagementTime: number
    likes: number
    comments: number
    trend: string
    trendPercentage: number
    publishDate: string
    thumbnail: string
  }>
  contentEngagementByDevice: Array<{ device: string; percentage: number; color: string }>
  contentEngagementByTime: Array<{ hour: string; users: number }>
  contentFeedback: Array<{ sentiment: string; percentage: number; color: string }>
  contentTypePerformance: Array<{ type: string; engagement: number; completion: number; satisfaction: number; color: string }>
}

// Function to load real content analytics data from Supabase
const loadContentAnalyticsData = async (timeRange: string): Promise<ContentAnalyticsData> => {
  try {
    // Get resources (content) data
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (resourcesError) throw resourcesError

    // Get challenge submissions for engagement metrics
    const { data: submissions, error: submissionsError } = await supabase
      .from('challenge_submissions')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (submissionsError) throw submissionsError

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case 'today':
        startDate = subDays(now, 0)
        break
      case 'yesterday':
        startDate = subDays(now, 1)
        break
      case 'last7days':
        startDate = subDays(now, 7)
        break
      case 'last30days':
        startDate = subDays(now, 30)
        break
      case 'thisMonth':
        startDate = startOfMonth(now)
        break
      case 'lastMonth':
        startDate = startOfMonth(subMonths(now, 1))
        break
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = subDays(now, 30)
    }

    // Process performance data by month
    const contentPerformanceData = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = endOfMonth(subMonths(now, i))
      
      const monthResources = resources?.filter(r => {
        const createdAt = new Date(r.created_at)
        return createdAt >= monthStart && createdAt <= monthEnd
      }) || []

      const totalViews = monthResources.reduce((sum, r) => sum + (r.views || 0), 0)
      const totalDownloads = monthResources.reduce((sum, r) => sum + (r.downloads || 0), 0)
      
      contentPerformanceData.push({
        month: format(monthStart, 'MMM'),
        views: totalViews,
        engagement: Math.floor(totalViews * 0.7), // Estimated engagement
        completion: Math.floor(totalViews * 0.6) // Estimated completion
      })
    }

    // Calculate content type distribution
    const typeMapping: Record<string, string> = {
      'VIDEO': 'Video Lessons',
      'AUDIO': 'Audio Dialogues', 
      'QUIZ': 'Quizzes',
      'INTERACTIVE': 'Interactive Exercises',
      'PDF': 'Documents',
      'DOCUMENT': 'Documents',
      'PRESENTATION': 'Presentations',
      'EXERCISE': 'Interactive Exercises'
    }

    const typeDistribution = resources?.reduce((acc: Record<string, number>, resource: any) => {
      const mappedType = typeMapping[resource.type] || 'Other'
      acc[mappedType] = (acc[mappedType] || 0) + 1
      return acc
    }, {}) || {}

    const totalResources = resources?.length || 1
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500', 'bg-orange-500']
    
    const contentTypeDistribution = Object.entries(typeDistribution).map(([type, count], index) => ({
      type,
      count: count as number,
      percentage: Math.round(((count as number) / totalResources) * 100),
      color: colors[index % colors.length]
    }))

    // Get top performing content
    const topPerformingContent = resources?.slice(0, 8).map((resource: any, index) => ({
      id: resource.id,
      title: resource.title || 'Untitled',
      type: resource.type?.toLowerCase() || 'unknown',
      views: resource.views || 0,
      completionRate: 65 + Math.random() * 30, // Estimated for now
      avgEngagementTime: 180 + Math.random() * 300, // Estimated for now
      likes: Math.floor((resource.views || 0) * 0.1), // Estimated
      comments: Math.floor((resource.views || 0) * 0.02), // Estimated
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trendPercentage: Math.floor(Math.random() * 20) + 1,
      publishDate: resource.created_at || new Date().toISOString(),
      thumbnail: resource.thumbnail_url || "/placeholder.svg?height=120&width=200"
    })) || []

    // Mock engagement data (to be replaced with real analytics when available)
    const contentEngagementByDevice = [
      { device: "Desktop", percentage: 45, color: "bg-blue-500" },
      { device: "Mobile", percentage: 38, color: "bg-green-500" },
      { device: "Tablet", percentage: 12, color: "bg-purple-500" },
      { device: "Other", percentage: 5, color: "bg-amber-500" }
    ]

    const contentEngagementByTime = Array.from({ length: 12 }, (_, i) => ({
      hour: `${(i * 2).toString().padStart(2, '0')}:00`,
      users: 40 + Math.floor(Math.random() * 420)
    }))

    const contentFeedback = [
      { sentiment: "Positive", percentage: 68, color: "bg-green-500" },
      { sentiment: "Neutral", percentage: 24, color: "bg-blue-500" },
      { sentiment: "Negative", percentage: 8, color: "bg-red-500" }
    ]

    const contentTypePerformance = contentTypeDistribution.map((item, index) => ({
      type: item.type,
      engagement: 65 + Math.random() * 30,
      completion: 60 + Math.random() * 35,
      satisfaction: 3.5 + Math.random() * 1.5,
      color: item.color
    }))

    return {
      contentPerformanceData,
      contentTypeDistribution,
      topPerformingContent,
      contentEngagementByDevice,
      contentEngagementByTime,
      contentFeedback,
      contentTypePerformance
    }
  } catch (error) {
    console.error('Error loading content analytics data:', error)
    // Return empty data structure on error
    return {
      contentPerformanceData: [],
      contentTypeDistribution: [],
      topPerformingContent: [],
      contentEngagementByDevice: [],
      contentEngagementByTime: [],
      contentFeedback: [],
      contentTypePerformance: []
    }
  }
}

const contentTypeDistribution = [
  { type: "Video Lessons", count: 245, percentage: 42, color: "bg-blue-500" },
  { type: "Interactive Exercises", count: 180, percentage: 31, color: "bg-green-500" },
  { type: "Audio Dialogues", count: 95, percentage: 16, color: "bg-purple-500" },
  { type: "Quizzes", count: 65, percentage: 11, color: "bg-amber-500" },
]

const topPerformingContent = [
  {
    id: "1",
    title: "The Impact of Technology on Modern Society",
    type: "video",
    views: 12450,
    completionRate: 78,
    avgEngagementTime: 540,
    likes: 845,
    comments: 132,
    trend: "up",
    trendPercentage: 12,
    publishDate: "2025-03-15T00:00:00Z",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "2",
    title: "Business Communication Skills for International Meetings",
    type: "interactive",
    views: 9876,
    completionRate: 82,
    avgEngagementTime: 720,
    likes: 762,
    comments: 98,
    trend: "up",
    trendPercentage: 8,
    publishDate: "2025-04-02T00:00:00Z",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "3",
    title: "Climate Change: Global Challenges and Solutions",
    type: "video",
    views: 8765,
    completionRate: 65,
    avgEngagementTime: 480,
    likes: 543,
    comments: 87,
    trend: "down",
    trendPercentage: 3,
    publishDate: "2025-02-20T00:00:00Z",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "4",
    title: "Advanced English Grammar: Conditional Sentences",
    type: "quiz",
    views: 7654,
    completionRate: 91,
    avgEngagementTime: 360,
    likes: 621,
    comments: 45,
    trend: "up",
    trendPercentage: 15,
    publishDate: "2025-04-10T00:00:00Z",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "5",
    title: "Everyday Conversations: At the Restaurant",
    type: "audio",
    views: 6543,
    completionRate: 73,
    avgEngagementTime: 420,
    likes: 432,
    comments: 56,
    trend: "up",
    trendPercentage: 5,
    publishDate: "2025-03-28T00:00:00Z",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "6",
    title: "Introduction to Artificial Intelligence",
    type: "interactive",
    views: 5432,
    completionRate: 68,
    avgEngagementTime: 510,
    likes: 387,
    comments: 64,
    trend: "down",
    trendPercentage: 2,
    publishDate: "2025-02-05T00:00:00Z",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "7",
    title: "Cultural Diversity in the Workplace",
    type: "video",
    views: 4321,
    completionRate: 71,
    avgEngagementTime: 495,
    likes: 321,
    comments: 48,
    trend: "up",
    trendPercentage: 7,
    publishDate: "2025-03-12T00:00:00Z",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: "8",
    title: "Pronunciation Practice: Difficult English Sounds",
    type: "audio",
    views: 3210,
    completionRate: 85,
    avgEngagementTime: 380,
    likes: 276,
    comments: 39,
    trend: "up",
    trendPercentage: 10,
    publishDate: "2025-04-05T00:00:00Z",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
]

const contentEngagementByDevice = [
  { device: "Desktop", percentage: 45, color: "bg-blue-500" },
  { device: "Mobile", percentage: 38, color: "bg-green-500" },
  { device: "Tablet", percentage: 12, color: "bg-purple-500" },
  { device: "Other", percentage: 5, color: "bg-amber-500" },
]

const contentEngagementByTime = [
  { hour: "00:00", users: 120 },
  { hour: "02:00", users: 80 },
  { hour: "04:00", users: 40 },
  { hour: "06:00", users: 100 },
  { hour: "08:00", users: 280 },
  { hour: "10:00", users: 460 },
  { hour: "12:00", users: 380 },
  { hour: "14:00", users: 340 },
  { hour: "16:00", users: 300 },
  { hour: "18:00", users: 420 },
  { hour: "20:00", users: 380 },
  { hour: "22:00", users: 220 },
]

const contentFeedback = [
  { sentiment: "Positive", percentage: 68, color: "bg-green-500" },
  { sentiment: "Neutral", percentage: 24, color: "bg-blue-500" },
  { sentiment: "Negative", percentage: 8, color: "bg-red-500" },
]

const contentTypePerformance = [
  { type: "Video Lessons", engagement: 78, completion: 72, satisfaction: 4.2, color: "bg-blue-500" },
  { type: "Interactive Exercises", engagement: 85, completion: 80, satisfaction: 4.5, color: "bg-green-500" },
  { type: "Audio Dialogues", engagement: 65, completion: 68, satisfaction: 3.9, color: "bg-purple-500" },
  { type: "Quizzes", engagement: 92, completion: 88, satisfaction: 4.3, color: "bg-amber-500" },
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

// Helper function to get content type icon
const getContentTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return <FileVideo className="h-4 w-4 text-blue-500" />
    case "interactive":
      return <Layers className="h-4 w-4 text-green-500" />
    case "audio":
      return <FileAudio className="h-4 w-4 text-purple-500" />
    case "quiz":
      return <FileQuestion className="h-4 w-4 text-amber-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

// Chart components
const LineChartComponent = ({ data, isLoading = false }: { data: any[]; isLoading?: boolean }) => {
  const chartHeight = 200
  const chartWidth = 600
  const maxValue = Math.max(...data.map((item) => Math.max(item.views, item.engagement, item.completion))) * 1.1

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

        {/* Views line */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d={`M ${data.map((item, i) => `${(i * chartWidth) / (data.length - 1)},${chartHeight - (item.views / maxValue) * chartHeight}`).join(" L ")}`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
        />

        {/* Engagement line */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
          d={`M ${data.map((item, i) => `${(i * chartWidth) / (data.length - 1)},${chartHeight - (item.engagement / maxValue) * chartHeight}`).join(" L ")}`}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
        />

        {/* Completion line */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.6 }}
          d={`M ${data.map((item, i) => `${(i * chartWidth) / (data.length - 1)},${chartHeight - (item.completion / maxValue) * chartHeight}`).join(" L ")}`}
          fill="none"
          stroke="#a855f7"
          strokeWidth="3"
        />

        {/* Data points for Views */}
        {data.map((item, i) => (
          <motion.circle
            key={`views-${i}`}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 4, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2 + i * 0.05 }}
            cx={(i * chartWidth) / (data.length - 1)}
            cy={chartHeight - (item.views / maxValue) * chartHeight}
            fill="white"
            stroke="#3b82f6"
            strokeWidth="2"
            className="cursor-pointer hover:r-6"
          />
        ))}

        {/* Data points for Engagement */}
        {data.map((item, i) => (
          <motion.circle
            key={`engagement-${i}`}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 4, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.3 + i * 0.05 }}
            cx={(i * chartWidth) / (data.length - 1)}
            cy={chartHeight - (item.engagement / maxValue) * chartHeight}
            fill="white"
            stroke="#22c55e"
            strokeWidth="2"
            className="cursor-pointer hover:r-6"
          />
        ))}

        {/* Data points for Completion */}
        {data.map((item, i) => (
          <motion.circle
            key={`completion-${i}`}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 4, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.6 + i * 0.05 }}
            cx={(i * chartWidth) / (data.length - 1)}
            cy={chartHeight - (item.completion / maxValue) * chartHeight}
            fill="white"
            stroke="#a855f7"
            strokeWidth="2"
            className="cursor-pointer hover:r-6"
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {data
          .filter((_, i) => i % 2 === 0 || i === data.length - 1)
          .map((item, i) => (
            <div key={i}>{item.month}</div>
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
              <span className="text-sm font-medium">{item.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.engagement}%</span>
              <span className="text-xs text-muted-foreground">Engagement</span>
            </div>
          </div>
          <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.engagement}%` }}
              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
              className={cn("h-full rounded-full", item.color || "bg-primary")}
            />
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Completion</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.completion}%</span>
            </div>
          </div>
          <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.completion}%` }}
              transition={{ duration: 1, delay: 0.7 + i * 0.1 }}
              className={cn("h-full rounded-full opacity-70", item.color || "bg-primary")}
            />
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array(5)
                  .fill(0)
                  .map((_, starIndex) => (
                    <motion.svg
                      key={starIndex}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.1 + starIndex * 0.05 }}
                      className={cn(
                        "w-4 h-4",
                        starIndex < Math.floor(item.satisfaction) ? "text-yellow-400" : "text-gray-300",
                        starIndex === Math.floor(item.satisfaction) && item.satisfaction % 1 > 0
                          ? "text-yellow-400 opacity-50"
                          : "",
                      )}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
              </div>
              <span className="text-sm font-medium">{item.satisfaction.toFixed(1)}</span>
            </div>
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

  const total = data.reduce((sum, item) => sum + item.percentage, 0)
  let cumulativePercentage = 0

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      <div className="relative w-40 h-40">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {data.map((item, i) => {
            const startAngle = cumulativePercentage * 3.6 // 3.6 degrees per percentage point
            cumulativePercentage += item.percentage
            const endAngle = cumulativePercentage * 3.6

            // Calculate the SVG arc path
            const startX = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180))
            const startY = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180))
            const endX = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180))
            const endY = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180))
            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

            const pathData = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`

            return (
              <motion.path
                key={i}
                d={pathData}
                fill={item.color.replace("bg-", "var(--")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              />
            )
          })}
          <circle cx="50" cy="50" r="25" fill="white" />
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={cn("w-3 h-3 rounded-full", item.color)} />
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{item.type || item.device || item.sentiment}</span>
                <span className="text-sm">{item.count ? formatNumber(item.count) : `${item.percentage}%`}</span>
              </div>
              {item.count && <div className="text-xs text-muted-foreground">{item.percentage}% of content</div>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Card components
const ExpandableCard = ({
  title,
  description,
  children,
  icon,
  isLoading = false,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  icon: React.ReactNode
  isLoading?: boolean
  className?: string
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={cn("transition-all duration-300", className, isExpanded ? "col-span-full" : "")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isExpanded ? "Collapse" : "Expand"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="sm" className="justify-start h-8">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start h-8">
                      <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start h-8">
                      <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

export default function ContentAnalyticsPage() {
  const [dateRange, setDateRange] = useState("last30days")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedContent, setExpandedContent] = useState<string | null>(null)
  const [showInsights, setShowInsights] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [contentTypeFilter, setContentTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("views")
  const [sortOrder, setSortOrder] = useState("desc")

  // Refs for scroll animations
  const chartsRef = useRef<HTMLDivElement>(null)

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Function to handle data refresh
  const refreshData = async () => {
    setIsRefreshing(true)
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setIsRefreshing(false)

    toast({
      title: "Data refreshed",
      description: "Content analytics data has been updated with the latest information.",
    })
  }

  // Function to handle data export
  const exportData = () => {
    toast({
      title: "Export started",
      description: "Content analytics data is being exported. You'll be notified when it's ready.",
    })
  }

  // Function to toggle content details
  const toggleContentDetails = (id: string) => {
    setExpandedContent(expandedContent === id ? null : id)
  }

  // Filter and sort content
  const filteredContent = topPerformingContent
    .filter((content) => {
      // Filter by search query
      if (searchQuery && !content.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Filter by content type
      if (contentTypeFilter !== "all" && content.type !== contentTypeFilter) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort by selected field
      let comparison = 0

      switch (sortBy) {
        case "views":
          comparison = a.views - b.views
          break
        case "completionRate":
          comparison = a.completionRate - b.completionRate
          break
        case "avgEngagementTime":
          comparison = a.avgEngagementTime - b.avgEngagementTime
          break
        case "likes":
          comparison = a.likes - b.likes
          break
        case "comments":
          comparison = a.comments - b.comments
          break
        case "publishDate":
          comparison = new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
          break
        default:
          comparison = a.views - b.views
      }

      // Apply sort order
      return sortOrder === "desc" ? -comparison : comparison
    })

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
    <>
      <Helmet>
        <title>Content Analytics | Admin Dashboard</title>
        <meta
          name="description"
          content="Analyze content performance and engagement metrics for your English learning platform"
        />
        <meta
          name="keywords"
          content="content analytics, performance metrics, engagement, learning platform, admin dashboard"
        />
      </Helmet>

      <div className="container py-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Content Analytics
            </h1>
            <p className="text-muted-foreground">
              Track content performance and user engagement for {formatDateRange(dateRange)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select defaultValue={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="thisMonth">This month</SelectItem>
                <SelectItem value="lastMonth">Last month</SelectItem>
                <SelectItem value="thisYear">This year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
                    {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => setShowInsights(!showInsights)}>
                    <Zap className="h-4 w-4 mr-2" />
                    Insights
                    {showInsights ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Show AI-powered insights</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              onClick={exportData}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                      <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        Content Performance Insights
                        <Badge className="ml-2 bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                          AI-Generated
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">Interactive exercises show 18% higher engagement</span> than
                            video content. Consider converting more passive content to interactive formats.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">Content completion rates drop significantly</span> after the
                            8-minute mark. Consider breaking longer content into shorter, focused segments.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-medium">Mobile users engage 32% more</span> with audio content
                            compared to desktop users. Optimize audio lessons for mobile experiences.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                          View detailed insights
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8" onClick={() => setShowInsights(false)}>
                          <X className="h-4 w-4 mr-1" /> Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <Card className="border-t-4 border-t-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{formatNumber(325842)}</div>
                      <div className="flex items-center text-sm font-medium text-green-500">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+15%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Compared to previous period</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-t-4 border-t-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  Avg. Engagement Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">8:42</div>
                      <div className="flex items-center text-sm font-medium text-green-500">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+8%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Minutes per content view</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-t-4 border-t-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-purple-500" />
                  Content Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">4.3/5</div>
                      <div className="flex items-center text-sm font-medium text-green-500">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+0.2</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Average user rating</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-t-4 border-t-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-500" />
                  User Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{formatNumber(12458)}</div>
                      <div className="flex items-center text-sm font-medium text-green-500">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+22%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Comments, likes, and shares</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} ref={chartsRef}>
          <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Content Library</span>
              </TabsTrigger>
              <TabsTrigger value="engagement" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Engagement</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpandableCard
                  title="Content Performance Trends"
                  description="Monthly views, engagement, and completion rates"
                  icon={<LineChart className="h-5 w-5 text-primary" />}
                  isLoading={isLoading}
                >
                  <LineChartComponent data={contentTypePerformance} isLoading={isLoading} />
                  <div className="flex items-center gap-4 mt-4 text-sm flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Engagement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span>Completion</span>
                    </div>
                  </div>
                </ExpandableCard>

                <ExpandableCard
                  title="Content Type Distribution"
                  description="Breakdown of content by type"
                  icon={<PieChart className="h-5 w-5 text-primary" />}
                  isLoading={isLoading}
                >
                  <PieChartComponent data={contentTypeDistribution} isLoading={isLoading} />
                </ExpandableCard>
              </div>

              <ExpandableCard
                title="Content Type Performance"
                description="Engagement, completion, and satisfaction by content type"
                icon={<BarChart className="h-5 w-5 text-primary" />}
                isLoading={isLoading}
              >
                <BarChartComponent data={contentTypePerformance} isLoading={isLoading} />
              </ExpandableCard>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Library</CardTitle>
                  <CardDescription>Browse and analyze all content performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search content..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                        <SelectTrigger className="w-[150px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="video">Videos</SelectItem>
                          <SelectItem value="interactive">Interactive</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="quiz">Quizzes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        <span className="hidden sm:inline">{sortOrder === "desc" ? "Descending" : "Ascending"}</span>
                      </Button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredContent.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                          <h3 className="mt-4 text-lg font-medium">No content found</h3>
                          <p className="text-muted-foreground">Try adjusting your search or filters</p>
                        </div>
                      ) : (
                        filteredContent.map((content, index) => (
                          <motion.div
                            key={content.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "p-4 rounded-lg border hover:bg-muted/20 transition-all duration-300",
                              expandedContent === content.id ? "bg-muted/20" : "",
                            )}
                          >
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="md:w-[120px] h-[80px] rounded-md overflow-hidden bg-muted/50 relative">
                                <img
                                  src={content.thumbnail || "/placeholder.svg"}
                                  alt={content.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  {content.type === "video" && <FileVideo className="h-8 w-8 text-white" />}
                                  {content.type === "interactive" && <Layers className="h-8 w-8 text-white" />}
                                  {content.type === "audio" && <FileAudio className="h-8 w-8 text-white" />}
                                  {content.type === "quiz" && <FileQuestion className="h-8 w-8 text-white" />}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-base line-clamp-1 flex items-center">
                                      {content.title}
                                      <Badge variant="outline" className="ml-2 capitalize">
                                        {content.type}
                                      </Badge>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Published {format(parseISO(content.publishDate), "MMM d, yyyy")}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "ml-2 whitespace-nowrap",
                                      content.completionRate >= 75
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : content.completionRate >= 60
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                                    )}
                                  >
                                    {content.completionRate}% completion
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 text-xs text-muted-foreground">
                                  <div>
                                    <p className="font-medium text-foreground">{formatNumber(content.views)}</p>
                                    <p>Views</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {formatTime(content.avgEngagementTime)}
                                    </p>
                                    <p>Avg. Time</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{formatNumber(content.likes)}</p>
                                    <p>Likes</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{formatNumber(content.comments)}</p>
                                    <p>Comments</p>
                                  </div>
                                  <div>
                                    <span
                                      className={cn(
                                        "flex items-center font-medium",
                                        content.trend === "up" ? "text-green-500" : "text-red-500",
                                      )}
                                    >
                                      {content.trend === "up" ? (
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                      )}
                                      {content.trendPercentage}% from last period
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-3">
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${content.completionRate}%` }}
                                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                  className={cn(
                                    "h-1.5 rounded-full",
                                    content.completionRate >= 75
                                      ? "bg-green-500"
                                      : content.completionRate >= 60
                                        ? "bg-blue-500"
                                        : "bg-amber-500",
                                  )}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs ml-4"
                                onClick={() => toggleContentDetails(content.id)}
                              >
                                {expandedContent === content.id ? "Less details" : "More details"}
                                {expandedContent === content.id ? (
                                  <ChevronUp className="h-3 w-3 ml-1" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 ml-1" />
                                )}
                              </Button>
                            </div>

                            <AnimatePresence>
                              {expandedContent === content.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="mt-4 pt-4 border-t overflow-hidden"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <h5 className="text-sm font-medium">Engagement Metrics</h5>
                                      <div className="space-y-3">
                                        <div>
                                          <div className="flex justify-between text-xs mb-1">
                                            <span>Watch Time Distribution</span>
                                            <span>Avg: {formatTime(content.avgEngagementTime)}</span>
                                          </div>
                                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                              style={{ width: "65%" }}
                                            ></div>
                                          </div>
                                        </div>
                                        <div>
                                          <div className="flex justify-between text-xs mb-1">
                                            <span>Completion Rate</span>
                                            <span>{content.completionRate}%</span>
                                          </div>
                                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                              className={cn(
                                                "h-full rounded-full",
                                                content.completionRate >= 75
                                                  ? "bg-green-500"
                                                  : content.completionRate >= 60
                                                    ? "bg-blue-500"
                                                    : "bg-amber-500",
                                              )}
                                              style={{ width: `${content.completionRate}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                        <div>
                                          <div className="flex justify-between text-xs mb-1">
                                            <span>User Satisfaction</span>
                                            <span>4.2/5</span>
                                          </div>
                                          <div className="flex">
                                            {Array(5)
                                              .fill(0)
                                              .map((_, i) => (
                                                <svg
                                                  key={i}
                                                  className={cn(
                                                    "w-4 h-4",
                                                    i < 4 ? "text-yellow-400" : "text-gray-300",
                                                    i === 4 ? "text-yellow-400 opacity-20" : "",
                                                  )}
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                                >
                                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                              ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <h5 className="text-sm font-medium">User Feedback</h5>
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <ThumbsUp className="h-4 w-4 text-green-500" />
                                            <span className="text-xs">Positive</span>
                                          </div>
                                          <span className="text-xs font-medium">68%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-blue-500" />
                                            <span className="text-xs">Neutral</span>
                                          </div>
                                          <span className="text-xs font-medium">24%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                            <span className="text-xs">Negative</span>
                                          </div>
                                          <span className="text-xs font-medium">8%</span>
                                        </div>
                                      </div>
                                      <div className="mt-4">
                                        <h5 className="text-sm font-medium mb-2">Top Comments</h5>
                                        <div className="space-y-2 text-xs">
                                          <div className="p-2 bg-muted/30 rounded-md">
                                            "Very informative content, helped me understand the topic clearly."
                                          </div>
                                          <div className="p-2 bg-muted/30 rounded-md">
                                            "Could use more examples to illustrate the concepts."
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-end mt-4 gap-2">
                                    <Button variant="outline" size="sm" className="h-8 text-xs">
                                      <Eye className="h-3 w-3 mr-1" /> Preview
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 text-xs">
                                      <FileText className="h-3 w-3 mr-1" /> Full Report
                                    </Button>
                                    <Button variant="default" size="sm" className="h-8 text-xs">
                                      <ArrowRight className="h-3 w-3 mr-1" /> Edit Content
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {!isLoading && filteredContent.length > 0 && (
                    <div className="flex justify-between items-center mt-6">
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredContent.length} of {topPerformingContent.length} items
                      </div>
                      <Button variant="outline" size="sm">
                        Load More
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpandableCard
                  title="Content Engagement by Device"
                  description="How users engage with content across different devices"
                  icon={<PieChart className="h-5 w-5 text-primary" />}
                  isLoading={isLoading}
                >
                  <PieChartComponent data={contentEngagementByDevice} isLoading={isLoading} />
                </ExpandableCard>

                <ExpandableCard
                  title="Engagement by Time of Day"
                  description="When users are most active with content"
                  icon={<Clock className="h-5 w-5 text-primary" />}
                  isLoading={isLoading}
                >
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : (
                    <div className="h-[200px] relative">
                      <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map((line, i) => (
                          <line
                            key={i}
                            x1="0"
                            y1={200 - (200 * line) / 4}
                            x2={600}
                            y2={200 - (200 * line) / 4}
                            stroke="#e5e7eb"
                            strokeDasharray="5,5"
                          />
                        ))}

                        {/* Area chart */}
                        <motion.path
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.2 }}
                          transition={{ duration: 1 }}
                          d={`M 0 200 ${contentEngagementByTime.map((item, i) => `L ${(i * 600) / (contentEngagementByTime.length - 1)} ${200 - (item.users / 460) * 180}`).join(" ")} L 600 200 Z`}
                          fill="url(#areaGradient)"
                        />

                        {/* Line chart */}
                        <motion.path
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          d={`M ${contentEngagementByTime.map((item, i) => `${(i * 600) / (contentEngagementByTime.length - 1)},${200 - (item.users / 460) * 180}`).join(" L ")}`}
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                        />

                        {/* Data points */}
                        {contentEngagementByTime.map((item, i) => (
                          <motion.circle
                            key={i}
                            initial={{ r: 0, opacity: 0 }}
                            animate={{ r: 4, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 2 + i * 0.1 }}
                            cx={(i * 600) / (contentEngagementByTime.length - 1)}
                            cy={200 - (item.users / 460) * 180}
                            fill="white"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            className="cursor-pointer hover:r-6"
                          />
                        ))}

                        {/* Gradient definitions */}
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* X-axis labels */}
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        {contentEngagementByTime
                          .filter((_, i) => i % 2 === 0 || i === contentEngagementByTime.length - 1)
                          .map((item, i) => (
                            <div key={i}>{item.hour}</div>
                          ))}
                      </div>
                    </div>
                  )}
                </ExpandableCard>
              </div>

              <ExpandableCard
                title="User Feedback Analysis"
                description="Sentiment analysis of user comments and ratings"
                icon={<MessageSquare className="h-5 w-5 text-primary" />}
                isLoading={isLoading}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-base font-medium mb-4">Sentiment Distribution</h3>
                    <PieChartComponent data={contentFeedback} isLoading={isLoading} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-4">Common Feedback Themes</h3>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="p-3 rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20"
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium flex items-center">
                              <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                              Clear explanations
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-medium">42%</span>
                          </div>
                          <Progress value={42} className="h-1.5" />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium flex items-center">
                              <ThumbsUp className="h-4 w-4 mr-2 text-blue-500" />
                              Engaging exercises
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">35%</span>
                          </div>
                          <Progress value={35} className="h-1.5" />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="p-3 rounded-lg border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                              Need more examples
                            </span>
                            <span className="text-amber-600 dark:text-amber-400 font-medium">18%</span>
                          </div>
                          <Progress value={18} className="h-1.5" />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="p-3 rounded-lg border bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20"
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                              Audio quality issues
                            </span>
                            <span className="text-red-600 dark:text-red-400 font-medium">5%</span>
                          </div>
                          <Progress value={5} className="h-1.5" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </ExpandableCard>

              <Card>
                <CardHeader>
                  <CardTitle>Content Improvement Recommendations</CardTitle>
                  <CardDescription>AI-generated suggestions to improve content performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                      >
                        <div className="flex gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full h-fit">
                            <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium">Video Content Optimization</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Videos longer than 10 minutes have 35% lower completion rates. Consider breaking longer
                              videos into 5-8 minute segments with clear learning objectives for each part.
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Badge
                                variant="outline"
                                className="bg-blue-100/50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                High Impact
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-green-100/50 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              >
                                Easy Implementation
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-lg border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20"
                      >
                        <div className="flex gap-4">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit">
                            <Layers className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium">Interactive Elements</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Content with interactive elements shows 42% higher engagement. Add at least 2-3
                              interactive elements (quizzes, drag-and-drop, clickable diagrams) to your top 10 video
                              lessons.
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Badge
                                variant="outline"
                                className="bg-blue-100/50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                High Impact
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-amber-100/50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              >
                                Medium Implementation
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 rounded-lg border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
                      >
                        <div className="flex gap-4">
                          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full h-fit">
                            <FileAudio className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium">Audio Quality Improvement</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              8% of negative feedback mentions audio quality issues. Implement standardized audio
                              processing for all new content and remaster the top 20 most-viewed audio lessons.
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Badge
                                variant="outline"
                                className="bg-amber-100/50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              >
                                Medium Impact
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-amber-100/50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              >
                                Medium Implementation
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Custom Recommendations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="mt-8 flex justify-between items-center"
        >
          <p className="text-sm text-muted-foreground">
            Data last updated: {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print report
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Save as PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
