"use client"

import { motion } from "framer-motion"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrentChallengeSection } from "./current-challenge-section"
import { useCurrentChallenge } from "@/hooks/use-current-challenge"

interface MainContentProps {
  newPostAdded?: boolean
  setNewPostAdded?: (value: boolean) => void
  isExpanded?: boolean // Indicates if this is expanded (sidebar collapsed)
  showToggle?: boolean
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

const LoadingFallback = () => (
  <div className="space-y-4 sm:space-y-6">
    <Skeleton className="h-72 sm:h-80 lg:h-96 w-full rounded-xl" />
    <Skeleton className="h-96 sm:h-[32rem] lg:h-[40rem] w-full rounded-xl" />
  </div>
)

export function MainContent({ newPostAdded, setNewPostAdded, isExpanded = false, showToggle, sidebarCollapsed, onToggleSidebar }: MainContentProps) {
  const { 
    currentChallenge, 
    challengeLoading 
  } = useCurrentChallenge()

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
      className={`space-y-4 sm:space-y-6 transition-all duration-500 ease-in-out ${
        isExpanded 
          ? "flex-1 max-w-full" // Take available width when expanded (sidebar collapsed)
          : "flex-1 max-w-none" // Flexible width when sidebar is shown
      }`}
      variants={container}
      initial="hidden"
      animate="show"
      layout
      layoutRoot
    >
      <motion.div variants={item} layout>        
        <Suspense fallback={<Skeleton className="h-72 sm:h-80 lg:h-96 w-full rounded-xl" />}>
          <CurrentChallengeSection 
            currentChallenge={currentChallenge}
            challengeLoading={challengeLoading}
            showToggle={showToggle}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={onToggleSidebar}
          />
        </Suspense>
      </motion.div>
    </motion.div>
  )
}
