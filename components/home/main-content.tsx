"use client"

import { motion } from "framer-motion"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrentChallengeSection } from "./current-challenge-section"
import { useCurrentChallenge } from "@/hooks/use-current-challenge"

interface MainContentProps {
  newPostAdded?: boolean
  setNewPostAdded?: (value: boolean) => void
}

const LoadingFallback = () => (
  <div className="space-y-6">
    <Skeleton className="h-300 w-full rounded-xl" />
    <Skeleton className="h-600 w-full rounded-xl" />
  </div>
)

export function MainContent({ newPostAdded, setNewPostAdded }: MainContentProps) {
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
      className="md:col-span-2 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
      layout
      layoutRoot
    >
      <motion.div variants={item} layout>        
        <Suspense fallback={<Skeleton className="h-300 w-full rounded-xl" />}>
          <CurrentChallengeSection 
            currentChallenge={currentChallenge}
            challengeLoading={challengeLoading}
          />
        </Suspense>
      </motion.div>
    </motion.div>
  )
}
