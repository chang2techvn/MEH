"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface ProgressSectionProps {
  videosCompleted?: number
  totalVideos?: number
  writingsSubmitted?: number
  totalWritings?: number
  speakingPractice?: number
  totalSpeaking?: number
  level?: number
}

export function ProgressSection({
  videosCompleted = 12,
  totalVideos = 20,
  writingsSubmitted = 8,
  totalWritings = 20,
  speakingPractice = 10,
  totalSpeaking = 20,
  level = 12
}: ProgressSectionProps) {
  const progressItems = [
    {
      label: "Videos Completed",
      current: videosCompleted,
      total: totalVideos,
      percentage: (videosCompleted / totalVideos) * 100
    },
    {
      label: "Writings Submitted",
      current: writingsSubmitted,
      total: totalWritings,
      percentage: (writingsSubmitted / totalWritings) * 100
    },
    {
      label: "Speaking Practice",
      current: speakingPractice,
      total: totalSpeaking,
      percentage: (speakingPractice / totalSpeaking) * 100
    }
  ]

  const dailyStreak = [1, 2, 3, 4, 5, 6, 7]
  const completedDays = 5

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
            Level {level}
          </Badge>
        </div>

        <div className="space-y-6">
          {progressItems.map((item, index) => (
            <div key={item.label}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm font-medium">{item.current}/{item.total}</span>
              </div>
              <div className="w-full h-3 bg-white/40 dark:bg-gray-800/40 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-neo-mint to-purist-blue"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-700/20">
          <h3 className="text-sm font-medium mb-4">Daily Streak</h3>
          <div className="flex justify-between">
            {dailyStreak.map((day, i) => (
              <div key={day} className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    i < completedDays
                      ? "bg-gradient-to-br from-neo-mint to-purist-blue text-white shadow-glow-sm"
                      : "bg-white/20 dark:bg-gray-800/20"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {day}
                </motion.div>
                <span className="text-xs">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
