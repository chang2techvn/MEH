"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TrendingUp, Trophy } from "lucide-react"
import { ProgressModal } from "@/components/home/progress-modal"
import { LeaderboardModal } from "@/components/home/leaderboard-modal"

export function MobileHeaderButtons() {
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false)
  const router = useRouter()
  
  // Simulate notification badges - in a real app this would be driven by actual updates
  const [hasProgressUpdate, setHasProgressUpdate] = useState(true)
  const [hasLeaderboardUpdate, setHasLeaderboardUpdate] = useState(true)
  
  const handleProgressClick = () => {
    setProgressModalOpen(true)
    setHasProgressUpdate(false)
  }
  
  const handleLeaderboardClick = () => {
    setLeaderboardModalOpen(true)
    setHasLeaderboardUpdate(false)
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="relative group hover:bg-muted transition-colors"
                onClick={handleProgressClick}
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
                <TrendingUp className="relative h-5 w-5 text-neo-mint dark:text-purist-blue" />
                <span className="sr-only">Your Progress</span>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Your Progress</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="relative group hover:bg-muted transition-colors"
                onClick={handleLeaderboardClick}
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-0 group-hover:opacity-70 transition-opacity"></div>
                <Trophy className="relative h-5 w-5 text-mellow-yellow dark:text-cantaloupe" />
                <span className="sr-only">Top Contributors</span>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Top Contributors</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Progress Modal */}
      <ProgressModal 
        isOpen={progressModalOpen} 
        onClose={() => setProgressModalOpen(false)} 
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal 
        isOpen={leaderboardModalOpen}
        onClose={() => setLeaderboardModalOpen(false)}
      />
    </>
  )
}
