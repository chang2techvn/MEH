import type React from "react"
export interface AnalyticsData {
  totalUsers: number
  activeChallenges: number
  completionRate: number
  avgEngagementTime: string
}

export interface UserGrowthData {
  month: string
  users: number
  previousUsers: number
}

export interface ChallengeCompletionData {
  challenge: string
  completed: number
  target: number
  color: string
}

export interface UserLevelDistribution {
  level: string
  count: number
  percentage: number
  color: string
}

export interface EngagementByTimeData {
  hour: string
  users: number
  previousUsers: number
}

export interface SkillImprovementData {
  skill: string
  improvement: number
  previousImprovement: number
  trend: "up" | "down"
}

export interface TopPerformingVideo {
  id: string
  title: string
  views: number
  completionRate: number
  avgWatchTime: number
  trend: "up" | "down"
  trendPercentage: number
}

export interface RetentionCohortData {
  cohort: string
  day1: number
  day7: number
  day14: number
  day30: number
  day60: number
  day90: number
}

export interface LearningPathData {
  path: string
  users: number
  completionRate: number
  satisfaction: number
}

export interface DateRange {
  today: string
  yesterday: string
  last7days: string
  last30days: string
  thisMonth: string
  lastMonth: string
  thisYear: string
  custom: string
}

export interface TabValue {
  overview: string
  users: string
  content: string
  learning: string
}

export interface ChartData {
  data: any[]
  isLoading?: boolean
}

export interface StatCardProps {
  title: string
  value: string | number
  trend?: "up" | "down" | "neutral"
  trendValue?: string | number
  description?: string
  icon: React.ReactNode
  isLoading?: boolean
}

export interface ExpandableCardProps {
  title: string
  description?: string
  children: React.ReactNode
  icon: React.ReactNode
  isLoading?: boolean
  className?: string
}
