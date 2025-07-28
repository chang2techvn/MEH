"use client"

import { motion } from "framer-motion"
import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"
import { useUserProgress } from "@/hooks/use-user-progress"
import { formatNumberShort } from "@/lib/utils"


export function ProgressSection() {
  const { progressData, loading, error, refetch } = useUserProgress()

  // Listen for potential updates (you can call this from parent components)
  useEffect(() => {
    const handleRefresh = () => {
      refetch()
    }

    // Listen for custom events to refresh progress
    window.addEventListener('refreshProgress', handleRefresh)
    return () => window.removeEventListener('refreshProgress', handleRefresh)
  }, [refetch])

  if (loading) {
    return (
      <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-700/20">
            <Skeleton className="h-4 w-20 mb-4" />
            <div className="flex justify-between">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
        <div className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading progress data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  // Use daily streak data from hook instead of generating locally
  const weeklyStreak = progressData.dailyStreakData.weeklyActivity

  return (
    <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
              <TrendingUp className="relative h-5 w-5 text-neo-mint dark:text-purist-blue" />
            </div>
            <h2 className="text-lg font-bold">Your Progress</h2>
          </div>
          <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0 shadow-glow-sm">
            Level {progressData.level}
          </Badge>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-700/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Daily Streak</h3>
            <span className="text-xs text-muted-foreground">{progressData.streakDays} days</span>
          </div>
          <div className="flex justify-between">
            {weeklyStreak.map((day, i) => {
              const dayNumber = new Date(day.date).getDate()
              return (
                <div key={i} className="flex flex-col items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1
                      ${day.isToday
                        ? day.hasDaily 
                          ? "bg-gradient-to-br from-neo-mint to-purist-blue text-white shadow-glow-sm border-2 border-purist-blue"
                          : "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-glow-sm border-2 border-red-500"
                        : day.isPast
                          ? day.hasDaily
                            ? "bg-neo-mint/80 text-white"
                            : "bg-gray-400 dark:bg-gray-600 text-white opacity-50" // Missed day - gray
                          : day.isFuture
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"}
                    `}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    title={day.hasDaily ? `Daily challenge completed on ${day.date}` : day.isPast ? `Missed daily challenge on ${day.date}` : `Upcoming: ${day.date}`}
                  >
                    <span className="text-xs font-bold">{dayNumber}</span>
                  </motion.div>
                  <span className={`text-xs ${day.isFuture ? "text-gray-400 dark:text-gray-600" : ""}`}>
                    {day.dayOfWeek}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Additional stats - 4 columns in one row */}
        <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700/20">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-neo-mint dark:text-purist-blue" title={`${progressData.totalPoints} points`}>
                {formatNumberShort(progressData.totalPoints)}
              </p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-neo-mint dark:text-purist-blue" title={`${progressData.weeklyPoints} points this week`}>
                {formatNumberShort(progressData.weeklyPoints)}
              </p>
              <p className="text-xs text-muted-foreground">Week Points</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-neo-mint dark:text-purist-blue" title={`${progressData.latestPostPoints} points from latest post`}>
                {formatNumberShort(progressData.latestPostPoints)}
              </p>
              <p className="text-xs text-muted-foreground">Latest Post</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-neo-mint dark:text-purist-blue">
                {progressData.completedChallenges}/{progressData.totalChallenges}
              </p>
              <p className="text-xs text-muted-foreground">Challenges</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
