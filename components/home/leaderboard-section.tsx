"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award } from "lucide-react"

interface LeaderboardUser {
  id: string
  name: string
  avatar?: string
  rank: number
  points: number
  level: string
  streak: number
}

interface LeaderboardSectionProps {
  users?: LeaderboardUser[]
  loading?: boolean
  onViewAll?: () => void
}

export function LeaderboardSection({ users = [], loading = false, onViewAll }: LeaderboardSectionProps) {
  return (
    <Card className="neo-card overflow-hidden border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-neo">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-mellow-yellow to-cantaloupe blur-sm opacity-70"></div>
            <Award className="relative h-5 w-5 text-mellow-yellow dark:text-cantaloupe" />
          </div>
          <h2 className="text-lg font-bold">Top Contributors</h2>
        </div>

        <ScrollArea className="h-[220px] pr-4">
          <div className="space-y-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))
            ) : users.length > 0 ? (
              users.map((user, i) => (
                <motion.div
                  key={user.id || i}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-vibrant-orange to-cantaloupe blur-sm opacity-70"></div>
                      <div className="relative flex">
                        <Avatar className="border-2 border-white dark:border-gray-800">
                          <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-vibrant-orange to-cantaloupe text-white">
                            {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md">
                          <span className="text-[10px] font-bold text-vibrant-orange dark:text-cantaloupe">
                            #{user.rank}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{user.name || 'Unknown User'}</p>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="text-xs px-1 py-0 h-4 bg-white/20 dark:bg-gray-800/20"
                        >
                          {user.level || 'Beginner'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">• {user.streak || 0} day streak</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.points || 0}</span>
                    <span className="text-xs text-muted-foreground">pts</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No leaderboard data available</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <Button
          variant="outline"
          className="w-full mt-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-800/30"
          onClick={onViewAll}
        >
          View All Leaderboard
        </Button>
      </div>
    </Card>
  )
}
