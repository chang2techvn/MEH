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

        const transformedData: LeaderboardUser[] = (rawData || []).map((user: any, index: number) => ({
          id: user.id,
          name: user.profiles?.[0]?.full_name || 'Unknown User',
          avatar: user.profiles?.[0]?.avatar_url,
          rank: index + 1,
          points: user.points || 0,
          level: user.level || 'Beginner',
          streak: user.streak_days || 0,
          challengesCompleted: user.challenges_completed || 0,
          weekPoints: user.week_points || 0
        }))

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
        return `${user.streak} day streak • ${user.points} pts`
      case "totalPoints":
        return `${user.points} points`
      case "weekPoints":
        return `${user.weekPoints} pts this week`
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 dark:border-gray-800/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-mellow-yellow to-cantaloupe blur-sm opacity-70"></div>
              <TrendingUp className="relative h-6 w-6 text-mellow-yellow dark:text-cantaloupe" />
            </div>
            Global Leaderboard
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          {(["top10", "totalPoints", "weekPoints"] as LeaderboardTab[]).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-neo-mint to-purist-blue text-white"
                  : "bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {getTabIcon(tab)}
              {getTabLabel(tab)}
            </Button>
          ))}
        </div>

        {/* Description */}
        <div className="mb-4 p-3 rounded-lg bg-white/10 dark:bg-gray-800/10">
          <p className="text-sm text-muted-foreground">
            {activeTab === "top10" && 
              "Top performers ranked by Daily Streak (primary), Total Points (secondary), and Challenges Completed (tertiary)"}
            {activeTab === "totalPoints" && 
              "Users ranked by their total accumulated points from all challenges"}
            {activeTab === "weekPoints" && 
              "Weekly leaderboard showing points earned in the last 7 days"}
          </p>
        </div>

        {/* Leaderboard List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
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
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/10 dark:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(index + 1)}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-neo-mint to-purist-blue text-white">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0 h-5 bg-white/20 dark:bg-gray-800/20"
                          >
                            {user.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {user.challengesCompleted} challenges
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metric */}
                    <div className="text-right">
                      <p className="text-sm font-medium">{getMetricValue(user)}</p>
                      {activeTab === "top10" && (
                        <p className="text-xs text-muted-foreground">
                          Rank #{index + 1}
                        </p>
                      )}
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

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10 dark:border-gray-800/10">
          <p className="text-xs text-muted-foreground">
            Updated every hour • {sortedUsers.length} users shown
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
