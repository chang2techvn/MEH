"use client"

import { motion } from "framer-motion"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ProgressSection } from "./progress-section"
import { LeaderboardSection } from "./leaderboard-section"
import { useLeaderboard } from "@/hooks/use-leaderboard"

interface SidebarProps {
  onPracticeToolClick?: (tool: string) => void
  onViewLeaderboard?: () => void
}

export function Sidebar({onViewLeaderboard }: SidebarProps) {
  const { leaderboardData, leaderboardLoading } = useLeaderboard()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
  }

  return (
    <motion.div 
      className="space-y-6" 
      variants={container} 
      initial="hidden" 
      animate="show" 
      layout 
      layoutRoot
    >
      <motion.div variants={item} layout>
        <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
          <ProgressSection />
        </Suspense>
      </motion.div>

      <motion.div variants={item} layout>
        <Suspense fallback={<Skeleton className="h-[350px] w-full rounded-xl" />}>
          <LeaderboardSection 
            users={leaderboardData} 
            loading={leaderboardLoading}
            onViewAll={onViewLeaderboard}
          />
        </Suspense>
      </motion.div>
    </motion.div>
  )
}
