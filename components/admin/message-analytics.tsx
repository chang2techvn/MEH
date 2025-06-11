"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart2, X, Calendar, ArrowUpRight, MessageSquare, Clock, Users, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dbHelpers } from "@/lib/supabase"

interface MessageAnalyticsProps {
  isOpen: boolean
  onClose: () => void
}

interface MessageStats {
  totalMessages: number
  averageResponseTime: number
  activeUsers: number
  resolutionRate: number
  messageCategories: { category: string; percentage: number; color: string }[]
}

export function MessageAnalytics({ isOpen, onClose }: MessageAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [stats, setStats] = useState<MessageStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMessageStats()
    }
  }, [isOpen, timeRange])

  const loadMessageStats = async () => {    setLoading(true)
    try {
      const messagesResult = await dbHelpers.getMessages()
      const usersResult = await dbHelpers.getUsers()
      
      const messages = messagesResult.data || []
      const users = usersResult.data || []
      
      // Calculate date range
      const now = new Date()
      const daysBack = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
      
      // Filter messages within time range
      const recentMessages = messages.filter(m => 
        m.created_at && new Date(m.created_at) >= startDate
      )
      
      // Calculate active users (who sent messages recently)
      const activeUserIds = new Set(recentMessages.map(m => m.sender_id))
      
      // Calculate average response time (mock calculation for now - would need conversation threading)
      const avgResponseTime = recentMessages.length > 0 
        ? Math.round((Math.random() * 2 + 1) * 10) / 10 // 1-3 hours range
        : 0
        
      // Calculate resolution rate based on read status
      const totalMessages = recentMessages.length
      const readMessages = recentMessages.filter(m => m.is_read).length
      const resolutionRate = totalMessages > 0 ? Math.round((readMessages / totalMessages) * 100) : 0
      
      // Calculate message categories (simulate based on content analysis)
      const categories = [
        { category: "Technical Support", percentage: 35, color: "from-neo-mint to-purist-blue" },
        { category: "Assignment Help", percentage: 28, color: "from-purist-blue to-cassis" },
        { category: "Course Questions", percentage: 20, color: "from-cassis to-cantaloupe" },
        { category: "Billing & Account", percentage: 12, color: "from-cantaloupe to-mellow-yellow" },
        { category: "Other", percentage: 5, color: "from-mellow-yellow to-neo-mint" }
      ]
      
      setStats({
        totalMessages,
        averageResponseTime: avgResponseTime,
        activeUsers: activeUserIds.size,
        resolutionRate,
        messageCategories: categories
      })
    } catch (error) {
      console.error('Error loading message stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 300 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l shadow-lg z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center">
            <BarChart2 className="h-5 w-5 mr-2" />
            Message Analytics
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 border-b flex items-center justify-between">
          <Tabs defaultValue="overview" className="w-auto">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="7d" onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>        <div className="p-4 overflow-auto h-full">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <AnalyticsCard
                  title="Total Messages"
                  value={stats?.totalMessages.toLocaleString() || "0"}
                  change="+14.2%"
                  icon={<MessageSquare className="h-5 w-5 text-purist-blue" />}
                />
                <AnalyticsCard
                  title="Response Time"
                  value={`${stats?.averageResponseTime || 0} hrs`}
                  change="-18.5%"
                  isPositive={true}
                  icon={<Clock className="h-5 w-5 text-neo-mint" />}
                />
                <AnalyticsCard
                  title="Active Users"
                  value={stats?.activeUsers.toLocaleString() || "0"}
                  change="+7.1%"
                  icon={<Users className="h-5 w-5 text-cassis" />}
                />
                <AnalyticsCard
                  title="Resolution Rate"
                  value={`${stats?.resolutionRate || 0}%`}
                  change="+2.3%"
                  icon={<CheckCircle className="h-5 w-5 text-mellow-yellow" />}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Message Volume</h3>                  <div className="bg-muted rounded-lg p-4 h-64 flex items-center justify-center border border-border/50">
                    <MessageVolumeChart timeRange={timeRange} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Response Time Trends</h3>
                  <div className="bg-muted rounded-lg p-4 h-64 flex items-center justify-center border border-border/50">
                    <ResponseTimeChart timeRange={timeRange} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Top Message Categories</h3>
                  <div className="bg-muted rounded-lg p-4 border border-border/50">
                    <div className="space-y-3">
                      {stats?.messageCategories.map((category, index) => (
                        <CategoryBar 
                          key={index}
                          category={category.category} 
                          percentage={category.percentage} 
                          color={category.color} 
                        />
                      )) || (
                        <div className="text-center text-muted-foreground py-4">
                          No data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface AnalyticsCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  isPositive?: boolean
}

function AnalyticsCard({ title, value, change, icon, isPositive = false }: AnalyticsCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="border border-border/50 hover:border-border/80 transition-colors shadow-sm hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background shadow-sm">
              {icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div
                  className={`flex items-center text-xs font-medium ${
                    isPositive ? "text-green-500" : change.startsWith("+") ? "text-green-500" : "text-red-500"
                  }`}
                >
                  <ArrowUpRight
                    className={`h-3 w-3 mr-1 ${
                      (isPositive && change.startsWith("+")) || (!isPositive && change.startsWith("-"))
                        ? ""
                        : "rotate-180"
                    }`}
                  />
                  {change}
                </div>
              </div>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface MessageVolumeChartProps {
  timeRange: string
}

function MessageVolumeChart({ timeRange }: MessageVolumeChartProps) {
  // This would be replaced with a real chart library like recharts
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 500 200">
        <defs>
          <linearGradient id="messageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--neo-mint))" />
            <stop offset="100%" stopColor="hsl(var(--purist-blue))" />
          </linearGradient>
        </defs>

        {/* X and Y axes */}
        <line x1="50" y1="170" x2="450" y2="170" stroke="currentColor" strokeOpacity="0.2" />
        <line x1="50" y1="30" x2="50" y2="170" stroke="currentColor" strokeOpacity="0.2" />

        {/* Chart line */}
        <path
          d="M50,120 C100,140 150,80 200,100 S250,60 300,40 S350,70 400,50 L400,170 L50,170 Z"
          fill="url(#messageGradient)"
          fillOpacity="0.2"
          stroke="none"
        />
        <path
          d="M50,120 C100,140 150,80 200,100 S250,60 300,40 S350,70 400,50"
          fill="none"
          stroke="url(#messageGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        <circle cx="50" cy="120" r="4" fill="hsl(var(--neo-mint))" />
        <circle cx="100" cy="140" r="4" fill="hsl(var(--neo-mint))" />
        <circle cx="150" cy="80" r="4" fill="hsl(var(--neo-mint))" />
        <circle cx="200" cy="100" r="4" fill="hsl(var(--purist-blue))" />
        <circle cx="250" cy="60" r="4" fill="hsl(var(--purist-blue))" />
        <circle cx="300" cy="40" r="4" fill="hsl(var(--purist-blue))" />
        <circle cx="350" cy="70" r="4" fill="hsl(var(--purist-blue))" />
        <circle cx="400" cy="50" r="4" fill="hsl(var(--purist-blue))" />
      </svg>
      <p className="text-xs text-muted-foreground mt-2">
        Message volume over the last{" "}
        {timeRange === "24h" ? "24 hours" : timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"}
      </p>
    </div>
  )
}

interface ResponseTimeChartProps {
  timeRange: string
}

function ResponseTimeChart({ timeRange }: ResponseTimeChartProps) {
  // This would be replaced with a real chart library like recharts
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 500 200">
        <defs>
          <linearGradient id="responseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--cassis))" />
            <stop offset="100%" stopColor="hsl(var(--cantaloupe))" />
          </linearGradient>
        </defs>

        {/* X and Y axes */}
        <line x1="50" y1="170" x2="450" y2="170" stroke="currentColor" strokeOpacity="0.2" />
        <line x1="50" y1="30" x2="50" y2="170" stroke="currentColor" strokeOpacity="0.2" />

        {/* Chart bars */}
        <rect x="70" y="70" width="30" height="100" rx="4" fill="url(#responseGradient)" />
        <rect x="120" y="90" width="30" height="80" rx="4" fill="url(#responseGradient)" />
        <rect x="170" y="60" width="30" height="110" rx="4" fill="url(#responseGradient)" />
        <rect x="220" y="100" width="30" height="70" rx="4" fill="url(#responseGradient)" />
        <rect x="270" y="80" width="30" height="90" rx="4" fill="url(#responseGradient)" />
        <rect x="320" y="50" width="30" height="120" rx="4" fill="url(#responseGradient)" />
        <rect x="370" y="40" width="30" height="130" rx="4" fill="url(#responseGradient)" />
      </svg>
      <p className="text-xs text-muted-foreground mt-2">
        Average response time over the last{" "}
        {timeRange === "24h" ? "24 hours" : timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"}
      </p>
    </div>
  )
}

interface CategoryBarProps {
  category: string
  percentage: number
  color: string
}

function CategoryBar({ category, percentage, color }: CategoryBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{category}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-background rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  )
}
