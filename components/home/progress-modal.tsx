"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { X, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserProgress } from "@/hooks/use-user-progress"
import { formatNumberShort } from "@/lib/utils"

interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProgressModal({ isOpen, onClose }: ProgressModalProps) {
  const { progressData, loading, error } = useUserProgress()

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[90%] max-w-sm sm:max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-800/20 rounded-2xl sm:rounded-xl mx-auto my-auto">
          <DialogHeader className="flex items-center">
            <DialogTitle className="mr-auto text-lg sm:text-xl font-bold">Your Progress</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="p-2">
            <div className="flex justify-between mb-4">
              <Skeleton className="h-6 w-24" />
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
            <div className="mt-6 pt-4 border-t">
              <Skeleton className="h-4 w-20 mb-4" />
              <div className="flex justify-between">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="w-8 h-8 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !progressData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[90%] max-w-sm sm:max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-800/20 rounded-2xl sm:rounded-xl mx-auto my-auto">
          <DialogHeader className="flex items-center">
            <DialogTitle className="mr-auto text-lg sm:text-xl font-bold">Your Progress</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="text-center text-red-500 p-4">
            <p>Error loading progress data</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Use daily streak data from hook
  const weeklyStreak = progressData.dailyStreakData.weeklyActivity

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="w-[90%] max-w-sm sm:max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-800/20 rounded-2xl sm:rounded-xl mx-auto my-auto">
            <DialogHeader className="flex items-center">
              <div className="flex items-center gap-2 sm:gap-3 mr-auto">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                  <TrendingUp className="relative h-4 w-4 sm:h-5 sm:w-5 text-neo-mint dark:text-purist-blue" />
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold">Your Progress</DialogTitle>
              </div>
              <Badge className="bg-gradient-to-r from-neo-mint to-purist-blue text-white border-0 shadow-glow-sm">
                Level {progressData.level}
              </Badge>
            </DialogHeader>
            
            <div className="p-4">
              {/* Streak Section */}
              <div className="mt-2 pt-2 border-t border-white/20 dark:border-gray-700/20">
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
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                            ${day.isToday
                              ? day.hasDaily 
                                ? "bg-gradient-to-br from-neo-mint to-purist-blue text-white shadow-glow-sm border-2 border-purist-blue"
                                : "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-glow-sm border-2 border-red-500"
                              : day.isPast
                                ? day.hasDaily
                                  ? "bg-neo-mint/80 text-white"
                                  : "bg-gray-400 dark:bg-gray-600 text-white opacity-50"
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

              {/* Stats Grid - 2x2 on mobile */}
              <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700/20">
                <div className="grid grid-cols-2 gap-3">
                  <motion.div 
                    className="text-center p-3 bg-white/40 dark:bg-gray-800/40 rounded-2xl shadow-sm"
                  >
                    <p className="text-base sm:text-lg font-bold text-neo-mint dark:text-purist-blue" title={`${progressData.totalPoints} points`}>
                      {formatNumberShort(progressData.totalPoints)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Points</p>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-white/40 dark:bg-gray-800/40 rounded-2xl shadow-sm"
                  >
                    <p className="text-base sm:text-lg font-bold text-neo-mint dark:text-purist-blue" title={`${progressData.weeklyPoints} points this week`}>
                      {formatNumberShort(progressData.weeklyPoints)}
                    </p>
                    <p className="text-xs text-muted-foreground">Week Points</p>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-white/40 dark:bg-gray-800/40 rounded-2xl shadow-sm"
                  >
                    <p className="text-base sm:text-lg font-bold text-neo-mint dark:text-purist-blue" title={`${progressData.latestPostPoints} points from latest post`}>
                      {formatNumberShort(progressData.latestPostPoints)}
                    </p>
                    <p className="text-xs text-muted-foreground">Latest Post</p>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 bg-white/40 dark:bg-gray-800/40 rounded-2xl shadow-sm"
                  >
                    <p className="text-base sm:text-lg font-bold text-neo-mint dark:text-purist-blue">
                      {progressData.completedChallenges}/{progressData.totalChallenges}
                    </p>
                    <p className="text-xs text-muted-foreground">Challenges</p>
                  </motion.div>
                </div>
              </div>

              {/* Progress to next level */}
              <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700/20">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs sm:text-sm font-medium">Progress to Level {progressData.level + 1}</h3>
                  <span className="text-xs text-muted-foreground font-semibold">{progressData.levelProgress}%</span>
                </div>
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressData.levelProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-neo-mint to-purist-blue" 
                  />
                </div>
              </div>

              {/* Footer with close button */}
              <div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-700/20 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 rounded-full px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
