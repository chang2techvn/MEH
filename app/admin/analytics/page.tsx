"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Award,
  Clock,
  CheckCircle,
  Printer,
  FileText,
  Share2,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

import { AnalyticsHeader } from "./components/analytics-header"
import { InsightsPanel } from "./components/insights-panel"
import { StatCard } from "./components/stat-card"
import { OverviewTab } from "./components/tabs/overview-tab"
import { useAnalyticsState } from "./hooks/use-analytics-state"
import { formatNumber } from "./utils/format-utils"
import { ANIMATION_VARIANTS } from "./constants"
import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Download, Maximize2, Minimize2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  const {
    dateRange,
    setDateRange,
    isRefreshing,
    isLoading,
    activeTab,
    setActiveTab,
    showInsights,
    setShowInsights,
    refreshData,
    exportData,
    setIsLoading,
  } = useAnalyticsState()

  // Refs for scroll animations
  const chartsRef = useRef<HTMLDivElement>(null)

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Function to toggle video details
  const toggleVideoDetails = (id: string) => {
    //setExpandedVideo(expandedVideo === id ? null : id)
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
      <AnalyticsHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        isRefreshing={isRefreshing}
        showInsights={showInsights}
        setShowInsights={setShowInsights}
        onRefresh={refreshData}
        onExport={exportData}
      />

      <InsightsPanel showInsights={showInsights} setShowInsights={setShowInsights} />

      <motion.div
        variants={ANIMATION_VARIANTS.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={ANIMATION_VARIANTS.item}>
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

        <motion.div variants={ANIMATION_VARIANTS.item}>
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

        <motion.div variants={ANIMATION_VARIANTS.item}>
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

        <motion.div variants={ANIMATION_VARIANTS.item}>
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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
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
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Learning</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Users Analytics</h3>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Content Analytics</h3>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Learning Analytics</h3>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
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
  )
}
