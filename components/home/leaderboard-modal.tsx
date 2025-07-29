"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award, Trophy, Flame, Target, Calendar, TrendingUp } from "lucide-react"
import { dbHelpers } from "@/lib/supabase"

interface LeaderboardUser {
  id: string
  name: string
  avatar?: string
  rank: number
  points: number
  level: string
  streak: number
  challengesCompleted: number
  weekPoints: number
}

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

type LeaderboardTab = "top10" | "totalPoints" | "weekPoints"

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("top10")
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  // Load leaderboard data
  useEffect(() => {
    if (!isOpen) return

    const loadLeaderboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch comprehensive leaderboard data
        const { data: rawData, error } = await dbHelpers.getExtendedLeaderboard()
        
        if (error) {
          console.error('Error loading leaderboard:', error)
          return
        }

        const transformedData: LeaderboardUser[] = (rawData || []).map((user: any, index: number) => {
          console.log('🔍 Processing user:', user)
          
          // Handle different possible profile structures
          let profile = null
          if (user.profiles && Array.isArray(user.profiles) && user.profiles.length > 0) {
            profile = user.profiles[0]
          } else if (user.profiles && !Array.isArray(user.profiles)) {
            profile = user.profiles
          }
          
          const fullName = profile?.full_name || 'Unknown User'
          const avatarUrl = profile?.avatar_url
          
          console.log('🔍 Extracted profile data:', { fullName, avatarUrl, profile })

          return {
            id: user.id,
            name: fullName,
            avatar: avatarUrl,
            rank: index + 1,
            points: user.points || 0,
            level: user.level || 'Beginner',
            streak: user.streak_days || 0,
            challengesCompleted: user.challenges_completed || 0,
            weekPoints: user.week_points || 0
          }
        })

        setUsers(transformedData)
      } catch (error) {
        console.error('Error loading leaderboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboardData()
  }, [isOpen])

  // Sort users based on active tab
  const getSortedUsers = () => {
    let sorted = [...users]
    
    switch (activeTab) {
      case "top10":
        // Sort by Daily Streak first (desc), then by points (desc), then by challenges (desc)
        sorted.sort((a, b) => {
          if (a.streak !== b.streak) return b.streak - a.streak
          if (a.points !== b.points) return b.points - a.points
          return b.challengesCompleted - a.challengesCompleted
        })
        return sorted.slice(0, 10)
      case "totalPoints":
        // Sort by total points (desc)
        sorted.sort((a, b) => b.points - a.points)
        return sorted.slice(0, 20)
      case "weekPoints":
        // Sort by week points (desc)
        sorted.sort((a, b) => b.weekPoints - a.weekPoints)
        return sorted.slice(0, 20)
      default:
        return sorted
    }
  }

  const sortedUsers = getSortedUsers()

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
  }

  const getTabIcon = (tab: LeaderboardTab) => {
    switch (tab) {
      case "top10":
        return <Flame className="h-4 w-4" />
      case "totalPoints":
        return <Target className="h-4 w-4" />
      case "weekPoints":
        return <Calendar className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTabLabel = (tab: LeaderboardTab) => {
    switch (tab) {
      case "top10":
        return "Top 10"
      case "totalPoints":
        return "Total Points"
      case "weekPoints":
        return "Week Points"
      default:
        return ""
    }
  }

  const getMetricValue = (user: LeaderboardUser) => {
    switch (activeTab) {
      case "top10":
        return `${user.points} pts`
      case "totalPoints":
        return `${user.points} points`
      case "weekPoints":
        return `${user.weekPoints} pts`
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-sm sm:max-w-2xl h-[80vh] sm:h-[85vh] flex flex-col overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 dark:border-gray-800/20 mx-auto my-auto rounded-2xl sm:rounded-xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-neo-mint to-purist-blue bg-clip-text text-transparent">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-mellow-yellow to-cantaloupe blur-sm opacity-70"></div>
              <TrendingUp className="relative h-5 w-5 sm:h-6 sm:w-6 text-mellow-yellow dark:text-cantaloupe" />
            </div>
            Global Leaderboard
          </DialogTitle>
        </DialogHeader>

        {/* Content Area - Scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex justify-center sm:justify-start flex-wrap gap-2 mb-4 flex-shrink-0 px-1">
            {(["top10", "totalPoints", "weekPoints"] as LeaderboardTab[]).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 rounded-full ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-neo-mint to-purist-blue text-white"
                    : "bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {getTabIcon(tab)}
                <span className="hidden sm:inline">{getTabLabel(tab)}</span>
                <span className="sm:hidden">{getTabLabel(tab).split(' ')[0]}</span>
              </Button>
            ))}
          </div>

          {/* Description */}
          <div className="mb-4 p-3 rounded-xl bg-white/10 dark:bg-gray-800/10 flex-shrink-0 mx-1">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {activeTab === "top10" && 
                "Top performers ranked by Daily Streak, Points, and Challenges"}
              {activeTab === "totalPoints" && 
                "Users ranked by total accumulated points from all challenges"}
              {activeTab === "weekPoints" && 
                "Weekly leaderboard showing points earned in the last 7 days"}
            </p>
          </div>

          {/* Leaderboard List - Scrollable Area */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3 pb-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/10 dark:bg-gray-800/10">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : sortedUsers.length > 0 ? (
                <AnimatePresence mode="wait">
                  {sortedUsers.map((user, index) => (
                    <motion.div
                      key={`${activeTab}-${user.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-xl bg-white/10 dark:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200"
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
                        {getRankIcon(index + 1)}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 sm:h-12 sm:w-12 border-2 border-white dark:border-gray-800 shrink-0">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white text-xs sm:text-sm">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs sm:text-base truncate max-w-[120px] sm:max-w-full">{user.name}</p>
                          <div className="flex items-center gap-1 sm:gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs px-1 sm:px-2 py-0 h-4 sm:h-5 bg-white/20 dark:bg-gray-800/20 shrink-0"
                            >
                              {user.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate max-w-[60px] sm:max-w-full">
                              {user.challengesCompleted} challenges
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metric - Compact UI */}
                      <div className="flex flex-col items-end gap-0.5 ml-1 sm:ml-0">
                        {/* Points */}
                        <div className="flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all duration-200">
                          <Trophy className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-amber-500" />
                          <span className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400">
                            {getMetricValue(user)}
                          </span>
                        </div>
                        
                        {/* Day Streak (only for top10 tab) */}
                        {activeTab === "top10" && (
                          <div className="flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded-md bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 group-hover:from-emerald-500/30 group-hover:to-green-500/30 transition-all duration-200">
                            <Flame className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-emerald-500" />
                            <span className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <span className="hidden sm:inline">{user.streak} day streak</span>
                              <span className="sm:hidden">{user.streak}d</span>
                            </span>
                          </div>
                        )}
                        
                        {/* Week indicator for weekPoints tab */}
                        {activeTab === "weekPoints" && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 group-hover:from-blue-500/30 group-hover:to-indigo-500/30 transition-all duration-200">
                            <Calendar className="h-2.5 w-2.5 text-blue-500" />
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              <span className="hidden sm:inline">This week</span>
                              <span className="sm:hidden">Week</span>
                            </span>
                          </div>
                        )}
                        
                        {/* Total indicator for totalPoints tab */}
                        {activeTab === "totalPoints" && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-200">
                            <Target className="h-2.5 w-2.5 text-purple-500" />
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                              <span className="hidden sm:inline">All time</span>
                              <span className="sm:hidden">Total</span>
                            </span>
                          </div>
                        )}
                        
                        {/* Rank indicator */}
                        <div className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-200">
                          <span className="hidden sm:inline">Rank #{index + 1}</span>
                          <span className="sm:hidden">#{index + 1}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No leaderboard data available</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-center sm:justify-between items-center pt-4 border-t border-white/10 dark:border-gray-800/10">
          <p className="text-xs text-muted-foreground text-center">
            Updated every hour • {sortedUsers.length} users shown
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 rounded-full px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
