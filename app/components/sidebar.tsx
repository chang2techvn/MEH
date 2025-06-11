"use client"

import { motion } from "framer-motion"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ProgressSection } from "./progress-section"
import { UpcomingDeadlinesSection } from "./upcoming-deadlines-section"
import { LeaderboardSection } from "./leaderboard-section"
import { PracticeToolsSection } from "./practice-tools-section"
import { useLeaderboard } from "@/app/hooks/use-leaderboard"

interface SidebarProps {
  onPracticeToolClick?: (tool: string) => void
  onViewLeaderboard?: () => void
}

const LoadingFallback = () => (
  <div className="space-y-6">
    <Skeleton className="h-400 w-full rounded-xl" />
    <Skeleton className="h-300 w-full rounded-xl" />
    <Skeleton className="h-350 w-full rounded-xl" />
    <Skeleton className="h-250 w-full rounded-xl" />
  </div>
)

export function Sidebar({ onPracticeToolClick, onViewLeaderboard }: SidebarProps) {
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
        <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
          <UpcomingDeadlinesSection />
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

      <motion.div variants={item} layout>
        <Suspense fallback={<Skeleton className="h-[250px] w-full rounded-xl" />}>
          <PracticeToolsSection onToolClick={onPracticeToolClick} />
        </Suspense>
      </motion.div>
    </motion.div>
  )
}
