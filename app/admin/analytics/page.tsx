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
import { format, subDays, subMonths } from "date-fns"
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

// Mock data for charts
const userGrowthData = [
  { month: "Jan", users: 1200, previousUsers: 980 },
  { month: "Feb", users: 1400, previousUsers: 1100 },
  { month: "Mar", users: 1800, previousUsers: 1350 },
  { month: "Apr", users: 2200, previousUsers: 1600 },
  { month: "May", users: 2600, previousUsers: 1900 },
  { month: "Jun", users: 3100, previousUsers: 2300 },
  { month: "Jul", users: 3500, previousUsers: 2700 },
  { month: "Aug", users: 4000, previousUsers: 3100 },
  { month: "Sep", users: 4200, previousUsers: 3400 },
  { month: "Oct", users: 4500, previousUsers: 3700 },
  { month: "Nov", users: 4800, previousUsers: 4000 },
  { month: "Dec", users: 5200, previousUsers: 4300 },
]

const challengeCompletionData = [
  { challenge: "Daily Speaking", completed: 78, target: 85, color: "bg-green-500" },
  { challenge: "Grammar Quiz", completed: 65, target: 75, color: "bg-blue-500" },
  { challenge: "Vocabulary", completed: 82, target: 80, color: "bg-purple-500" },
  { challenge: "Listening", completed: 71, target: 80, color: "bg-orange-500" },
  { challenge: "Reading", completed: 60, target: 70, color: "bg-pink-500" },
  { challenge: "Writing", completed: 55, target: 65, color: "bg-yellow-500" },
]

const userLevelDistribution = [
  { level: "Beginner", count: 2500, percentage: 48, color: "bg-green-500" },
  { level: "Intermediate", count: 1800, percentage: 35, color: "bg-blue-500" },
  { level: "Advanced", count: 900, percentage: 17, color: "bg-purple-500" },
]

const engagementByTimeData = [
  { hour: "00:00", users: 120, previousUsers: 95 },
  { hour: "02:00", users: 80, previousUsers: 65 },
  { hour: "04:00", users: 40, previousUsers: 35 },
  { hour: "06:00", users: 100, previousUsers: 85 },
  { hour: "08:00", users: 280, previousUsers: 220 },
  { hour: "10:00", users: 460, previousUsers: 380 },
  { hour: "12:00", users: 380, previousUsers: 320 },
  { hour: "14:00", users: 340, previousUsers: 290 },
  { hour: "16:00", users: 300, previousUsers: 260 },
  { hour: "18:00", users: 420, previousUsers: 350 },
  { hour: "20:00", users: 380, previousUsers: 310 },
  { hour: "22:00", users: 220, previousUsers: 180 },
]

const skillImprovementData = [
  { skill: "Speaking", improvement: 24, previousImprovement: 18, trend: "up" },
  { skill: "Listening", improvement: 32, previousImprovement: 26, trend: "up" },
  { skill: "Reading", improvement: 28, previousImprovement: 30, trend: "down" },
  { skill: "Writing", improvement: 22, previousImprovement: 19, trend: "up" },
  { skill: "Grammar", improvement: 18, previousImprovement: 20, trend: "down" },
  { skill: "Vocabulary", improvement: 30, previousImprovement: 25, trend: "up" },
]

const topPerformingVideos = [
  {
    id: "1",
    title: "The Impact of Technology on Modern Society",
    views: 1245,
    completionRate: 72,
    avgWatchTime: 240,
    trend: "up",
    trendPercentage: 8,
  },
  {
    id: "2",
    title: "Climate Change: Global Challenges",
    views: 876,
    completionRate: 65,
    avgWatchTime: 210,
    trend: "down",
    trendPercentage: 3,
  },
  {
    id: "3",
    title: "Introduction to Artificial Intelligence",
    views: 1532,
    completionRate: 88,
    avgWatchTime: 280,
    trend: "up",
    trendPercentage: 12,
  },
  {
    id: "4",
    title: "Business Communication Skills",
    views: 945,
    completionRate: 54,
    avgWatchTime: 190,
    trend: "up",
    trendPercentage: 5,
  },
  {
    id: "5",
    title: "Cultural Diversity in the Workplace",
    views: 723,
    completionRate: 61,
    avgWatchTime: 205,
    trend: "down",
    trendPercentage: 2,
  },
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
            cumulativePercentage += (item.count / total) * 100
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
                <span className="text-sm font-medium">{item.level}</span>
                <span className="text-sm">{formatNumber(item.count)}</span>
              </div>
              <div className="text-xs text-muted-foreground">{item.percentage}% of users</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Card components
const StatCard = ({
  title,
  value,
  trend,
  trendValue,
  description,
  icon,
  isLoading = false,
}: {
  title: string
  value: string | number
  trend?: "up" | "down" | "neutral"
  trendValue?: string | number
  description?: string
  icon: React.ReactNode
  isLoading?: boolean
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
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
              <div className="text-3xl font-bold">{value}</div>
              {trend && (
                <div
                  className={cn(
                    "flex items-center text-sm font-medium",
                    trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500",
                  )}
                >
                  {trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : trend === "down" ? (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  ) : null}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

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

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("last30days")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)
  const [showInsights, setShowInsights] = useState(false)

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
            Track your platform performance and user engagement for {formatDateRange(dateRange)}
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
                      AI-Powered Insights
                      <Badge className="ml-2 bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                        New
                      </Badge>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">User engagement is up 15%</span> compared to the previous
                          period, with the highest growth in the "Travel English" learning path.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">Completion rates for Grammar challenges</span> are below target.
                          Consider simplifying content or adding more interactive elements.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">Peak usage times</span> are between 10:00-12:00 and 18:00-20:00.
                          Schedule new content releases during these windows for maximum visibility.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="h-8">
                        View detailed report
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
          <StatCard
            title="Total Users"
            value={formatNumber(5248)}
            trend="up"
            trendValue="+12%"
            description="Compared to previous period"
            icon={<Users className="h-4 w-4 text-primary" />}
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="Active Challenges"
            value={24}
            trend="up"
            trendValue="+4"
            description="8 challenges ending this week"
            icon={<Award className="h-4 w-4 text-primary" />}
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="Completion Rate"
            value="68%"
            trend="up"
            trendValue="+5%"
            description="From previous challenges"
            icon={<CheckCircle className="h-4 w-4 text-primary" />}
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCard
            title="Avg. Engagement Time"
            value="18:24"
            trend="down"
            trendValue="-2%"
            description="Minutes per active user"
            icon={<Clock className="h-4 w-4 text-primary" />}
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} ref={chartsRef}>
        <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Learning</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpandableCard
                title="User Growth"
                description="Monthly user growth over the past year"
                icon={<LineChart className="h-5 w-5 text-primary" />}
                isLoading={isLoading}
              >
                <LineChartComponent data={userGrowthData} isLoading={isLoading} />
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Current period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span>Previous period</span>
                  </div>
                </div>
              </ExpandableCard>

              <ExpandableCard
                title="Challenge Completion"
                description="Completion rates by challenge type"
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
                isLoading={isLoading}
              >
                <BarChartComponent data={challengeCompletionData} isLoading={isLoading} />
              </ExpandableCard>
            </div>

            <ExpandableCard
              title="Skill Improvement Metrics"
              description="Average improvement across all users by skill type"
              icon={<Award className="h-5 w-5 text-primary" />}
              isLoading={isLoading}
            >
              <BarChartComponent data={skillImprovementData} isLoading={isLoading} />
            </ExpandableCard>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ExpandableCard
                title="User Level Distribution"
                description="Breakdown of users by proficiency level"
                icon={<PieChart className="h-5 w-5 text-primary" />}
                isLoading={isLoading}
              >
                <PieChartComponent data={userLevelDistribution} isLoading={isLoading} />
              </ExpandableCard>

              <ExpandableCard
                title="User Engagement by Time"
                description="Active users throughout the day"
                icon={<LineChart className="h-5 w-5 text-primary" />}
                isLoading={isLoading}
                className="md:col-span-2"
              >
                <LineChartComponent data={engagementByTimeData} isLoading={isLoading} />
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Current period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span>Previous period</span>
                  </div>
                </div>
              </ExpandableCard>
            </div>

            <ExpandableCard
              title="User Activity Metrics"
              description="Key user engagement statistics"
              icon={<Users className="h-5 w-5 text-primary" />}
              isLoading={isLoading}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                  Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Daily Active Users</span>
                        <Badge variant="outline">1,248</Badge>
                      </div>
                      <Progress value={65} className="h-2" />
                      <p className="text-xs text-muted-foreground">65% of total users</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">New Registrations</span>
                        <Badge variant="outline">128</Badge>
                      </div>
                      <Progress value={12} className="h-2" />
                      <p className="text-xs text-muted-foreground">+12% from last week</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Bounce Rate</span>
                        <Badge variant="outline">45%</Badge>
                      </div>
                      <Progress value={45} className="h-2" />
                      <p className="text-xs text-muted-foreground">-2% from last week</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Retention Rate</span>
                        <Badge variant="outline">78%</Badge>
                      </div>
                      <Progress value={78} className="h-2" />
                      <p className="text-xs text-muted-foreground">+3% from last month</p>
                    </motion.div>
                  </>
                )}
              </div>
            </ExpandableCard>

            <ExpandableCard
              title="User Retention Cohorts"
              description="Weekly cohort analysis of user retention"
              icon={<Calendar className="h-5 w-5 text-primary" />}
              isLoading={isLoading}
            >
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cohort</TableHead>
                        <TableHead>Day 1</TableHead>
                        <TableHead>Day 7</TableHead>
                        <TableHead>Day 14</TableHead>
                        <TableHead>Day 30</TableHead>
                        <TableHead>Day 60</TableHead>
                        <TableHead>Day 90</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retentionCohortData.map((cohort, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{cohort.cohort}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 text-right">{cohort.day1}%</div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cohort.day1}%` }}
                                  transition={{ duration: 1, delay: 0.1 * i }}
                                  className="bg-green-500 h-2 rounded-full"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 text-right">{cohort.day7}%</div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cohort.day7}%` }}
                                  transition={{ duration: 1, delay: 0.1 * i + 0.1 }}
                                  className="bg-blue-500 h-2 rounded-full"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 text-right">{cohort.day14}%</div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cohort.day14}%` }}
                                  transition={{ duration: 1, delay: 0.1 * i + 0.2 }}
                                  className="bg-purple-500 h-2 rounded-full"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 text-right">{cohort.day30}%</div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cohort.day30}%` }}
                                  transition={{ duration: 1, delay: 0.1 * i + 0.3 }}
                                  className="bg-pink-500 h-2 rounded-full"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 text-right">{cohort.day60}%</div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cohort.day60}%` }}
                                  transition={{ duration: 1, delay: 0.1 * i + 0.4 }}
                                  className="bg-orange-500 h-2 rounded-full"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 text-right">{cohort.day90}%</div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${cohort.day90}%` }}
                                  transition={{ duration: 1, delay: 0.1 * i + 0.5 }}
                                  className="bg-yellow-500 h-2 rounded-full"
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ExpandableCard>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpandableCard
                title="Top Performing Videos"
                description="Videos with highest engagement and completion rates"
                icon={<Video className="h-5 w-5 text-primary" />}
                isLoading={isLoading}
              >
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topPerformingVideos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "p-3 rounded-lg border hover:bg-muted/20 transition-all duration-300",
                          expandedVideo === video.id ? "bg-muted/20" : "",
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm line-clamp-1 flex items-center">
                            <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                            {video.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-2 whitespace-nowrap",
                              video.completionRate >= 75
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : video.completionRate >= 60
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                            )}
                          >
                            {video.completionRate}% completion
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>
                            <p className="font-medium text-foreground">{formatNumber(video.views)}</p>
                            <p>Views</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{formatTime(video.avgWatchTime)}</p>
                            <p>Avg. Watch Time</p>
                          </div>
                          <div>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${video.completionRate}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                className={cn(
                                  "h-1.5 rounded-full",
                                  video.completionRate >= 75
                                    ? "bg-green-500"
                                    : video.completionRate >= 60
                                      ? "bg-blue-500"
                                      : "bg-amber-500",
                                )}
                              />
                            </div>
                            <p>Completion</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center text-xs">
                            <span
                              className={cn(
                                "flex items-center",
                                video.trend === "up" ? "text-green-500" : "text-red-500",
                              )}
                            >
                              {video.trend === "up" ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {video.trendPercentage}% from last period
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => toggleVideoDetails(video.id)}
                          >
                            {expandedVideo === video.id ? "Less details" : "More details"}
                            {expandedVideo === video.id ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            )}
                          </Button>
                        </div>

                        <AnimatePresence>
                          {expandedVideo === video.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-3 pt-3 border-t overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <h5 className="text-xs font-medium">Watch Time Distribution</h5>
                                  <div className="h-20 bg-muted/30 rounded-md flex items-center justify-center">
                                    <LineChart className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h5 className="text-xs font-medium">User Feedback</h5>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Positive</span>
                                        <span>85%</span>
                                      </div>
                                      <Progress value={85} className="h-1.5" />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Neutral</span>
                                        <span>10%</span>
                                      </div>
                                      <Progress value={10} className="h-1.5" />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Negative</span>
                                        <span>5%</span>
                                      </div>
                                      <Progress value={5} className="h-1.5" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end mt-3">
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                  View full report
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ExpandableCard>

              <ExpandableCard
                title="Content Engagement"
                description="Engagement metrics by content type"
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
                isLoading={isLoading}
              >
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md">
                    <BarChart3 className="h-16 w-16 text-muted-foreground" />
                    <span className="sr-only">Bar chart showing content engagement</span>
                  </div>
                )}
              </ExpandableCard>
            </div>

            <ExpandableCard
              title="Challenge Completion Rates"
              description="Completion rates for different challenge types"
              icon={<CheckCircle className="h-5 w-5 text-primary" />}
              isLoading={isLoading}
            >
              <BarChartComponent data={challengeCompletionData} isLoading={isLoading} />
            </ExpandableCard>

            <ExpandableCard
              title="Learning Paths Performance"
              description="Engagement and completion metrics by learning path"
              icon={<Layers className="h-5 w-5 text-primary" />}
              isLoading={isLoading}
            >
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Learning Path</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Completion Rate</TableHead>
                        <TableHead>Satisfaction</TableHead>
                        <TableHead>Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {learningPathData.map((path, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{path.path}</TableCell>
                          <TableCell>{formatNumber(path.users)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${path.completionRate}%` }}
                                  transition={{ duration: 1, delay: 0.1 * i }}
                                  className={cn(
                                    "h-2 rounded-full",
                                    path.completionRate >= 75
                                      ? "bg-green-500"
                                      : path.completionRate >= 65
                                        ? "bg-blue-500"
                                        : "bg-amber-500",
                                  )}
                                />
                              </div>
                              <span>{path.completionRate}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex">
                                {Array(5)
                                  .fill(0)
                                  .map((_, starIndex) => (
                                    <motion.svg
                                      key={starIndex}
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.5 + i * 0.1 + starIndex * 0.05 }}
                                      className={cn(
                                        "w-4 h-4",
                                        starIndex < Math.floor(path.satisfaction) ? "text-yellow-400" : "text-gray-300",
                                      )}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </motion.svg>
                                  ))}
                              </div>
                              <span className="ml-2">{path.satisfaction.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <div className="w-16 h-8 bg-muted/30 rounded-md flex items-center justify-center">
                                <LineChart className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "ml-2",
                                  path.satisfaction >= 4.5
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : path.satisfaction >= 4.0
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                                )}
                              >
                                {path.satisfaction >= 4.5 ? "Excellent" : path.satisfaction >= 4.0 ? "Good" : "Average"}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ExpandableCard>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ExpandableCard
                title="Learning Progress"
                description="Average skill improvement over time"
                icon={<Award className="h-5 w-5 text-primary" />}
                isLoading={isLoading}
                className="md:col-span-2"
              >
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <div className="h-80 flex items-center justify-center bg-muted/30 rounded-md">
                    <LineChart className="h-16 w-16 text-muted-foreground" />
                    <span className="sr-only">Line chart showing learning progress</span>
                  </div>
                )}
              </ExpandableCard>

              <ExpandableCard
                title="Time to Proficiency"
                description="Average days to reach proficiency levels"
                icon={<Clock className="h-5 w-5 text-primary" />}
                isLoading={isLoading}
              >
                {isLoading ? (
                  <div className="space-y-6 pt-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-full mb-2" />
                            <Skeleton className="h-2 w-full" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-6 pt-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="font-bold text-green-600 dark:text-green-400">B</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">Beginner to Intermediate</p>
                          <p className="font-bold">45 days</p>
                        </div>
                        <Progress value={60} className="h-2 mt-2" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-4"
                    >
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="font-bold text-blue-600 dark:text-blue-400">I</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">Intermediate to Advanced</p>
                          <p className="font-bold">90 days</p>
                        </div>
                        <Progress value={40} className="h-2 mt-2" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-4"
                    >
                      <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <span className="font-bold text-purple-600 dark:text-purple-400">A</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">Advanced to Fluent</p>
                          <p className="font-bold">120 days</p>
                        </div>
                        <Progress value={25} className="h-2 mt-2" />
                      </div>
                    </motion.div>
                  </div>
                )}
              </ExpandableCard>
            </div>

            <ExpandableCard
              title="Learning Efficiency by Content Type"
              description="Which content types lead to fastest improvement"
              icon={<BarChart3 className="h-5 w-5 text-primary" />}
              isLoading={isLoading}
            >
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-80 flex items-center justify-center bg-muted/30 rounded-md">
                    <BarChart3 className="h-16 w-16 text-muted-foreground" />
                    <span className="sr-only">Bar chart showing learning efficiency by content type</span>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Key Findings</h3>

                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-3 p-3 rounded-lg border bg-muted/10"
                      >
                        <div className="mt-1">
                          <Video className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Interactive Videos</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Videos with interactive elements show 32% faster learning rates compared to standard videos.
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-3 p-3 rounded-lg border bg-muted/10"
                      >
                        <div className="mt-1">
                          <Users className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Group Challenges</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Collaborative challenges result in 28% higher retention of vocabulary and grammar concepts.
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-3 p-3 rounded-lg border bg-muted/10"
                      >
                        <div className="mt-1">
                          <Zap className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">AI-Assisted Practice</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Personalized AI feedback improves speaking proficiency 45% faster than traditional methods.
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    <Button variant="outline" className="w-full">
                      View detailed efficiency report
                    </Button>
                  </div>
                </div>
              )}
            </ExpandableCard>

            <ExpandableCard
              title="Skill Development Tracking"
              description="Detailed breakdown of skill development by user segments"
              icon={<Layers className="h-5 w-5 text-primary" />}
              isLoading={isLoading}
            >
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Skill Development by Level</h4>
                      <Select defaultValue="monthly">
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue placeholder="Time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium flex items-center">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            Beginner
                          </span>
                          <span className="text-sm">+24% improvement</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            transition={{ duration: 1 }}
                            className="bg-green-500 h-2 rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium flex items-center">
                            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                            Intermediate
                          </span>
                          <span className="text-sm">+18% improvement</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 1, delay: 0.1 }}
                            className="bg-blue-500 h-2 rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium flex items-center">
                            <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                            Advanced
                          </span>
                          <span className="text-sm">+12% improvement</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "45%" }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="bg-purple-500 h-2 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Learning Path Effectiveness</h4>
                      <Badge variant="outline">Top 3 shown</Badge>
                    </div>

                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-3 rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Travel English</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">92% effective</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Practical scenarios and real-world vocabulary lead to high engagement
                        </p>
                        <Progress value={92} className="h-1.5" />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Business English</span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">87% effective</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Professional context and career benefits drive consistent progress
                        </p>
                        <Progress value={87} className="h-1.5" />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Conversational English</span>
                          <span className="text-purple-600 dark:text-purple-400 font-medium">81% effective</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Interactive dialogues and cultural context enhance retention
                        </p>
                        <Progress value={81} className="h-1.5" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}
            </ExpandableCard>
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div variants={fadeIn} initial="hidden" animate="show" className="mt-8 flex justify-between items-center">
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
  )
}
