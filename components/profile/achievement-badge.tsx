"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Achievement {
  title: string
  description: string
  earned: boolean | number | undefined
  icon?: string
  color?: string
}

interface AchievementBadgeProps {
  achievement: Achievement
  index: number
}

export default function AchievementBadge({ achievement, index }: AchievementBadgeProps) {
  const isEarned = Boolean(achievement.earned)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-lg border-2 text-center transition-all duration-300 hover:scale-105 ${
        isEarned
          ? "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-300 shadow-lg cursor-pointer"
          : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-50"
      }`}
    >
      <div className={`text-3xl mb-2 transition-all duration-300 ${
        isEarned ? "animate-pulse" : "grayscale"
      }`}>
        {achievement.icon || (isEarned ? "🏆" : "🔒")}
      </div>
      
      <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
      <p className="text-xs text-muted-foreground leading-tight">{achievement.description}</p>
      
      {isEarned && (
        <Badge className="mt-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0 animate-in slide-in-from-bottom-2 duration-300">
          <Check className="w-3 h-3 mr-1" />
          Earned
        </Badge>
      )}
    </motion.div>
  )
}
