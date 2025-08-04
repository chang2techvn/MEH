"use client"

import { motion } from "framer-motion"

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
}

export function SkeletonAssistantCard() {
  return (
    <motion.div variants={itemVariants}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-5 h-[280px] animate-pulse">
        <div className="flex space-x-4 items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex space-x-2">
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </motion.div>
  )
}
