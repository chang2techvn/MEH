"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"
import { useUserProgress } from "@/hooks/use-user-progress"


export function ProgressSection() {
  const { progressData, loading, error } = useUserProgress()

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



  // Generate daily streak visualization for current week (Mon-Sun)
  const generateWeeklyStreak = () => {
    const today = new Date()
    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    // Calculate Monday of current week
    const weekStart = new Date(today)
    const day = today.getDay()
    // JS: Sunday=0, Monday=1, ...
    const diffToMonday = (day === 0 ? -6 : 1) - day
    weekStart.setDate(today.getDate() + diffToMonday)
    const streak = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const isToday = date.toDateString() === today.toDateString()
      const isPast = date < today && !isToday
      const isFuture = date > today
      streak.push({
        day: date.getDate(),
        dayOfWeek: daysOfWeek[i],
        isToday,
        isPast,
        isFuture
      })
    }
    return streak
  }
  const weeklyStreak = generateWeeklyStreak()

  return (
    <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
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

        <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-700/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Daily Streak</h3>
            <span className="text-xs text-muted-foreground">{progressData.streakDays} days</span>
          </div>
          <div className="flex justify-between">
            {weeklyStreak.map((day, i) => (
              <div key={i} className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1
                    ${day.isToday
                      ? "bg-gradient-to-br from-neo-mint to-purist-blue text-white shadow-glow-sm border-2 border-purist-blue"
                      : day.isPast
                        ? "bg-neo-mint/80 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"}
                  `}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="text-xs font-bold">{day.day}</span>
                </motion.div>
                <span className={`text-xs ${day.isFuture ? "text-gray-400 dark:text-gray-600" : ""}`}>{day.dayOfWeek}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional stats */}
        <div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-700/20">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-neo-mint dark:text-purist-blue">{progressData.totalPoints}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
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
